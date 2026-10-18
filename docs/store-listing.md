# Edge Add-ons 商店提交文案(可直接粘贴)

配套文件:上传包用 `dist/cdn-detector-1.4.0-webstore.zip`;商店图标用 `icons/icon128.png`(128×128)。
提交入口:Partner Center → Microsoft Edge 计划 → 概述 → 创建新扩展。

## 表单逐项对照

| Partner Center 字段 | 填什么 | 来源 |
|---|---|---|
| 上传包 | dist/cdn-detector-1.4.0-webstore.zip | tools\pack.ps1 产物 |
| 名称(中文) | CDN 探测器 — CDN·节点地区·连接时序 | 见下 |
| 名称(英文) | CDN Detector — provider, POP region & timing | 见下 |
| 简短说明 | 下文「简短描述」 | ≤ 约 132 字符 |
| 详细说明 | 下文「详细描述」 | 支持简单排版 |
| 类别 | 开发人员工具 / Developer Tools | |
| 隐私策略 URL | 托管 docs/privacy-policy.md 后的网址(GitHub Pages 即可) | 必填 |
| 网站 URL(可选) | 你的项目主页或 GitHub 仓库 | |
| 支持 URL(可选) | GitHub Issues 页面 | |
| 商店图标 | icons/icon128.png | 128×128 PNG |
| 截图 | 自行截取弹窗,建议 1280×800,3–5 张 | 见下 |
| 商店语言 | zh-CN 与 en(文案都已备好) | |

截图建议(打开任一 CDN 网站后截弹窗):① 弹窗全貌(状态+提供商+POP) ② 连接时序瀑布图 ③ Ping 卡片与页面右下角浮动角标 ④ 最近检测历史。

---

## 中文文案

**名称**:
CDN 探测器 — CDN·节点地区·连接时序

**简短描述**:
查看网站是否由 CDN 保护、命中哪家 CDN、分配到哪个边缘节点(地区),并显示 DNS/TCP/TLS/TTFB 时序与 Ping。

**详细描述**:
一键查看当前网站背后的 CDN:

【CDN 识别】是否接入 CDN;命中 18+ 家厂商(Cloudflare、CloudFront、Fastly、Akamai、Vercel、Azure Front Door、阿里云、腾讯云 EdgeOne、七牛、华为云等),并给出判定依据响应头。

【边缘节点】解析 POP 代码显示地区(如 CF-RAY …-HKG → 香港);配合 IP 归属(ASN)交叉印证厂商与所在地。

【连接时序】DNS 解析 / TCP 握手 / TLS 握手 / 首字节(TTFB) / 内容下载分段瀑布图;协议版本(h2/h3)、传输大小、压缩比、浏览器缓存与 CDN 边缘缓存命中状态。

【Ping】HTTP 往返近似 RTT(3 次取中位数,需说明浏览器无法发 ICMP)。

【常驻后台】无需打开弹窗:图标角标、页面浮动角标、自动检测与自动 Ping、按站点历史记录,均默认开启且可关闭。

【多语言】简/繁中文、英、日、韩、俄、法、德、西。

【隐私】检测数据只存本地;IP 归属地查询(走 ip-api.com)与 Ping 测量均可一键关闭;不收集任何个人数据。

---

## 英文文案

**Name**:
CDN Detector — provider, POP region & timing

**Short description**:
See if a site is behind a CDN, which provider and edge POP region it hits, plus DNS/TCP/TLS/TTFB timing and ping.

**Detailed description**:
One click to see the CDN behind any website:

• CDN detection: 18+ providers (Cloudflare, CloudFront, Fastly, Akamai, Vercel, Azure Front Door, Alibaba, Tencent EdgeOne, Qiniu, Huawei and more), with the evidence headers.
• Edge node: POP code decoded into a region (e.g. CF-RAY …-HKG → Hong Kong), cross-checked via IP owner (ASN).
• Connection timing: waterfall of DNS / TCP / TLS handshake / TTFB / download; protocol (h2/h3), transfer size, compression, browser cache and CDN edge cache status.
• Ping: HTTP round-trip approximation (median of 3; ICMP is not available to extensions).
• Always-on: icon badge, on-page chip, auto detection & ping, per-site history — all optional.
• 9 languages. All data stays local; IP geolocation and ping can be turned off.

---

## 许可理由(Permission Justification,审核表单直接粘贴)

自 v1.4.1 起权限已最小化:移除了 `tabs` 与 `scripting`,主机权限从 `<all_urls>` 收窄为 `http://*/*` 与 `https://*/*`。

**中文**:

- `webRequest`:扩展的唯一功能是检测用户所访问网站的 CDN。需只读读取主导航响应头以识别 CDN 厂商特征头(如 `cf-ray`、`x-amz-cf-id`)与缓存状态头(`x-cache`、`age`);不修改、不拦截、不重定向任何请求。
- `webNavigation`:单页应用(React/Vue)的客户端路由切换不产生新的网络导航,需要 `onHistoryStateUpdated`/`onReferenceFragmentUpdated` 事件刷新检测记录并按需重测延迟;不读取页面内容。
- `storage`:在浏览器本地保存用户设置、当前标签页检测结果与按站点历史(上限 50 条);不上传任何数据到任何服务器。
- 主机匹配模式 `http://*/*`、`https://*/*`:CDN 检测必须对用户访问的每个网站生效,这是扩展的核心用途;同时用于在页面内注入只读的时序采集脚本(经 manifest 声明)并在弹窗中显示当前标签页地址。不含 `file://`、`ftp://` 等其他协议。

**English**:

- `webRequest`: the extension's single purpose is CDN detection on sites the user visits. It reads main-frame response headers only (provider fingerprints like `cf-ray`, cache headers like `x-cache`/`age`); it never modifies, blocks or redirects requests.
- `webNavigation`: single-page apps change routes without a new network navigation; `onHistoryStateUpdated`/`onReferenceFragmentUpdated` refresh the detection record and optionally re-measure latency. Page content is not read.
- `storage`: stores settings, per-tab results and a local 50-entry per-site history in the browser; nothing is uploaded.
- Host patterns `http://*/*`, `https://*/*`: CDN detection must work on every website the user visits — this is the core feature. The same access injects the read-only timing collector (manifest-declared) and shows the current tab's address in the popup. No `file://` or other schemes.

---

## 更新版本流程

1. 改 manifest.json 的 version(必须递增)
2. 重跑 powershell -ExecutionPolicy Bypass -File tools\pack.ps1
3. Partner Center → 该扩展 → 更新 → 上传新 zip → 提交
