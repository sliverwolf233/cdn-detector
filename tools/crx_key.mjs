// 确保签名私钥存在且为 PKCS#8 PEM(Chrome --pack-extension-key 只接受该格式)。
// 旧版 PKCS#1 密钥会被原地转换。向 stdout 打印由公钥派生的 32 位扩展 ID(a-p)。
// 用法: node tools/crx_key.mjs
import { generateKeyPairSync, createPrivateKey, createPublicKey, createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const keyPath = join(dist, "extension_key.pem");
mkdirSync(dist, { recursive: true });

if (existsSync(keyPath)) {
  const text = readFileSync(keyPath, "utf8");
  if (text.includes("BEGIN RSA PRIVATE KEY")) {
    writeFileSync(keyPath, createPrivateKey(text).export({ type: "pkcs8", format: "pem" }));
  }
} else {
  const pair = generateKeyPairSync("rsa", { modulusLength: 2048 });
  writeFileSync(keyPath, pair.privateKey.export({ type: "pkcs8", format: "pem" }));
}

const pub = createPublicKey(readFileSync(keyPath, "utf8"));
const der = pub.export({ type: "spki", format: "der" });
const hex = createHash("sha256").update(der).digest("hex");
let id = "";
for (let i = 0; i < 32; i++) id += String.fromCharCode(97 + parseInt(hex[i], 16));
process.stdout.write(id);
