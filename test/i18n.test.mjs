// 语言包结构测试: node test/i18n.test.mjs
// 校验所有 _locales/*/messages.json 可解析、键集合一致、占位符一致、
// manifest 引用的键存在、popup 回退词典与语言包键集合一致。
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const localesRoot = join(root, "_locales");

let failures = 0;
function check(label, cond, extra) {
  if (cond) console.log("PASS  " + label);
  else { failures++; console.log("FAIL  " + label + (extra ? "  " + extra : "")); }
}

const locales = readdirSync(localesRoot, { withFileTypes: true })
  .filter(function (d) { return d.isDirectory(); })
  .map(function (d) { return d.name; })
  .sort();
check("at least 2 locales present", locales.length >= 2, locales.join(","));

const packs = {};
for (const loc of locales) {
  try {
    packs[loc] = JSON.parse(readFileSync(join(localesRoot, loc, "messages.json"), "utf8"));
  } catch (e) {
    check("parse " + loc, false, String(e.message));
  }
}

const baseKeys = Object.keys(packs[locales[0]] || {}).sort().join(",");
for (const loc of locales) {
  const keys = Object.keys(packs[loc] || {}).sort().join(",");
  check("key set identical: " + loc, keys === baseKeys && keys.length > 0, keys.length + " keys");
  for (const k of Object.keys(packs[loc])) {
    if (!packs[loc][k].message) check("non-empty message " + loc + "/" + k, false);
  }
}

for (const loc of locales) {
  for (const k of Object.keys(packs[loc])) {
    const pe = (String(packs[loc][k].message).match(/\$[A-Z]+\$/g) || []).sort().join(",");
    const pb = (String(packs[locales[0]][k].message).match(/\$[A-Z]+\$/g) || []).sort().join(",");
    if (pe !== pb) check("placeholders match: " + loc + "/" + k, false, pe + " vs " + pb);
  }
}
console.log("PASS  placeholder parity across " + locales.length + " locales");

const manifest = readFileSync(join(root, "manifest.json"), "utf8");
for (const ref of manifest.match(/__MSG_[A-Za-z0-9_]+__/g) || []) {
  const key = ref.slice(6, -2);
  const present = locales.every(function (l) { return !!packs[l][key]; });
  check("manifest key exists in all locales: " + key, present);
}
check("default_locale declared", /"default_locale"\s*:/.test(manifest));

// popup 回退词典(必须与语言包键集合一致,且为严格 JSON)
const popupSrc = readFileSync(join(root, "popup", "popup.js"), "utf8");
const m = popupSrc.match(/const FALLBACK = (\{[\s\S]*?\n\});/);
check("FALLBACK block found in popup.js", !!m);
if (m) {
  let fb = null;
  try { fb = JSON.parse(m[1]); } catch (e) { check("FALLBACK is strict JSON", false, String(e.message)); }
  if (fb) {
    const fbKeys = Object.keys(fb).sort().join(",");
    check("FALLBACK key set matches locales", fbKeys === baseKeys, fbKeys.length + " vs " + baseKeys.split(",").length);
  }
}

if (failures) throw new Error(failures + " test(s) failed");
console.log("All i18n tests passed (" + baseKeys.split(",").length + " keys x " + locales.length + " locales)");
