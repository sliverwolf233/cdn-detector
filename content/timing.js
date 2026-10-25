// 内容脚本:采集主导航时序(Navigation Timing)、HTTP RTT 近似 Ping,并在页面上显示 CDN 角标。
// 幂等:重复注入(声明式 + executeScript)不会重复注册监听。
(function () {
  "use strict";
  if (window.__cdnProbeTimingInjected) return;
  window.__cdnProbeTimingInjected = true;

  function num(x) {
    return (typeof x === "number" && isFinite(x) && x >= 0) ? Math.round(x) : null;
  }

  // 主导航完整时序:DNS / TCP(不含 TLS) / TLS / TTFB / 下载 / 大小 / 协议
  function collect() {
    const nav = performance.getEntriesByType("navigation")[0];
    if (!nav) return null;
    const tcpEnd = nav.secureConnectionStart > 0 ? nav.secureConnectionStart : nav.connectEnd;
    return {
      navType: nav.type || null,
      protocol: nav.nextHopProtocol || null,
      dns: num(nav.domainLookupEnd - nav.domainLookupStart),
      tcp: num(tcpEnd - nav.connectStart),
      tls: nav.secureConnectionStart > 0 ? num(nav.connectEnd - nav.secureConnectionStart) : null,
      ttfb: num(nav.responseStart - nav.requestStart),
      download: num(nav.responseEnd - nav.responseStart),
      domInteractive: num(nav.domInteractive),
      loadComplete: num(nav.loadEventEnd || nav.domComplete),
      transferSize: num(nav.transferSize),
      // transferSize 为 0 且有解码体积 → 本地缓存命中(未发生网络传输)
      browserCache: (nav.transferSize === 0 && nav.decodedBodySize > 0) ? "hit" : (nav.transferSize > 0 ? "miss" : null),
      encodedBodySize: num(nav.encodedBodySize),
      decodedBodySize: num(nav.decodedBodySize),
      collectedAt: Date.now()
    };
  }

  // 单次 HTTP 往返(no-cors 拉取 favicon,带随机参数防缓存)
  async function oneRtt() {
    const url = location.origin + "/favicon.ico?cdnprobe=" + Date.now() + "-" + Math.random().toString(36).slice(2);
    const t0 = performance.now();
    try {
      await fetch(url, { method: "GET", cache: "no-store", mode: "no-cors" });
    } catch (e) { /* 网络错误也计入时长 */ }
    return Math.round(performance.now() - t0);
  }

  async function measurePing() {
    await oneRtt(); // 预热连接,不计入样本
    const samples = [];
    for (let i = 0; i < 3; i++) samples.push(await oneRtt());
    const sorted = samples.slice().sort(function (a, b) { return a - b; });
    return { samples: samples, min: sorted[0], median: sorted[1], max: sorted[2], at: Date.now() };
  }

  // ---------- 页面角标(类似广告拦截器的常驻提示) ----------
  var overlayOn = true;
  var chipState = { summary: null, median: null };

  function noCdnText() {
    var m = "";
    try { m = chrome.i18n.getMessage("chipNoCdn"); } catch (e) {}
    return m || "no CDN";
  }

  function chipText() {
    var s = chipState.summary;
    if (!s) return "";
    if (s.status === "protected") {
      var text = "🛡️ " + (s.badge || s.providerName || "CDN");
      if (s.popCity) text += " · " + s.popCity;
      else if (s.popCode) text += " · " + s.popCode;
      if (typeof chipState.median === "number") text += " · " + chipState.median + "ms";
      return text;
    }
    if (s.status === "maybe") return "🟡 CDN?";
    return "⚪ " + noCdnText();
  }

  function syncChip() {
    var text = chipText();
    var chip = document.getElementById("cdn-probe-chip");
    if (!overlayOn || !text) {
      if (chip) chip.remove();
      return;
    }
    if (!chip) {
      chip = document.createElement("div");
      chip.id = "cdn-probe-chip";
      chip.style.cssText =
        "position:fixed;right:12px;bottom:12px;z-index:2147483646;" +
        "background:rgba(14,21,24,0.82);color:#DEE3E6;" +
        "font:10px/1.4 'Segoe UI','Microsoft YaHei',system-ui,sans-serif;" +
        "padding:3px 9px;border-radius:999px;border:1px solid rgba(99,210,238,0.35);" +
        "opacity:0.55;transition:opacity 0.2s;cursor:default;";
      chip.addEventListener("mouseenter", function () { chip.style.opacity = "1"; });
      chip.addEventListener("mouseleave", function () { chip.style.opacity = "0.55"; });
      document.documentElement.appendChild(chip);
    }
    chip.textContent = text;
  }

  // 角标默认关闭(opt-in);开启后为极简半透明样式,悬停完全显示
  try {
    chrome.storage.local.get("overlayEnabled").then(function (b) {
      overlayOn = b.overlayEnabled === true;
      syncChip();
    });
    chrome.storage.onChanged.addListener(function (changes, area) {
      if (area === "local" && changes.overlayEnabled) {
        overlayOn = changes.overlayEnabled.newValue === true;
        syncChip();
      }
    });
  } catch (e) { /* 存储不可用时保持关闭 */ }

  // ---------- 消息 ----------
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (!msg || typeof msg !== "object") return;
    if (msg.type === "collectTiming") {
      sendResponse({ ok: true, timing: collect() });
      return;
    }
    if (msg.type === "summaryUpdate") {
      chipState.summary = msg.summary || null;
      syncChip();
      sendResponse({ ok: true });
      return;
    }
    if (msg.type === "pingUpdate") {
      chipState.median = (typeof msg.median === "number") ? msg.median : null;
      syncChip();
      sendResponse({ ok: true });
      return;
    }
    if (msg.type === "measurePing") {
      measurePing()
        .then(function (p) { sendResponse({ ok: true, ping: p }); })
        .catch(function (e) { sendResponse({ ok: false, error: String(e && e.message ? e.message : e) }); });
      return true; // 异步回复
    }
  });

  // WAF 拦截提示页启发式(应对 HTTP 200 型拦截):只读 DOM,不上传内容
  function looksLikeWafInterstitial() {
    try {
      if (!document.body) return false;
      var text = ((document.title || "") + " " + (document.body.innerText || "").slice(0, 2000)).toLowerCase();
      var small = (document.body.innerText || "").length < 1500;
      var fewNodes = document.body.querySelectorAll("*").length < 220;
      var strong = /(cf-chl|checking your browser|请求被拦截|请求被防火墙|防火墙拦截|被waf|waf拦截|access denied|安全验证|请完成以下操作|ddos protection|safeline|雷池)/i;
      var weak = /(防火墙|firewall|waf|安全狗|云锁|宝塔|寶塔|challenge|captcha)/i;
      if (strong.test(text)) return true;
      return !!(weak.test(text) && small && fewNodes);
    } catch (e) { return false; }
  }

  // 页面加载完成后上报时序;后台会在响应里带回检测摘要用于角标
  function report() {
    try {
      var p = chrome.runtime.sendMessage({ type: "navTiming", timing: collect(), interstitial: looksLikeWafInterstitial() });
      if (p && p.then) {
        p.then(function (resp) {
          if (resp && resp.summary) { chipState.summary = resp.summary; syncChip(); }
        }).catch(function () {});
      }
    } catch (e) { /* 扩展上下文失效 */ }
  }
  window.addEventListener("load", function () { setTimeout(report, 0); }, { once: true });
  report(); // document_idle 兜底(load 可能已结束)
})();
