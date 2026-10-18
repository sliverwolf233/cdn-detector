# 隐私政策 / Privacy Policy(CDN 探测器 · CDN Detector)

生效日期 / Effective date: 2026-10-19

> 本页即商店提交所用隐私政策,按微软 Edge Add-ons 隐私要求逐项声明:数据类型、用途、存储与安全、第三方共享、用户控制、联系方式。

## 1. 总则

本扩展**不收集、不传输、不出售任何可识别个人身份的信息**。我们没有服务器;除下文明确说明的可选第三方查询外,所有数据仅保存在你的浏览器本地,卸载扩展即全部删除。

## 2. 我们读取哪些数据,用途是什么

| 数据 | 用途 | 是否离开设备 |
|---|---|---|
| 所访问网站主导航的响应头(CDN 特征头、缓存头) | 识别 CDN 厂商与缓存状态(核心功能) | 否 |
| 该连接的服务器 IP 与归属信息 | 显示节点地区、交叉印证厂商 | 仅开启「IP 归属地查询」时,见第 4 节 |
| DNS/TCP/TLS/TTFB 等连接时序(浏览器 Navigation Timing) | 展示连接性能瀑布图 | 否 |
| 对当前站点的少量小请求(HTTP RTT) | 近似 Ping 测量(可选、可关闭) | 只发往你正在浏览的网站本身 |
| 按站点历史(最多 50 条)、设置开关 | 弹窗内「最近检测」与偏好 | 否 |

**我们不读取、不记录键盘输入、表单内容、页面正文或凭据。**

## 3. 存储与安全

- 全部数据保存在浏览器 `storage`(会话/本地),不上传任何服务器;
- 历史记录上限 50 条、仅存域名与聚合指标(厂商、地区、TTFB、RTT);
- 卸载扩展即删除全部本地数据;也可在浏览器设置中随时清除扩展数据。

## 4. 第三方共享(可选功能)

- **ip-api.com**:开启「IP 归属地查询」时,所访问**网站的边缘节点 IP**(非你的个人 IP)会发送给该服务以查询归属地。该开关默认开启、可在弹窗设置中一键关闭;关闭后不再向任何第三方发送任何数据。
- 除此之外,本扩展不与任何第三方共享数据,不集成分析、广告或跟踪 SDK。

## 5. 用户控制

- 「IP 归属地查询」「测量 Ping」「页面角标」均可在弹窗设置中独立开关;
- 关闭前两项后,扩展不发出任何额外网络请求(仅浏览器自身的页面加载);
- 历史记录随卸载自动清除。

## 6. 儿童隐私

本扩展不面向儿童,也不明知地收集儿童信息。

## 7. 政策变更

政策如有重大变更,将随扩展更新说明一并公布。

## 8. 联系方式

邮箱:your-email@example.com(发布前请替换为真实邮箱)

---

# English Summary

This extension collects no personally identifiable information and operates no servers; everything stays in your browser and is removed on uninstall.

- **What we read (local only)**: main-frame response headers of visited sites (CDN & cache detection), connection timings (Navigation Timing), per-site history (last 50), settings. We never read keystrokes, form content, page bodies or credentials.
- **Third party (optional)**: with "IP geolocation" enabled, the visited site's edge-node IP — never your personal IP — is sent to ip-api.com. This and "Measure ping" (small requests to the site you are viewing only) can be turned off in the popup; when off, the extension makes no extra network requests.
- **User control**: each optional feature has its own toggle; history is deleted on uninstall.
- **Children**: not directed at children; no knowing collection from children.
- **Contact**: your-email@example.com (replace before publishing).
