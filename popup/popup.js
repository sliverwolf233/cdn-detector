// popup 逻辑:MD3E 界面 + 连接时序 + Ping。全部文案走 chrome.i18n;无 API 环境回退内置简体中文。

const $ = function (id) { return document.getElementById(id); };

// 回退词典:与 _locales/zh_CN/messages.json 保持一致(i18n 测试会校验键集合)
const FALLBACK = {
  "extName": "CDN 探测器",
  "extDesc": "显示当前网站是否由 CDN 保护/加速,以及命中的 CDN 提供商与边缘节点(POP)所在地区。",
  "popupTitle": "🛡️ CDN 探测器",
  "reload": "重新检测",
  "reloadTip": "刷新页面并重新检测",
  "rowProvider": "CDN 提供商",
  "rowPop": "边缘节点 (POP)",
  "rowRegion": "节点地区",
  "rowIp": "服务器 IP",
  "rowAsn": "IP 归属 (ASN)",
  "lookup": "查询 IP 归属地",
  "evidence": "响应头证据",
  "geoToggle": "使用 ip-api.com 查询 IP 归属地(会把所查节点 IP 发给该第三方)",
  "footer": "仅分析主导航的响应头;刷新页面可获取最新结果。",
  "statusWaiting": "等待数据…",
  "statusNoData": "未捕获到响应头 — 请刷新页面",
  "statusProtected": "🛡️ 已接入 CDN",
  "statusMaybe": "🟡 疑似缓存层(未识别厂商)",
  "statusUnknown": "⚪ 未检测到 CDN 特征(可能直连源站)",
  "matchedVia": "(依据: $HEADER$)",
  "asnInferred": "据 IP 归属推断: $NAME$",
  "popNode": "POP 节点: $CITY$",
  "ipOwner": "IP 归属: $LOC$",
  "geoFailed": "归属地查询失败: $ERR$",
  "geoQuerying": "查询中…",
  "geoDisabled": "已关闭 IP 归属地查询(不再向第三方发送 IP)。",
  "busyReloading": "检测中 — 正在刷新页面…",
  "internalPage": "此页面无法检测(浏览器内部页面)",
  "noHeaders": "(无相关响应头)",
  "timingTitle": "连接时序",
  "dnsTime": "DNS 解析",
  "tcpTime": "TCP 握手",
  "tlsTime": "TLS 握手",
  "ttfbLabel": "首字节 (TTFB)",
  "downloadTime": "内容下载",
  "totalTime": "连接合计",
  "transferTitle": "传输与导航",
  "transferLabel": "传输大小",
  "compressionLabel": "压缩比",
  "nodeTitle": "节点与 IP",
  "pingTitle": "Ping (HTTP RTT)",
  "pingMeasure": "测量",
  "pingMeasuring": "测量中…",
  "pingNote": "经 HTTP 往返近似,非 ICMP;预热后取 3 次中位数。",
  "pingMin": "最小",
  "pingMed": "中位",
  "pingMax": "最大",
  "pingDisabled": "已关闭 Ping 测量。",
  "pingToggle": "测量 Ping(对当前站点发起几个小请求)",
  "chipNoCdn": "无CDN",
  "overlayToggle": "在页面上显示 CDN 角标",
  "historyTitle": "最近检测",
  "browserCache": "浏览器缓存",
  "cdnCache": "CDN 边缘缓存",
  "cacheHit": "命中",
  "cacheMiss": "未命中",
  "timingNoData": "暂无时序数据 — 刷新页面后采集",
  "reuseNote": "TCP/TLS 为 0 通常表示复用了已有连接或命中缓存。",
  "navNavigate": "直接导航",
  "navReload": "刷新",
  "navBackFwd": "前进/后退"
};

const hasChrome = typeof chrome !== "undefined" && chrome.storage && chrome.tabs;
const hasI18n = typeof chrome !== "undefined" && chrome.i18n && chrome.i18n.getMessage;

function t(key, subs) {
  let text = "";
  if (hasI18n) {
    text = subs && subs.length ? chrome.i18n.getMessage(key, subs) : chrome.i18n.getMessage(key);
  }
  if (!text) text = Object.prototype.hasOwnProperty.call(FALLBACK, key) ? FALLBACK[key] : key;
  if (subs && subs.length) {
    text = text.replace(/\$[A-Z]+\$/, String(subs[0] == null ? "" : subs[0]));
  }
  return text;
}

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach(function (n) {
    const key = n.getAttribute("data-i18n");
    const text = hasI18n ? chrome.i18n.getMessage(key) : FALLBACK[key];
    if (text) n.textContent = text;
  });
  document.querySelectorAll("[data-i18n-tip]").forEach(function (n) {
    const key = n.getAttribute("data-i18n-tip");
    const text = hasI18n ? chrome.i18n.getMessage(key) : FALLBACK[key];
    if (text) n.setAttribute("title", text);
  });
  if (hasI18n && chrome.i18n.getUILanguage) {
    try { document.documentElement.lang = chrome.i18n.getUILanguage(); } catch (e) { /* 忽略 */ }
  }
}

const DEMO_RECORD = {
  host: "www.example.com",
  status: "protected",
  providerName: "Cloudflare",
  matchedBy: { matched: true, header: "cf-ray", value: "8f2a1b2c3d4e5f6g-HKG", via: "header" },
  pop: { code: "HKG", city: "香港", sourceHeader: "cf-ray", raw: "8f2a1b2c3d4e5f6g-HKG" },
  evidence: [
    { name: "cf-ray", values: ["8f2a1b2c3d4e5f6g-HKG"] },
    { name: "server", values: ["cloudflare"] }
  ],
  ip: "104.16.132.229",
  geo: {
    country: "香港", countryCode: "HK", region: null, city: "香港",
    isp: "Cloudflare, Inc.", org: "CLOUDFLARENET", as: "AS13335 Cloudflare, Inc."
  },
  asnCdnHint: null,
  geoError: null,
  timing: {
    navType: "navigate", protocol: "h3",
    dns: 12, tcp: 28, tls: 45, ttfb: 182, download: 96,
    domInteractive: 420, loadComplete: 610,
    transferSize: 19400, encodedBodySize: 19000, decodedBodySize: 62300,
    browserCache: "miss", collectedAt: 0
  },
  cache: { verdict: "hit", header: "cf-cache-status", raw: "HIT", age: 120 },
  ping: { samples: [41, 38, 44], min: 38, median: 41, max: 44, at: 0 },
  pingError: null
};

// ---------- 格式化 ----------
function fmtMs(v) { return (typeof v === "number" && isFinite(v)) ? String(v) : "—"; }
function fmtBytes(v) {
  if (typeof v !== "number" || !isFinite(v) || v < 0) return "—";
  if (v < 1024) return v + " B";
  if (v < 1048576) return (v / 1024).toFixed(1) + " KB";
  return (v / 1048576).toFixed(2) + " MB";
}
function navTypeText(type) {
  if (!type) return null;
  if (type === "navigate") return t("navNavigate");
  if (type === "reload") return t("navReload");
  if (type === "back_forward") return t("navBackFwd");
  return type;
}
function setText(id, text) { $(id).textContent = text; }
function show(el, on) { el.classList.toggle("hidden", !on); }

// ---------- 检测结果渲染 ----------
function statusInfo(record) {
  if (!record) return { text: t("statusNoData"), cls: "unknown" };
  if (record.status === "protected") {
    return { text: t("statusProtected") + (record.providerName ? " · " + record.providerName : ""), cls: "protected" };
  }
  if (record.status === "maybe") return { text: t("statusMaybe"), cls: "maybe" };
  return { text: t("statusUnknown"), cls: "unknown" };
}
function providerText(record) {
  if (!record) return "—";
  if (record.providerName) {
    const via = record.matchedBy && record.matchedBy.header ? " " + t("matchedVia", [record.matchedBy.header]) : "";
    return record.providerName + via;
  }
  if (record.asnCdnHint) return t("asnInferred", [record.asnCdnHint.name]);
  return "—";
}
function popText(record) {
  const pop = record && record.pop;
  if (!pop || !pop.code) return "—";
  const city = pop.city ? "· " + pop.city : "";
  const src = pop.sourceHeader ? "(" + pop.sourceHeader + ")" : "";
  return (pop.code + " " + city + " " + src).trim();
}
function geoLine(record) {
  const g = record && record.geo;
  if (!g) return null;
  const parts = [];
  if (g.city) parts.push(g.city);
  if (g.region) parts.push(g.region);
  if (g.country) parts.push(g.country);
  return parts.length ? parts.join(" · ") : null;
}
function regionText(record) {
  if (!record) return "—";
  if (record.pop && record.pop.city) return t("popNode", [record.pop.city]);
  const line = geoLine(record);
  return line ? t("ipOwner", [line]) : "—";
}
function asnText(record) {
  const g = record && record.geo;
  if (!g) return "—";
  const parts = [];
  if (g.as) parts.push(g.as);
  if (g.org) parts.push(g.org);
  return parts.length ? parts.join(" · ") : "—";
}
function renderEvidence(record) {
  const ul = $("evidence");
  ul.textContent = "";
  const items = record && record.evidence ? record.evidence : [];
  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = t("noHeaders");
    ul.appendChild(li);
    return;
  }
  for (const h of items) {
    for (const v of h.values) {
      const li = document.createElement("li");
      const code = document.createElement("code");
      code.textContent = h.name;
      li.appendChild(code);
      const shown = v.length > 96 ? v.slice(0, 96) + "…" : v;
      li.appendChild(document.createTextNode(": " + shown));
      ul.appendChild(li);
    }
  }
}
function renderChips(record) {
  const pop = record && record.pop;
  const chipPop = $("chip-pop");
  if (pop && pop.code) {
    chipPop.textContent = pop.code + (pop.city ? " · " + pop.city : "");
    show(chipPop, true);
  } else show(chipPop, false);

  const timing = record && record.timing;
  const chipProto = $("chip-proto");
  if (timing && timing.protocol) {
    chipProto.textContent = String(timing.protocol).toUpperCase();
    show(chipProto, true);
  } else show(chipProto, false);

  const chipNav = $("chip-nav");
  const navText = timing ? navTypeText(timing.navType) : null;
  if (navText) { chipNav.textContent = navText; show(chipNav, true); }
  else show(chipNav, false);
}

// ---------- 时序 / 传输 / Ping ----------
const TIMING_SEGS = [
  ["m-dns", "dns", "seg-dns"],
  ["m-tcp", "tcp", "seg-tcp"],
  ["m-tls", "tls", "seg-tls"],
  ["m-ttfb", "ttfb", "seg-server"],
  ["m-dl", "download", "seg-dl"]
];
function renderTiming(record) {
  const timing = record && record.timing;
  const hint = $("timing-hint");
  const wf = $("wf");
  if (!timing) {
    hint.textContent = t("timingNoData");
    show(hint, true);
    show(wf, false);
    for (const s of TIMING_SEGS) setText(s[0], "—");
    setText("m-total", "—");
    show($("reuse-note"), false);
    return;
  }
  show(hint, false);
  let total = 0;
  for (const s of TIMING_SEGS) {
    const v = timing[s[1]];
    setText(s[0], fmtMs(v));
    if (typeof v === "number") total += v;
  }
  setText("m-total", String(total));
  if (total > 0) {
    show(wf, true);
    for (const s of TIMING_SEGS) {
      const el = document.querySelector("." + s[2]);
      const v = timing[s[1]];
      const pct = (typeof v === "number" && v > 0) ? (v / total * 100) : 0;
      el.style.width = pct + "%";
      el.style.minWidth = v > 0 ? "6px" : "0";
    }
  } else {
    show(wf, false);
  }
  const reuse = $("reuse-note");
  show(reuse, timing.tcp === 0);
  if (timing.tcp === 0) reuse.textContent = t("reuseNote");
}
function renderTransfer(record) {
  const timing = record && record.timing;
  if (!timing) {
    setText("m-transfer", "—"); setText("m-compress", "—");
    setText("m-bcache", "—"); setText("m-ccache", "—");
    return;
  }
  setText("m-transfer", fmtBytes(timing.transferSize));
  if (timing.encodedBodySize > 0 && timing.decodedBodySize > 0) {
    const pct = Math.round(timing.encodedBodySize * 100 / timing.decodedBodySize);
    setText("m-compress", fmtBytes(timing.encodedBodySize) + " → " + fmtBytes(timing.decodedBodySize) + " (" + pct + "%)");
  } else {
    setText("m-compress", "—");
  }
  // 浏览器本地缓存(Navigation Timing:transferSize=0 即未走网络)
  setText("m-bcache", timing.browserCache === "hit" ? t("cacheHit") : (timing.browserCache === "miss" ? t("cacheMiss") : "—"));
  // CDN 边缘缓存(响应头 X-Cache / CF-Cache-Status / Age 等)
  const cache = record && record.cache;
  if (cache && cache.verdict) {
    let cc = cache.verdict === "hit" ? t("cacheHit") : t("cacheMiss");
    if (typeof cache.age === "number") cc += " · Age " + cache.age + "s";
    setText("m-ccache", cc);
  } else {
    setText("m-ccache", "—");
  }
}
function renderPing(record) {
  const ping = record && record.ping;
  const chips = $("ping-chips");
  chips.textContent = "";
  const pingHint = $("ping-hint");
  pingHint.textContent = "";
  if (record && record.pingError) pingHint.textContent = record.pingError;
  if (!ping || typeof ping.median !== "number") { setText("ping-med", "—"); return; }
  setText("ping-med", String(ping.median));
  const defs = [["pingMin", ping.min], ["pingMed", ping.median], ["pingMax", ping.max]];
  for (const d of defs) {
    if (typeof d[1] !== "number") continue;
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = t(d[0]) + " " + d[1] + " ms";
    chips.appendChild(chip);
  }
}

function render(record) {
  setText("host", record && record.host ? record.host : "—");
  const s = statusInfo(record);
  const el = $("status");
  el.textContent = s.text;
  el.className = "pill status " + s.cls;
  setText("provider", providerText(record));
  renderChips(record);
  setText("pop", popText(record));
  setText("region", regionText(record));
  setText("ip", record && record.ip ? record.ip : "—");
  setText("asn", asnText(record));

  const hint = $("geo-hint");
  const lookup = $("lookup");
  hint.textContent = "";
  if (!record || !record.ip) lookup.classList.add("hidden");
  else if (record.geo) lookup.classList.add("hidden");
  else if (record.geoError) { hint.textContent = t("geoFailed", [record.geoError]); lookup.classList.remove("hidden"); }
  else lookup.classList.remove("hidden");

  renderTiming(record);
  renderTransfer(record);
  renderPing(record);
  renderEvidence(record);
}
function setBusy(text) {
  const el = $("status");
  el.textContent = text;
  el.className = "pill status unknown";
}

// ---------- 数据与设置 ----------
async function getGeoEnabled() {
  const bag = await chrome.storage.local.get("geoEnabled");
  return bag.geoEnabled !== false;
}
async function getPingEnabled() {
  const bag = await chrome.storage.local.get("pingEnabled");
  return bag.pingEnabled !== false;
}
async function loadRecord() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs && tabs[0] ? tabs[0] : null;
  if (!tab || !tab.id) return { tab: null, record: null };
  const key = "tab:" + tab.id;
  const bag = await chrome.storage.session.get(key);
  return { tab: tab, record: bag[key] || null };
}

// ---------- 历史记录(常驻后台按站点累积) ----------
async function renderHistory() {
  const list = $("history-list");
  if (!list) return;
  list.textContent = "";
  let entries = [];
  if (hasChrome) {
    const bag = await chrome.storage.local.get("hostHistory");
    const hist = bag.hostHistory || {};
    entries = Object.keys(hist).map(function (h) {
      const item = { host: h };
      for (const k of Object.keys(hist[h])) item[k] = hist[h][k];
      return item;
    }).sort(function (a, b) { return (b.at || 0) - (a.at || 0); }).slice(0, 6);
  } else {
    entries = [{ host: "www.example.com", badge: "CF", providerName: "Cloudflare", popCity: "香港", ttfb: 182, median: 41, at: Date.now() }];
  }
  if (!entries.length) {
    const d = document.createElement("div");
    d.className = "hrow";
    d.textContent = "—";
    list.appendChild(d);
    return;
  }
  for (const e of entries) {
    const row = document.createElement("div");
    row.className = "hrow";
    const left = document.createElement("b");
    left.textContent = e.host;
    const right = document.createElement("span");
    const parts = [];
    if (e.badge || e.providerName) parts.push(e.badge || e.providerName);
    if (e.popCity) parts.push(e.popCity);
    else if (e.city) parts.push(e.city);
    if (typeof e.ttfb === "number") parts.push(e.ttfb + "ms");
    if (typeof e.median === "number") parts.push("⇄ " + e.median + "ms");
    right.textContent = parts.join(" · ");
    row.appendChild(left);
    row.appendChild(right);
    list.appendChild(row);
  }
}

// ---------- Ping 测量 ----------
async function doPing(tabId) {
  const btn = $("ping");
  btn.disabled = true;
  show($("ping-wave"), true);
  $("ping-hint").textContent = t("pingMeasuring");
  try {
    const resp = await chrome.runtime.sendMessage({ type: "measurePing", tabId: tabId });
    if (!resp || !resp.ok) {
      $("ping-hint").textContent = (resp && resp.error) || "error";
    }
  } catch (e) {
    $("ping-hint").textContent = String(e && e.message ? e.message : e);
  }
  show($("ping-wave"), false);
  btn.disabled = false;
  const fresh = await loadRecord();
  render(fresh.record);
}

async function main() {
  applyI18n();

  if (!hasChrome) {
    render(DEMO_RECORD);
    $("geo-toggle").checked = true;
    $("ping-toggle").checked = true;
    $("lookup").classList.add("hidden");
    $("ping").disabled = true;
    $("reload").disabled = true;
    return;
  }
  const loaded = await loadRecord();
  const tab = loaded.tab;
  const record = loaded.record;
  if (!tab) { render(null); return; }
  if (!tab.url || /^(chrome|edge|about|devtools|view-source|chrome-extension):/i.test(tab.url)) {
    render(null);
    setBusy(t("internalPage"));
    $("lookup").classList.add("hidden");
    $("ping").disabled = true;
    return;
  }
  render(record);
  const geoOn = await getGeoEnabled();
  const pingOn = await getPingEnabled();
  $("geo-toggle").checked = geoOn;
  $("ping-toggle").checked = pingOn;

  $("reload").addEventListener("click", function () {
    setBusy(t("busyReloading"));
    chrome.tabs.reload(tab.id);
  });

  $("lookup").addEventListener("click", async function () {
    $("lookup").disabled = true;
    $("geo-hint").textContent = t("geoQuerying");
    try { await chrome.runtime.sendMessage({ type: "lookupGeo", tabId: tab.id }); } catch (e) { /* 后台忙 */ }
    $("lookup").disabled = false;
  });

  $("ping").addEventListener("click", function () { doPing(tab.id); });

  $("geo-toggle").addEventListener("change", async function (e) {
    await chrome.storage.local.set({ geoEnabled: e.target.checked });
    if (e.target.checked) {
      const fresh = await loadRecord();
      if (fresh.record && fresh.record.ip && !fresh.record.geo) {
        try { await chrome.runtime.sendMessage({ type: "lookupGeo", tabId: tab.id }); } catch (err) { /* 后台忙 */ }
      }
    } else {
      $("geo-hint").textContent = t("geoDisabled");
      $("lookup").classList.add("hidden");
    }
  });

  $("ping-toggle").addEventListener("change", async function (e) {
    await chrome.storage.local.set({ pingEnabled: e.target.checked });
    if (!e.target.checked) {
      $("ping").disabled = true;
      $("ping-hint").textContent = t("pingDisabled");
    } else {
      $("ping").disabled = false;
      $("ping-hint").textContent = "";
    }
  });

  const overlayBag = await chrome.storage.local.get("overlayEnabled");
  $("overlay-toggle").checked = overlayBag.overlayEnabled !== false;
  $("overlay-toggle").addEventListener("change", async function (e) {
    await chrome.storage.local.set({ overlayEnabled: e.target.checked });
  });

  // 打开弹窗时自动测一次 Ping(开关开启且尚无数据;后台通常已自动测过)
  if (pingOn && record && !record.ping && /^https?:/i.test(tab.url)) {
    doPing(tab.id);
  }

  renderHistory();
  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area === "local" && changes.hostHistory) renderHistory();
  });

  chrome.storage.session.onChanged.addListener(function (changes) {
    const key = "tab:" + tab.id;
    if (changes[key]) render(changes[key].newValue || null);
  });
}

main();
