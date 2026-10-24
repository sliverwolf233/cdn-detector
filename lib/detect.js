// CDN 检测引擎:根据响应头判断 CDN 提供商与边缘节点(POP)。纯函数,无副作用。
// 规则数据来自 rules/cdn-providers.js 与 rules/pop-codes.js。

import { CDN_PROVIDERS, GENERIC_CACHE_HEADERS, ASN_ORG_HINTS } from "../rules/cdn-providers.js";
import { POP_CODES } from "../rules/pop-codes.js";

// 把 chrome.webRequest 的响应头数组转成 { 小写头名: [值, ...] }
export function headersToMap(headerList) {
  const map = {};
  if (!Array.isArray(headerList)) return map;
  for (const h of headerList) {
    if (!h || typeof h.name !== "string") continue;
    const name = h.name.toLowerCase();
    if (!map[name]) map[name] = [];
    map[name].push(String(h.value == null ? "" : h.value));
  }
  return map;
}

function firstValue(map, name) {
  const values = map[String(name).toLowerCase()];
  return Array.isArray(values) && values.length ? values[0] : null;
}

function resolvePopCity(code) {
  if (!code) return null;
  const key = String(code).toUpperCase();
  if (POP_CODES[key]) return POP_CODES[key];
  return POP_CODES[key.slice(0, 3)] || null;
}

function matchProvider(provider, map) {
  if (Array.isArray(provider.headerNames)) {
    for (const name of provider.headerNames) {
      const v = firstValue(map, name);
      if (v !== null) return { matched: true, header: name, value: v, via: "header" };
    }
  }
  const server = firstValue(map, "server");
  if (server !== null && provider.serverRe && provider.serverRe.test(server)) {
    return { matched: true, header: "server", value: server, via: "server" };
  }
  if (Array.isArray(provider.headerValueRes)) {
    for (const rule of provider.headerValueRes) {
      const values = map[String(rule.header).toLowerCase()];
      if (!values) continue;
      for (const v of values) {
        if (rule.re.test(v)) return { matched: true, header: rule.header, value: v, via: "value" };
      }
    }
  }
  return { matched: false, header: null, value: null, via: null };
}

function extractPop(provider, map) {
  const spec = provider.pop;
  if (!spec || !spec.header) return { code: null, city: null, sourceHeader: null, raw: null };
  const raw = firstValue(map, spec.header);
  if (raw === null) return { code: null, city: null, sourceHeader: null, raw: null };
  const m = raw.match(spec.re);
  const group = spec.group == null ? 1 : spec.group;
  const code = m && m[group] ? m[group] : null;
  return {
    code: code ? String(code).toUpperCase() : null,
    city: resolvePopCity(code),
    sourceHeader: spec.header,
    raw: raw
  };
}

const EVIDENCE_HEADERS = [
  "server", "via", "cf-ray", "cf-cache-status", "x-cache", "x-cache-lookup", "x-cache-hits",
  "x-served-by", "x-varnish", "x-amz-cf-id", "x-amz-cf-pop", "x-fastly-request-id",
  "x-vercel-id", "x-vercel-cache", "x-azure-ref", "x-azure-slice", "eagleid", "x-swift-version",
  "x-nws-log-uuid", "x-qiniu-cdn", "x-akamai-request-id", "x-akamai-transformed", "age",
  "x-cdn", "x-edge-location", "eo-log-id", "eo-cache-status", "x-gcdn-request-id", "x-nf-request-id"
];

function collectEvidence(map, extraNames) {
  const wanted = new Set(EVIDENCE_HEADERS);
  for (const n of extraNames || []) {
    if (n) wanted.add(String(n).toLowerCase());
  }
  const out = [];
  for (const name of Object.keys(map)) {
    if (wanted.has(name)) out.push({ name: name, values: map[name] });
  }
  out.sort(function (a, b) { return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; });
  return out;
}

// CDN 边缘缓存特征:从已知缓存头里解析命中/未命中与对象年龄(Age)
const CACHE_HEADERS = [
  "cf-cache-status", "x-cache", "x-cache-lookup", "x-cache-hits", "x-cache-status",
  "x-varnish", "x-drupal-cache", "x-litespeed-cache", "x-nginx-cache"
];

function extractCache(map) {
  let verdict = null;
  let header = null;
  let raw = null;
  for (const name of CACHE_HEADERS) {
    const v = firstValue(map, name);
    if (v === null) continue;
    const m = String(v).match(/\b(hit|miss|bypass|dynamic|expired|stale|revalidated|refresh|pass)\b/i);
    if (m) {
      const w = m[1].toLowerCase();
      verdict = (w === "hit" || w === "revalidated" || w === "refresh") ? "hit" : "miss";
      header = name;
      raw = v;
      break;
    }
  }
  const ageV = firstValue(map, "age");
  const age = (ageV !== null && /^\d+$/.test(String(ageV).trim())) ? parseInt(String(ageV).trim(), 10) : null;
  return { verdict: verdict, header: header, raw: raw, age: age };
}

// detectFromHeaders(map) -> {
//   status: "protected" | "maybe" | "unknown",
//   providerId / providerName / badge, matchedBy, pop, genericCacheHeaders, evidence
// }
export function detectFromHeaders(map) {
  const genericPresent = [];
  for (const n of GENERIC_CACHE_HEADERS) {
    if (map[String(n).toLowerCase()]) genericPresent.push(n);
  }

  const cacheInfo = extractCache(map);

  let providerHit = null;
  for (const provider of CDN_PROVIDERS) {
    const hit = matchProvider(provider, map);
    if (hit.matched) { providerHit = { provider: provider, hit: hit }; break; }
  }

  let pop = { code: null, city: null, sourceHeader: null, raw: null };
  const extraNames = [];
  if (providerHit) {
    pop = extractPop(providerHit.provider, map);
    if (Array.isArray(providerHit.provider.headerNames)) extraNames.push.apply(extraNames, providerHit.provider.headerNames);
    if (pop.sourceHeader) extraNames.push(pop.sourceHeader);
  }

  const evidence = collectEvidence(map, extraNames);

  if (providerHit) {
    return {
      status: "protected",
      providerId: providerHit.provider.id,
      providerName: providerHit.provider.name,
      badge: providerHit.provider.badge || null,
      matchedBy: providerHit.hit,
      pop: pop,
      cache: cacheInfo,
      genericCacheHeaders: genericPresent,
      evidence: evidence
    };
  }
  if (genericPresent.length) {
    return {
      status: "maybe",
      providerId: null,
      providerName: null,
      badge: "CDN?",
      matchedBy: null,
      pop: pop,
      cache: cacheInfo,
      genericCacheHeaders: genericPresent,
      evidence: evidence
    };
  }
  return {
    status: "unknown",
    providerId: null,
    providerName: null,
    badge: null,
    matchedBy: null,
    pop: pop,
    cache: cacheInfo,
    genericCacheHeaders: [],
    evidence: evidence
  };
}

// 安全响应头体检:仅检查主文档响应头是否携带以下安全配置(存在性检查,不做值校验)
const SECURITY_HEADERS = [
  "strict-transport-security",
  "content-security-policy",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
  "cross-origin-opener-policy",
  "cross-origin-embedder-policy",
  "cross-origin-resource-policy"
];

export function checkSecurityHeaders(map) {
  return SECURITY_HEADERS.map(function (name) {
    return { name: name, present: !!map[name] };
  });
}

// 根据 IP 地理库返回的 org / as 文本识别 CDN 网络线索(响应头判断不出时的补充证据)
export function asnHint(org, asText) {
  const text = (String(org || "") + " " + String(asText || "")).toLowerCase();
  if (!text.trim()) return null;
  for (const hint of ASN_ORG_HINTS) {
    if (hint.re.test(text)) return { name: hint.name, badge: hint.badge || null };
  }
  return null;
}
