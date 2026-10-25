# 🛡️ CDN 探测器 — 浏览器扩展

一个 Chrome / Edge(Chromium,MV3)扩展。打开任意网站,点击工具栏图标,即可看到:

- 该域名**是否接入 CDN**:已接入 / 疑似缓存层 / 未检测到
- 命中的 **CDN 提供商**:Cloudflare、AWS CloudFront、Fastly、Akamai、Vercel、Azure Front Door、阿里云、腾讯云、网宿、七牛、华为云等 18+ 家
- 分配到的**边缘节点 POP 代码与地区**:例如 `CF-RAY: …-HKG → 香港`、`X-Served-By: cache-fra… → 德国 法兰克福`、`X-Vercel-Id: cle1::… → 美国 克利夫兰`
- 服务器 **IP 与归属地 / ASN**(可选,走 ip-api.com 中文接口)
- 扩展图标**角标**直接显示 CDN 短名(如 `CF`),绿色=已接入、橙色=疑似
- **连接时序与 Ping**:DNS / TCP / TLS / TTFB / 下载分段瀑布图、协议与压缩信息、HTTP RTT 近似 Ping
- **缓存状态**:浏览器本地缓存命中(Navigation Timing)+ CDN 边缘缓存命中(`X-Cache`/`CF-Cache-Status`/`Age`)
- **开发者工具箱**:9 项安全响应头体检 ✓✗、一键复制 Markdown 报告、全部响应头查看、页面域名分布(各子域命中的 CDN,`webRequest` 不受 CORS 限制)
- **离线 ASN/云归属库**:内置官方 IP 段编译的 57KB 二进制库(Cloudflare/AWS/CloudFront/GCP,约 6300 段 IPv4),关闭第三方查询也能标注 IP 归属;ip-api 结果另有 AS 号→厂商短名对照。更新:`node tools/build-infra-db.mjs` 重新拉取官方源并重编快照
- **WAF 被动识别**:AWS WAF/Cloudflare(质询)/Imperva/F5 BIG-IP/Akamai/ModSecurity/宝塔/Reblaze 指纹(专属头 + Set-Cookie + Server 值);记录主文档状态码,403/406/429/503 命中 WAF 时弹窗红字警示「可能被拦截/质询」。不做主动探测
- **SPA 友好**:跟踪 History/hash 软导航,按需自动重测 Ping;常驻后台运行(页面角标默认关闭、可在设置开启;按站点历史)
- **9 种语言界面**:简/繁中文、英、日、韩、俄、法、德、西(chrome.i18n 按浏览器语言自动切换)

## 安装

1. 打开 `chrome://extensions`(Edge 为 `edge://extensions`)
2. 打开右上角「开发者模式」
3. 点击「加载已解压的扩展程序」,选择本目录(`CDN_Visual_Plugin`)
4. 打开任意网站(如 `github.com`、`www.aliyun.com`),点击工具栏图标查看结果

## 工作原理(三层证据,从强到弱)

1. **响应头指纹** — 通过 `chrome.webRequest` 只读主导航响应头,按规则表匹配厂商特征头:
   - `cf-ray` → Cloudflare;`x-amz-cf-id` / `x-cache: …cloudfront` → CloudFront
   - `x-served-by: cache-*` → Fastly;`x-vercel-id` → Vercel;`eagleid` → 阿里云;`x-nws-log-uuid` → 腾讯云 …
   - 命中厂商专属头 → 「已接入」;仅命中通用缓存头(`x-cache`、`via`、`age` …)→ 「疑似」;都没有 → 「未检测到」
2. **POP 代码解析** — 从厂商头里提取节点代码并对照内置 IATA 代码表显示地区:
   - `cf-ray` 尾段(如 `-HKG`)、`x-amz-cf-pop`(如 `HKG62-P16`)、`x-served-by`(如 `cache-fra19128`)、`x-vercel-id` 前缀(如 `cle1::`)
   - 未收录的代码会原样显示,不猜测
3. **IP 归属地 (ASN)** — 用响应的服务器 IP 查询 ip-api.com,显示城市/运营商/AS 号;ASN 组织名还能反向印证 CDN 厂商(如 AS13335 Cloudflare)
4. **连接时序与 Ping** — 内容脚本读取主导航的 Navigation Timing(DNS/TCP/TLS/TTFB/下载),并对当前站点发起小请求测 HTTP RTT 近似 Ping(可关闭)
5. **缓存与 SPA** — `transferSize=0` 判定浏览器本地缓存命中;`X-Cache`/`CF-Cache-Status`/`Age` 判定 CDN 边缘缓存;`webNavigation` 跟踪单页应用软导航

## 权限与隐私

| 权限 | 用途 |
|---|---|
| `webRequest` + `http://*/*`、`https://*/*` | 只读所访问网站主导航的响应头与服务器 IP;不修改、不拦截请求 |
| `storage` | 按标签页暂存检测结果(session);保存设置与按站点历史(local) |
| `webNavigation` | 跟踪单页应用(SPA)的软导航以刷新记录,不读取页面内容 |
| 声明式内容脚本(仅 http/https) | 在页面内只读采集连接时序并显示角标;「测量 Ping」才向当前站点发起请求 |

权限最小化说明:读取当前标签页地址由主机权限授予,无需 `tabs`;内容脚本经 manifest 声明自动注入,无需 `scripting`(扩展安装前已打开的页面需刷新一次才有数据)。

- IP 归属地查询默认开启,可在弹窗底部关闭;关闭后**不会向任何第三方发送请求**。
- 查询对象是所访问站点的边缘节点 IP(不是你的 IP),发送给 `ip-api.com`。
- Ping 测量只访问当前站点本身;关闭开关后不发起任何测量请求。

## 局限性

- 无特征头的 CDN(白标/自建)会显示「未检测到」;`server: nginx` 之类不作为 CDN 依据。
- POP 代码表收录 100+ 常用节点,未收录时只显示代码本身。
- ip-api.com 免费接口为 HTTP、限 45 次/分钟,超限时弹窗会显示错误并可重试。
- 浏览器内部页面(`chrome://`、商店页等)无法检测。
- 部分国内 CDN 不透出 POP 信息,此时地区由 IP 归属地推断。

## 目录结构

```
CDN_Visual_Plugin/
├── manifest.json          # MV3 清单
├── background.js          # Service Worker:抓响应头、检测、角标、IP 归属地、时序与 Ping 代理
├── content/timing.js      # 内容脚本:导航时序采集 + HTTP RTT 测量
├── lib/detect.js          # 检测引擎(纯函数)
├── rules/
│   ├── cdn-providers.js   # CDN 指纹规则(厂商特征头 + ASN 线索)
│   └── pop-codes.js       # POP/IATA 代码 → 地区名表
├── popup/
│   ├── popup.html         # 弹窗结构
│   ├── popup.css          # 弹窗样式(深色)
│   └── popup.js           # 弹窗渲染逻辑
├── icons/                 # 生成的图标(16/32/48/128)
├── _locales/              # i18n 语言包(9 种语言)
├── tools/
│   ├── make_icons.py      # 图标生成脚本(Pillow)
│   ├── pack.ps1           # 打包与签名脚本(CRX3 + 商店 zip)
│   └── crx_key.mjs        # 签名私钥管理(PKCS#8 转换 + 扩展 ID)
├── dist/                  # 打包产物(签名 crx / 商店 zip / 私钥)
├── test/
│   ├── detect.test.mjs    # 检测引擎单元测试
│   └── i18n.test.mjs      # 语言包结构单元测试
├── package.json
└── README.md
```

## 开发与测试

```bash
npm test          # 或: node test/detect.test.mjs
```

测试用一组模拟响应头验证检测引擎:厂商识别、POP 提取、地区解析、通用缓存层判断、ASN 线索。

重新生成图标(需要 Python + Pillow):

```bash
python tools/make_icons.py
```

## 连接时序与 Ping

弹窗中的「连接时序」与「Ping」卡片数据来源:

- **DNS / TCP 握手 / TLS 握手 / TTFB / 内容下载**:来自浏览器为主导航建立真实连接的 Navigation Timing(内容脚本采集)。TCP 段不含 TLS;TLS 段仅 HTTPS 且新建连接时有值。
- **连接合计** = 上述五段之和(不含 DOM 处理);分段瀑布图与六宫格指标一一对应。
- **协议 / 传输大小 / 压缩比**:`nextHopProtocol`(h2/h3/http1.1)与 `transferSize`/`encodedBodySize`/`decodedBodySize`。
- **Ping**:浏览器扩展无法发送 ICMP;改用对当前站点 `favicon.ico` 的 no-cors 小请求近似 HTTP 往返,预热 1 次后取 3 次中位数。打开弹窗时自动测一次,也可点「测量」手动重测。

诚实的限制:

- 连接被复用或 DNS 有缓存时,对应段为 0(界面会提示「复用连接」)。
- RTT 含 HTTP 开销,通常略高于 ICMP Ping。
- TLS 版本 / 密码套件等细节浏览器未向扩展开放,故不展示。

## 缓存与 SPA

- **浏览器缓存**:Navigation Timing 的 `transferSize` 为 0 且有解码体积 → 命中本地缓存(未发生网络传输);`transferSize > 0` → 未命中。
- **CDN 边缘缓存**:解析 `cf-cache-status`、`x-cache`、`x-cache-lookup`、`x-varnish` 等头的 HIT/MISS/BYPASS/DYNAMIC 等取值;`Age` 头显示对象在边缘的存活秒数。
- **SPA(单页应用)**:React/Vue 等的路由切换不产生新的主导航请求,CDN 检测结论按域名保持有效;扩展通过 `webNavigation.onHistoryStateUpdated/onReferenceFragmentUpdated` 跟踪软导航,刷新记录并按需(距上次 ≥30s)自动重测 Ping。若扩展是在页面已打开后才安装,需刷新一次页面才有数据。

## 多语言 (i18n / l10n)

扩展内置 **9 种语言**(`zh_CN` 简体中文、`zh_TW` 繁體中文、`en` English、`ja` 日本語、`ko` 한국어、`ru` Русский、`fr` Français、`de` Deutsch、`es` Español),基于 Chrome 标准的 `chrome.i18n` 机制:

- `_locales/<locale>/messages.json` — 每种语言一份键值表,含翻译说明与 `$XXX$` 占位符
- `manifest.json` 声明 `default_locale: "en"`;名称、描述、弹窗标题用 `__MSG_xxx__` 引用
- 浏览器按自身界面语言选择:简体中文 → `zh_CN`,其他语言 → 回退英文
- 弹窗 HTML 的静态文本在加载时按 `data-i18n` 属性注入;动态文本用 `chrome.i18n.getMessage(key, 替换值)`(file:// 预览时回退内置中文)

新增一种语言只需两步,不用改任何代码:

1. 复制 `_locales/en` 为 `_locales/<语言代码>`(如 `ja`、`zh_TW`)
2. 翻译其中 `messages.json` 的 `message` 字段(保留 `$XXX$` 占位符),重新加载扩展或重跑 `tools\pack.ps1`

语言包有结构单元测试兜底(各语言键集合一致、占位符一致、manifest 引用无缺失、popup 回退词典同步):

```bash
node test/i18n.test.mjs
```

## 打包与签名 (CRX3)

```powershell
powershell -ExecutionPolicy Bypass -File tools\pack.ps1
```

脚本自动完成:暂存运行时文件 → 用本机 Chrome/Edge 的 `--pack-extension` 生成 **CRX3 签名包** → 生成商店上传 zip → 打印由公钥派生的**扩展 ID**。产物位于 `dist/`:

| 产物 | 说明 |
|---|---|
| `dist/cdn-detector-<版本>.crx` | CRX3 签名包(魔数 `Cr24` v3 已校验) |
| `dist/cdn-detector-<版本>-webstore.zip` | Chrome Web Store / Edge Add-ons 上传包(商店会重新签名) |
| `dist/extension_key.pem` | RSA-2048 签名私钥(**PKCS#8 PEM**,Chrome 只认此格式);请保密,复用它扩展 ID 才稳定 |

经验备注:

- 私钥必须是 **PKCS#8** 的 PEM(`-----BEGIN PRIVATE KEY-----`);PKCS#1(`BEGIN RSA PRIVATE KEY`)会被 Chrome 拒绝并报 `Malformed PrivateKeyInfo`。
- 新版 Chrome 移除了图形界面的「打包扩展程序」按钮,但 `--pack-extension` 命令行开关仍然可用(已在 Chrome 150 Dev 验证)。

安装 CRX 的现实限制(浏览器安全策略,非本插件问题):

- **Chrome**:默认拒绝安装非 Web Store 来源的 CRX。自用请继续用「加载已解压的扩展程序」;企业内部分发需配合组策略 `ExtensionInstallForcelist` + 自托管 `update.xml`。
- **Edge**:`edge://extensions` 开启开发人员模式后,部分版本允许拖入 CRX 侧载(会有风险提示)。
- **上架商店**:直接上传 webstore zip,由商店负责签名与分发,这是普通用户安装的最顺路径。

## 卸载

扩展管理页 → 找到「CDN 探测器」→ 移除。
