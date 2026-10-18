// CDN 提供商识别规则(纯数据:对象 / 数组 / 字符串 / 正则字面量,无函数、无 import)
// 由 lib/detect.js 导入。headerNames 任一存在即命中;serverRe 对 Server 头做 test;
// headerValueRes 对指定头的每个值做 test;pop 从指定头的第一个值提取 POP 代码(group 默认 1)。
// 厂商按命中把握从高到低排序。没有把握的真实响应头一律不写。

export const CDN_PROVIDERS = [
  {
    id: "cloudflare",
    name: "Cloudflare",
    badge: "CF",
    headerNames: ["cf-ray", "cf-cache-status"],
    serverRe: /cloudflare/i,
    pop: { header: "cf-ray", re: /-([A-Za-z0-9]{3,6})$/, group: 1 }
  },
  {
    id: "cloudfront",
    name: "Amazon CloudFront",
    badge: "AMZN",
    headerNames: ["x-amz-cf-id", "x-amz-cf-pop"],
    headerValueRes: [
      { header: "x-cache", re: /cloudfront/i },
      { header: "via", re: /cloudfront/i }
    ],
    pop: { header: "x-amz-cf-pop", re: /^([A-Za-z]{3})/, group: 1 }
  },
  {
    id: "fastly",
    name: "Fastly",
    badge: "FAST",
    headerNames: ["x-fastly-request-id"],
    headerValueRes: [
      { header: "x-served-by", re: /^cache-/i },
      { header: "via", re: /fastly/i }
    ],
    pop: { header: "x-served-by", re: /cache-([a-z]+)/i, group: 1 }
  },
  {
    id: "akamai",
    name: "Akamai",
    badge: "AKAM",
    headerNames: ["x-akamai-request-id", "x-akamai-transformed", "akamai-origin-hop"],
    serverRe: /akamai/i
  },
  {
    id: "vercel",
    name: "Vercel",
    badge: "VC",
    headerNames: ["x-vercel-id", "x-vercel-cache"],
    serverRe: /vercel/i,
    pop: { header: "x-vercel-id", re: /^([A-Za-z]{3})/, group: 1 }
  },
  {
    id: "netlify",
    name: "Netlify",
    badge: "NTF",
    headerNames: ["x-nf-request-id"]
  },
  {
    id: "azure-front-door",
    name: "Azure Front Door",
    badge: "AFD",
    headerNames: ["x-azure-ref", "x-azure-slice"]
  },
  {
    id: "google-cloud",
    name: "Google Cloud (GFE)",
    badge: "GFE",
    headerNames: [],
    serverRe: /gfe/i,
    headerValueRes: [
      { header: "via", re: /1\.1 google/i }
    ]
  },
  {
    id: "aliyun",
    name: "阿里云 CDN",
    badge: "阿里",
    headerNames: ["eagleid", "x-swift-version"]
  },
  {
    id: "tencent",
    name: "腾讯云 CDN/EdgeOne",
    badge: "腾讯",
    headerNames: ["x-nws-log-uuid", "eo-log-id", "eo-cache-status"]
  },
  {
    id: "qiniu",
    name: "七牛云 CDN",
    badge: "七牛",
    headerNames: ["x-qiniu-cdn", "x-reqid"]
  },
  {
    // 网宿没有把握的独有响应头,保留最小占位(ASN_ORG_HINTS 仍可给出线索)
    id: "wangsu",
    name: "网宿科技 CDN",
    badge: "网宿",
    headerNames: []
  },
  {
    id: "baidu",
    name: "BFE(百度系)",
    badge: "BFE",
    headerNames: [],
    serverRe: /^bfe/i
  },
  {
    id: "bunny",
    name: "BunnyCDN",
    badge: "BUN",
    headerNames: []
  },
  {
    id: "cdn77",
    name: "CDN77",
    badge: "C77",
    headerNames: [],
    serverRe: /cdn77/i
  },
  {
    id: "gcore",
    name: "Gcore CDN",
    badge: "GC",
    headerNames: ["x-gcdn-request-id"]
  },
  {
    id: "huaweicloud",
    name: "华为云 CDN",
    badge: "华为",
    headerNames: [],
    headerValueRes: [
      { header: "via", re: /hwclouds|huaweicloud/i }
    ]
  },
  {
    id: "kingsoft",
    name: "金山云 CDN",
    badge: "金山",
    headerNames: []
  }
];

// 通用缓存相关响应头(小写):不指向特定厂商,用于 "疑似有缓存层" 判断
export const GENERIC_CACHE_HEADERS = [
  "x-cache",
  "x-cache-lookup",
  "x-cache-hits",
  "x-varnish",
  "x-served-by",
  "via",
  "age",
  "x-cdn",
  "x-drupal-cache",
  "x-litespeed-cache",
  "x-nginx-cache",
  "x-cache-status"
];

// IP 归属(org + as 拼接后的小写文本)线索,按把握从高到低排序
export const ASN_ORG_HINTS = [
  { name: "Cloudflare", badge: "CF", re: /cloudflare/i },
  { name: "Akamai", badge: "AKAM", re: /akamai/i },
  { name: "Fastly", badge: "FAST", re: /fastly/i },
  { name: "Amazon CloudFront", badge: "AMZN", re: /amazon|cloudfront/i },
  { name: "Edgecast / Edgio", badge: "EDG", re: /edgecast|edgio/i },
  { name: "阿里云", badge: "阿里", re: /aliyun|alibaba/i },
  { name: "腾讯云", badge: "腾讯", re: /tencent/i },
  { name: "网宿科技", badge: "网宿", re: /wangsu|chinanetcenter/i },
  { name: "百度", badge: "百度", re: /baidu/i },
  { name: "金山云", badge: "金山", re: /ksyun|kingsoft/i },
  { name: "华为云", badge: "华为", re: /hwclouds|huawei/i },
  { name: "Bunny", badge: "BUN", re: /bunny/i },
  { name: "Gcore", badge: "GC", re: /gcore/i },
  { name: "CDN77", badge: "C77", re: /cdn77/i },
  { name: "Google", badge: "GFE", re: /google/i },
  { name: "Microsoft Azure", badge: "MS", re: /microsoft|azure/i }
];
