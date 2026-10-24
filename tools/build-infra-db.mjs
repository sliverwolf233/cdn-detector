// 构建离线基础设施库:拉取官方公开 IP 段,编译为紧凑二进制(INFR1)。
// 用法: node tools/build-infra-db.mjs
// 输出: rules/infra-ranges.bin(二进制库) + rules/infra-meta.js(生成信息)
// 数据源(官方公开,仅 IPv4;IPv6 暂不收录以控制体积):
//   - Cloudflare https://www.cloudflare.com/ips-v4
//   - AWS       https://ip-ranges.amazonaws.com/ip-ranges.json(cloudfront 单独标注)
//   - Google    https://www.gstatic.com/ipranges/cloud.json
// 某源不可达时自动跳过并在 meta.sources 标注;重复运行即可更新快照。
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_BIN = join(ROOT, "rules", "infra-ranges.bin");
const OUT_META = join(ROOT, "rules", "infra-meta.js");

async function fetchText(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { "user-agent": "cdn-detector-db-builder/1" } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.text();
  } finally { clearTimeout(timer); }
}

function cidrToRange(cidr) {
  const m = /^([0-9.]+)\/(\d+)$/.exec(String(cidr).trim());
  if (!m) return null;
  const parts = m[1].split(".").map(Number);
  if (parts.length !== 4 || parts.some(n => !(n >= 0 && n <= 255))) return null;
  const prefix = ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
  const bits = Number(m[2]);
  if (!(bits >= 0 && bits <= 32)) return null;
  const size = bits === 0 ? 0xFFFFFFFF : (0xFFFFFFFF << (32 - bits)) >>> 0;
  return { start: (prefix & size) >>> 0, end: (prefix | (~size >>> 0)) >>> 0 };
}

const sources = [];
const ranges = []; // {start,end,provider}

async function addSource(label, url, provider, parse) {
  try {
    const text = await fetchText(url);
    const n = parse(text);
    sources.push({ name: label, ok: true, ranges: n });
  } catch (e) {
    sources.push({ name: label, ok: false, error: String(e.message || e) });
  }
}

await addSource("cloudflare", "https://www.cloudflare.com/ips-v4", "Cloudflare", (t) => {
  let n = 0;
  for (const line of t.split(/\r?\n/)) {
    const r = cidrToRange(line);
    if (r) { r.provider = "Cloudflare"; r.prio = 1; ranges.push(r); n++; }
  }
  return n;
});

await addSource("aws", "https://ip-ranges.amazonaws.com/ip-ranges.json", "Amazon AWS", (t) => {
  let n = 0;
  const j = JSON.parse(t);
  for (const p of j.prefixes || []) {
    const r = cidrToRange(p.ip_prefix);
    if (r) {
      const isCf = p.service === "CLOUDFRONT" || p.service === "CLOUDFRONT_EDGE";
      r.provider = isCf ? "Amazon CloudFront" : "Amazon AWS";
      r.prio = isCf ? 0 : 3; // CloudFront 范围优先于泛 AWS
      ranges.push(r); n++;
    }
  }
  return n;
});

await addSource("gcp", "https://www.gstatic.com/ipranges/cloud.json", "Google Cloud", (t) => {
  let n = 0;
  const j = JSON.parse(t);
  for (const p of j.prefixes || []) {
    if (!p.ipv4Prefix) continue;
    const r = cidrToRange(p.ipv4Prefix);
    if (r) { r.provider = "Google Cloud"; r.prio = 2; ranges.push(r); n++; }
  }
  return n;
});

// 去重合并:按 (start, prio, -宽度) 排序后线性扫描,重叠段保留先出现者
ranges.sort((a, b) => a.start - b.start || a.prio - b.prio || (b.end - b.start) - (a.end - a.start));
const kept = [];
for (const r of ranges) {
  const last = kept[kept.length - 1];
  if (last && r.start <= last.end) continue; // 被已有段覆盖/重叠,丢弃
  kept.push(r);
}

// 名称表(按出现顺序去重)
const providers = [];
for (const r of kept) if (!providers.includes(r.provider)) providers.push(r.provider);

// INFR1: magic(4B "INFR") ver(1B) providerCount(1B) rangeCount(u32LE) 名称表(rangeCount× u32+u32+u8)
const enc = new TextEncoder();
const headSize = 4 + 1 + 1 + 4;
let nameSize = 0;
for (const p of providers) nameSize += 1 + enc.encode(p).length;
const total = headSize + nameSize + kept.length * 9;
const buf = Buffer.alloc(total);
buf.write("INFR", 0, "latin1");
buf.writeUInt8(1, 4);
buf.writeUInt8(providers.length, 5);
buf.writeUInt32LE(kept.length, 6);
let off = headSize;
for (const p of providers) {
  const b = enc.encode(p);
  buf.writeUInt8(b.length, off); off += 1;
  buf.set(b, off); off += b.length;
}
for (const r of kept) {
  buf.writeUInt32LE(r.start, off);
  buf.writeUInt32LE(r.end, off + 4);
  buf.writeUInt8(providers.indexOf(r.provider), off + 8);
  off += 9;
}
writeFileSync(OUT_BIN, buf);

const meta = `// 由 tools/build-infra-db.mjs 自动生成;重复运行该脚本即可更新快照。
export const INFRA_META = {
  generatedAt: ${Date.now()},
  generatedAtText: ${JSON.stringify(new Date().toISOString())},
  rangeCount: ${kept.length},
  providers: ${JSON.stringify(providers)},
  sources: ${JSON.stringify(sources.map(s => ({ name: s.name, ok: s.ok, ranges: s.ranges || 0 })), null, 2)}
};
`;
writeFileSync(OUT_META, meta);

console.log("infra DB written:", OUT_BIN);
console.log("  ranges:", kept.length, " providers:", providers.join(", "));
console.log("  size:", total, "bytes");
for (const s of sources) console.log("  source", s.name, s.ok ? "OK (" + s.ranges + " ranges)" : "SKIPPED (" + s.error + ")");
