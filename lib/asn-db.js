// 离线基础设施库(INFR1 二进制):IPv4 → 厂商名,纯本地二分查找。
// 数据由 tools/build-infra-db.mjs 从官方公开 IP 段编译;重复运行该脚本即可更新。

import { INFRA_META } from "../rules/infra-meta.js";

let view = null;
let buf = null;
let rangeCount = 0;
let rangesOffset = 0;
let providerNames = [];

function ipv4ToU32(ip) {
  if (typeof ip !== "string") return null;
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let v = 0;
  for (const p of parts) {
    const n = /^d+$/.test(p) ? Number(p) : NaN;
    if (!(n >= 0 && n <= 255)) return null;
    v = ((v << 8) | n) >>> 0;
  }
  return v >>> 0;
}

export async function initInfraDb() {
  if (view) return true;
  try {
    const resp = await fetch(chrome.runtime.getURL("rules/infra-ranges.bin"));
    buf = await resp.arrayBuffer();
    view = new DataView(buf);
    // INFR1 头:magic(4) ver(1) providerCount(1) rangeCount(u32LE)
    if (view.getUint8(0) !== 0x49 || view.getUint8(1) !== 0x4E || view.getUint8(2) !== 0x46 || view.getUint8(3) !== 0x52) return false;
    if (view.getUint8(4) !== 1) return false;
    const providerCount = view.getUint8(5);
    rangeCount = view.getUint32(6, true);
    let off = 10;
    const dec = new TextDecoder();
    providerNames = [];
    for (let i = 0; i < providerCount; i++) {
      const len = view.getUint8(off); off += 1;
      providerNames.push(dec.decode(new Uint8Array(buf, off, len)));
      off += len;
    }
    rangesOffset = off;
    return true;
  } catch (e) {
    view = null;
    return false;
  }
}

// 返回 { name } 或 null;未初始化/无库时安静返回 null
export function lookupInfra(ip) {
  if (!view) return null;
  const v = ipv4ToU32(ip);
  if (v === null) return null;
  let lo = 0;
  let hi = rangeCount - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const o = rangesOffset + mid * 9;
    const s = view.getUint32(o, true);
    const e = view.getUint32(o + 4, true);
    if (v < s) hi = mid - 1;
    else if (v > e) lo = mid + 1;
    else return { name: providerNames[view.getUint8(o + 8)] || null };
  }
  return null;
}

export function infraDbInfo() {
  return INFRA_META || null;
}
