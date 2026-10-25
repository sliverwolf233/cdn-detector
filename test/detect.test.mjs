// 检测引擎单元测试: node test/detect.test.mjs (或 npm test)
import { headersToMap, detectFromHeaders, asnHint, checkSecurityHeaders, detectWAF } from "../lib/detect.js";

let failures = 0;
function check(label, cond, extra) {
  if (cond) {
    console.log("PASS  " + label);
  } else {
    failures++;
    console.log("FAIL  " + label + (extra ? "  " + extra : ""));
  }
}
function hm(pairs) {
  return headersToMap(pairs.map(function (p) { return { name: p[0], value: p[1] }; }));
}

// 1. Cloudflare(响应头指纹 + POP 提取)
(function () {
  const r = detectFromHeaders(hm([["Server", "cloudflare"], ["CF-RAY", "8f2a1b2c3d4e5f6g-HKG"], ["Content-Type", "text/html"]]));
  check("cloudflare detected", r.status === "protected" && r.providerId === "cloudflare", JSON.stringify(r));
  check("cloudflare pop HKG + city", r.pop.code === "HKG" && /香港/.test(r.pop.city || ""), JSON.stringify(r.pop));
})();

// 2. Fastly
(function () {
  const r = detectFromHeaders(hm([["X-Served-By", "cache-fra19128"], ["X-Cache", "HIT"], ["Via", "1.1 varnish"]]));
  check("fastly detected", r.status === "protected" && r.providerId === "fastly", JSON.stringify(r));
  check("fastly pop FRA city", r.pop.code === "FRA" && /法兰克福/.test(r.pop.city || ""), JSON.stringify(r.pop));
})();

// 3. Vercel
(function () {
  const r = detectFromHeaders(hm([["Server", "Vercel"], ["X-Vercel-Id", "cle1::5f6a7b8c"]]));
  check("vercel detected", r.status === "protected" && r.providerId === "vercel", JSON.stringify(r));
  check("vercel pop CLE city", r.pop.code === "CLE" && /克利夫兰/.test(r.pop.city || ""), JSON.stringify(r.pop));
})();

// 4. 阿里云
(function () {
  const r = detectFromHeaders(hm([["Server", "Tengine"], ["Eagleid", "74d0bf9512345678901234567"]]));
  check("aliyun detected", r.status === "protected" && r.providerId === "aliyun", JSON.stringify(r));
})();

// 5. CloudFront
(function () {
  const r = detectFromHeaders(hm([["X-Cache", "Hit from cloudfront"], ["X-Amz-Cf-Id", "abc"], ["X-Amz-Cf-Pop", "HKG62-P16"]]));
  check("cloudfront detected", r.status === "protected" && r.providerId === "cloudfront", JSON.stringify(r));
  check("cloudfront pop HKG", r.pop.code === "HKG", JSON.stringify(r.pop));
})();

// 6. 通用缓存层(疑似)
(function () {
  const r = detectFromHeaders(hm([["Via", "1.1 squid"], ["X-Cache", "MISS from squid"]]));
  check("generic cache maybe", r.status === "maybe", JSON.stringify(r));
})();

// 7. 无 CDN 特征
(function () {
  const r = detectFromHeaders(hm([["Server", "Apache/2.4.41"], ["Content-Type", "text/html"]]));
  check("no cdn unknown", r.status === "unknown", JSON.stringify(r));
})();

// 8. ASN 线索
(function () {
  const h = asnHint("CLOUDFLARENET", "AS13335 Cloudflare, Inc.");
  check("asn hint cloudflare", !!h && /cloudflare/i.test(h.name), JSON.stringify(h));
})();

// 9. 安全响应头体检
(function () {
  const sec = checkSecurityHeaders(hm([["Strict-Transport-Security", "max-age=63072000"], ["Content-Security-Policy", "default-src 'self'"]]));
  check("security headers 9 items", sec.length === 9);
  check("hsts present", sec.find(function (s) { return s.name === "strict-transport-security"; }).present === true);
  check("csp present", sec.find(function (s) { return s.name === "content-security-policy"; }).present === true);
  check("xfo missing", sec.find(function (s) { return s.name === "x-frame-options"; }).present === false);
})();

// 10. WAF 被动识别
(function () {
  const aws = detectWAF(hm([["X-Amzn-Waf-Action", "BLOCK"], ["Server", "nginx"]]));
  check("aws waf detected", !!aws && aws.id === "aws-waf" && aws.header === "x-amzn-waf-action", JSON.stringify(aws));

  const f5 = detectWAF(hm([["Server", "Apache"], ["Set-Cookie", "TSa1b2c3d4e5=xyz; path=/; Httponly"]]));
  check("f5 asm by TS cookie", !!f5 && f5.id === "f5-asm" && f5.header === "set-cookie", JSON.stringify(f5));

  const cf = detectWAF(hm([["Cf-Mitigated", "challenge"], ["Server", "cloudflare"]]));
  check("cloudflare waf mitigated", !!cf && cf.id === "cloudflare-waf" && cf.mitigated === "challenge", JSON.stringify(cf));

  const none = detectWAF(hm([["Server", "nginx"], ["Content-Type", "text/html"]]));
  check("no waf", none === null, JSON.stringify(none));

  const modsec = detectWAF(hm([["Server", "Mod_Security"]]));
  check("modsecurity by server", !!modsec && modsec.id === "modsecurity", JSON.stringify(modsec));
})();

if (failures) {
  throw new Error(failures + " test(s) failed");
}
console.log("All tests passed.");
