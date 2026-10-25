// WAF(网页应用防火墙)被动指纹规则:仅响应头与 Set-Cookie,不做主动探测。
// 没把握的信号一律不写;Cloudflare 仅在出现 cf-mitigated(质询/拦截)时按 WAF 计,
// 避免把所有 Cloudflare 代理站点都标成 WAF。
export const WAF_PROVIDERS = [
  {
    id: "aws-waf",
    name: "AWS WAF",
    headerNames: ["x-amzn-waf-action"]
  },
  {
    id: "cloudflare-waf",
    name: "Cloudflare WAF",
    headerNames: ["cf-mitigated"]
  },
  {
    id: "imperva",
    name: "Imperva / Incapsula",
    headerNames: ["x-iinfo"],
    cookieRes: [{ re: /(_incap_|visid_incap)/i }]
  },
  {
    id: "f5-asm",
    name: "F5 BIG-IP ASM",
    headerNames: ["x-wa-info"],
    cookieRes: [{ re: /^TS[a-zA-Z0-9]{6,}=/ }]
  },
  {
    id: "akamai",
    name: "Akamai",
    serverRe: /akamaighost/i
  },
  {
    id: "modsecurity",
    name: "ModSecurity",
    serverRe: /mod_?security/i
  },
  {
    id: "bt-waf",
    name: "宝塔 WAF",
    cookieRes: [{ re: /btwaf/i }]
  },
  {
    id: "reblaze",
    name: "Reblaze",
    headerNames: ["x-reblaze"]
  }
];
