# 隐私政策 / Privacy Policy(CDN 探测器 · CDN Detector)

生效日期 / Effective date: 2026-10-19

> 提交 Edge Add-ons / Chrome Web Store 前,请把本文件托管到可公开访问的网址(如 GitHub Pages),并把联系方式占位符替换为你的真实邮箱。

## 中文

本扩展不收集、不上传任何可识别个人身份的信息。我们没有服务器,所有检测数据只保存在你的浏览器本地。

**扩展读取的数据(均留在本地)**
- 所访问网站主导航的响应头(用于识别 CDN 厂商与缓存状态);
- 该连接的服务器 IP、DNS/TCP/TLS/TTFB 等连接时序(来自浏览器 Navigation Timing);
- 按站点保存的最近 50 条检测历史(仅存本地,卸载扩展即删除)。

**会离开浏览器的数据(均可关闭)**
- 开启「IP 归属地查询」时,所访问网站的边缘节点 IP 会被发送给第三方服务 ip-api.com 用于查询归属地;此查询不涉及你的个人 IP。关闭后不再发送。
- 「测量 Ping」只会向你正在浏览的网站本身发起几个小请求,不涉及第三方。

**权限用途**
- webRequest:只读响应头;webNavigation:跟踪单页应用路由切换;tabs:读取当前标签页地址;scripting + 内容脚本:在页面内只读采集时序并显示角标;storage:本地保存设置与历史。

**其他**
- 我们不使用分析、广告或跟踪 SDK。
- 政策如有重大变更会在更新说明中注明。联系:your-email@example.com(请替换)。

## English

This extension collects no personally identifiable information and has no servers of its own; all detection data stays in your browser.

Data read (local only): main-frame response headers of sites you visit (CDN & cache detection), the connection's server IP and DNS/TCP/TLS/TTFB timings (browser Navigation Timing), and a per-site history of the last 50 checks (deleted when you uninstall).

Data that can leave the browser (both optional, off-switch in the popup): with IP geolocation enabled, the visited site's edge-node IP is sent to the third-party service ip-api.com — never your personal IP; "Measure ping" only sends a few small requests to the site you are currently viewing.

Permissions: webRequest (read response headers), webNavigation (SPA route tracking), tabs (current tab address), scripting + content script (read-only timing collection and the on-page chip), storage (settings and history).

No analytics, ads or tracking SDKs are used. Contact: your-email@example.com (replace before publishing).
