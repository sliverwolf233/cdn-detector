// Service Worker:监听主导航响应头 → CDN 检测 → session 存储 → 角标。
// 常驻行为(无需打开弹窗):自动检测、自动 Ping、按站点历史记录、向页面角标推送结果。

import { headersToMap, detectFromHeaders, asnHint, checkSecurityHeaders, detectWAF } from "./lib/detect.js";
import { initInfraDb, lookupInfra } from "./lib/asn-db.js";
import { ASN_NAMES } from "./rules/asn-names.js";

// 离线基础设施库(打包在 rules/infra-ranges.bin):启动时加载一次
initInfraDb();

function mapAsnName(asText) {
  const m = /^AS(\d+)/.exec(String(asText || ""));
  if (!m) return null;
  return Object.prototype.hasOwnProperty.call(ASN_NAMES, m[1]) ? ASN_NAMES[m[1]] : null;
}

function keyOf(tabId) { return "tab:" + tabId; }

async function getRecord(tabId) {
  const bag = await chrome.storage.session.get(keyOf(tabId));
  return bag[keyOf(tabId)] || null;
}

async function setRecord(tabId, record) {
  const bag = {};
  bag[keyOf(tabId)] = record;
  await chrome.storage.session.set(bag);
}

async function geoEnabled() {
  const bag = await chrome.storage.local.get("geoEnabled");
  return bag.geoEnabled !== false; // 默认开启
}

async function pingEnabled() {
  const bag = await chrome.storage.local.get("pingEnabled");
  return bag.pingEnabled !== false; // 默认开启
}

function updateBadge(tabId, record) {
  const text = record && record.badge ? String(record.badge).slice(0, 4) : "";
  let color = "#475569";
  if (record && record.status === "protected") color = "#16a34a";
  else if (record && record.status === "maybe") color = "#d97706";
  try {
    chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: color });
    chrome.action.setBadgeText({ tabId: tabId, text: text });
  } catch (e) { /* 标签页可能已关闭 */ }
}

// ---------- 历史记录(按站点,storage.local,LRU 上限 50) ----------
async function updateHistory(record) {
  if (!record || !record.host) return;
  const bag = await chrome.storage.local.get("hostHistory");
  const hist = bag.hostHistory || {};
  hist[record.host] = {
    status: record.status || null,
    providerName: record.providerName || null,
    badge: record.badge || null,
    popCode: (record.pop && record.pop.code) || null,
    popCity: (record.pop && record.pop.city) || null,
    ip: record.ip || null,
    city: (record.geo && record.geo.city) || null,
    country: (record.geo && record.geo.country) || null,
    protocol: (record.timing && record.timing.protocol) || null,
    ttfb: (record.timing && record.timing.ttfb) || null,
    median: (record.ping && record.ping.median) || null,
    infraName: (record.infra && record.infra.name) || null,
    wafName: (record.waf && record.waf.name) || null,
    at: Date.now()
  };
  const keys = Object.keys(hist);
  if (keys.length > 50) {
    keys.sort(function (a, b) { return (hist[a].at || 0) - (hist[b].at || 0); });
    const drop = keys.slice(0, keys.length - 50);
    for (const k of drop) delete hist[k];
  }
  await chrome.storage.local.set({ hostHistory: hist });
}

function geoUrl(ip) {
  return "http://ip-api.com/json/" + encodeURIComponent(ip) +
    "?fields=status,message,country,countryCode,regionName,city,isp,org,as,query&lang=zh-CN";
}

async function lookupGeo(tabId) {
  const record = await getRecord(tabId);
  if (!record || !record.ip) return;
  try {
    const resp = await fetch(geoUrl(record.ip));
    const data = await resp.json();
    if (data && data.status === "success") {
      record.geo = {
        country: data.country || null,
        countryCode: data.countryCode || null,
        region: data.regionName || null,
        city: data.city || null,
        isp: data.isp || null,
        org: data.org || null,
        as: data.as || null
      };
      record.asnCdnHint = asnHint(record.geo.org, record.geo.as);
      record.asnName = mapAsnName(record.geo.as);
      record.geoError = null;
    } else {
      record.geoError = (data && data.message) || "IP 地理查询失败";
    }
  } catch (e) {
    record.geoError = String(e && e.message ? e.message : e);
  }
  await setRecord(tabId, record);
  await updateHistory(record);
}

async function onHeadersReceived(details) {
  const map = headersToMap(details.responseHeaders);
  if (details.type !== "main_frame") {
    noteSubresource(details, map);
    return;
  }
  const result = detectFromHeaders(map);
  const security = checkSecurityHeaders(map);
  const waf = detectWAF(map);
  // 拦截/质询判定:命中 WAF 且状态码为 403/406/429/503,或存在 cf-mitigated 质询标记
  const statusCode = details.statusCode || null;
  const wafBlocked = !!(waf && (waf.mitigated || [403, 406, 429, 503].indexOf(statusCode) !== -1));
  // 全部响应头(截断存储:最多 80 个头,值最长 512 字符)供弹窗查看完整列表
  const allHeaders = (details.responseHeaders || []).slice(0, 80).map(function (h) {
    return { name: h.name, value: String(h.value == null ? "" : h.value).slice(0, 512) };
  });
  let host = "";
  try { host = new URL(details.url).hostname; } catch (e) { host = ""; }
  const record = Object.assign(
    {
      tabId: details.tabId,
      url: details.url,
      host: host,
      ip: details.ip || null,
      timeStamp: Date.now(),
      geo: null,
      geoError: null,
      asnCdnHint: null,
      timing: null,
      ping: null,
      pingError: null,
      hosts: {},
      security: security,
      allHeaders: allHeaders,
      waf: waf,
      statusCode: statusCode,
      wafBlocked: wafBlocked
    },
    result
  );
  // 离线库判定 IP 归属(不开第三方查询时也有基础结论)
  record.infra = record.ip ? lookupInfra(record.ip) : null;
  await setRecord(details.tabId, record);
  updateBadge(details.tabId, record);
  if (record.ip && (await geoEnabled())) lookupGeo(details.tabId);
}

// ---------- 页面子资源域名分布(被动识别其他域名的 CDN;webRequest 不受 CORS 限制) ----------
const HOSTS_LIMIT = 30;

async function noteSubresource(details, map) {
  let host = "";
  try { host = new URL(details.url).hostname; } catch (e) { return; }
  const record = await getRecord(details.tabId);
  if (!record) return; // 尚无主文档记录的标签页忽略
  if (host === record.host) return;
  if (record.hosts && record.hosts[host]) return; // 已识别过
  const result = detectFromHeaders(map);
  if (!record.hosts) record.hosts = {};
  record.hosts[host] = {
    status: result.status,
    providerName: result.providerName || null,
    badge: result.badge || null,
    popCode: (result.pop && result.pop.code) || null,
    popCity: (result.pop && result.pop.city) || null,
    cache: (result.cache && result.cache.verdict) || null,
    type: details.type || null
  };
  const keys = Object.keys(record.hosts);
  if (keys.length > HOSTS_LIMIT) {
    for (const k of keys.slice(0, keys.length - HOSTS_LIMIT)) delete record.hosts[k];
  }
  await setRecord(details.tabId, record);
}

chrome.webRequest.onHeadersReceived.addListener(
  onHeadersReceived,
  { urls: ["http://*/*", "https://*/*"], types: ["main_frame", "sub_frame", "script", "stylesheet", "image", "font", "xmlhttprequest"] },
  ["responseHeaders"]
);

// ---------- 时序合并(来自内容脚本)→ 历史 + 自动 Ping + 摘要回传 ----------
function summarize(rec) {
  if (!rec) return null;
  return {
    status: rec.status || null,
    badge: rec.badge || null,
    providerName: rec.providerName || null,
    popCode: (rec.pop && rec.pop.code) || null,
    popCity: (rec.pop && rec.pop.city) || null
  };
}

async function mergeTiming(tabId, timing) {
  if (!timing) return null;
  const record = await getRecord(tabId);
  if (!record) return null;
  record.timing = timing;
  await setRecord(tabId, record);
  await updateHistory(record);
  if ((await pingEnabled()) && !record.ping) {
    measurePingFlow(tabId); // 后台自动测量,无需打开弹窗
  }
  return record;
}

// ---------- Ping ----------
async function ensureContentScript(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "collectTiming" });
    return true;
  } catch (e) {
    return false; // 内容脚本尚未注入(页面早于扩展加载);刷新页面后即恢复
  }
}

async function measurePingFlow(tabId) {
  if (!(await pingEnabled())) return { ok: false, error: "disabled" };
  if (!(await ensureContentScript(tabId))) return { ok: false, error: "cannot-inject" };
  try {
    const resp = await chrome.tabs.sendMessage(tabId, { type: "measurePing" });
    if (resp && resp.ok) {
      const record = await getRecord(tabId);
      if (record) {
        record.ping = resp.ping;
        record.pingError = null;
        await setRecord(tabId, record);
        await updateHistory(record);
      }
      try {
        await chrome.tabs.sendMessage(tabId, { type: "pingUpdate", median: (resp.ping && resp.ping.median) || null });
      } catch (e) { /* 页面已翻页 */ }
      return { ok: true };
    }
    return { ok: false, error: (resp && resp.error) || "unknown" };
  } catch (e) {
    return { ok: false, error: String(e && e.message ? e.message : e) };
  }
}

// ---------- SPA 软导航(History API / hash 变化,不产生新的网络导航) ----------
async function handleSpaNav(tabId, url) {
  const record = await getRecord(tabId);
  if (!record) return; // 未检测过(如扩展中途安装),等待下次整页导航
  record.url = url;
  try { record.host = new URL(url).hostname; } catch (e) { /* 保留原值 */ }
  await setRecord(tabId, record);
  // 软导航后按需重测 Ping(距上次 ≥30s 才重测,避免路由频繁切换时刷请求)
  const stalePing = !record.ping || !record.ping.at || (Date.now() - record.ping.at > 30000);
  if (stalePing && (await pingEnabled())) measurePingFlow(tabId);
  try { await chrome.tabs.sendMessage(tabId, { type: "summaryUpdate", summary: summarize(record) }); } catch (e) { /* 无接收方 */ }
}

chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
  if (!details || details.frameId !== 0 || !(details.tabId >= 0)) return;
  handleSpaNav(details.tabId, details.url);
});
chrome.webNavigation.onReferenceFragmentUpdated.addListener(function (details) {
  if (!details || details.frameId !== 0 || !(details.tabId >= 0)) return;
  handleSpaNav(details.tabId, details.url);
});

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (!msg || typeof msg !== "object") return;
  if (msg.type === "navTiming" && sender.tab && sender.tab.id) {
    mergeTiming(sender.tab.id, msg.timing).then(function (rec) {
      sendResponse({ ok: true, summary: summarize(rec) });
    });
    return true;
  }
  if (msg.type === "lookupGeo" && Number.isInteger(msg.tabId)) {
    lookupGeo(msg.tabId).then(function () { sendResponse({ ok: true }); });
    return true;
  }
  if (msg.type === "measurePing" && Number.isInteger(msg.tabId)) {
    measurePingFlow(msg.tabId).then(function (r) { sendResponse(r); });
    return true;
  }
  if (msg.type === "getRecord" && Number.isInteger(msg.tabId)) {
    getRecord(msg.tabId).then(function (rec) { sendResponse({ record: rec }); });
    return true;
  }
});

chrome.tabs.onRemoved.addListener(function (tabId) {
  chrome.storage.session.remove(keyOf(tabId));
});
