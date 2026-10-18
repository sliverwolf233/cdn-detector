# 商店清单 · 9 种语言文案(名称 / 简短说明 / 详细说明)

> Partner Center 每种"支持的语言"都需要:名称、简短说明(约 ≤132 字符)、详细说明。以下按语言分节,直接复制粘贴。
> 若只想维护两种,声明 zh-CN 与 en 即可,扩展界面语言不受商店声明影响。

---

## 简体中文 (zh-CN)

**名称**:CDN 探测器 — CDN·节点地区·连接时序

**简短说明**:查看网站是否由 CDN 保护、命中哪家 CDN、分配到哪个边缘节点(地区),并显示 DNS/TCP/TLS/TTFB 时序与 Ping。

**详细描述**:
CDN 探测器 —— 一键查看任何网站背后的 CDN。

【CDN 识别】显示当前网站是否由 CDN 保护/加速;自动识别 18+ 家厂商:Cloudflare、Amazon CloudFront、Fastly、Akamai、Vercel、Netlify、Azure Front Door、Google Cloud、阿里云、腾讯云 CDN/EdgeOne、七牛云、华为云、金山云、Gcore、CDN77、BFE 等,并展示判定依据的响应头。

【边缘节点与归属】解析 POP 代码并显示地区(如 CF-RAY …-HKG → 香港);结合服务器 IP 归属地(城市/运营商/AS 号)交叉印证厂商与位置。

【连接时序】主导航真实连接的细分瀑布图:DNS 解析、TCP 握手、TLS 握手、首字节时间(TTFB)、内容下载;另有连接合计、协议版本(h2/h3/HTTP1.1)、传输大小与压缩比。

【缓存状态】浏览器本地缓存命中(基于 Navigation Timing)与 CDN 边缘缓存命中(X-Cache / CF-Cache-Status / Age)一目了然。

【Ping / RTT】以 HTTP 往返近似测量到该站点的延迟(预热后 3 次取中位数;浏览器扩展无法发送 ICMP,故为近似值,界面已如实标注)。

【常驻后台,无需打开弹窗】图标角标显示厂商短名;页面右下角浮动角标(厂商 · 地区 · 延迟);导航后自动检测与自动测量;按站点保存最近 50 条检测历史。

【SPA 友好】跟踪单页应用(React/Vue 等)的客户端路由切换,自动刷新记录并按需重测延迟。

【多语言】简体/繁体中文、英语、日语、韩语、俄语、法语、德语、西班牙语,共 9 种界面语言。

【隐私】不收集任何个人数据;检测结果只存浏览器本地;IP 归属地查询(第三方 ip-api.com)、Ping 测量与页面角标均可一键关闭。

---

## 繁體中文 (zh-TW)

**名稱**:CDN 偵測器 — CDN·節點地區·連線時序

**簡短說明**:查看網站是否由 CDN 保護、命中哪家 CDN、分配到哪個邊緣節點(地區),並顯示 DNS/TCP/TLS/TTFB 時序與 Ping。

**詳細描述**:
CDN 偵測器 —— 一鍵查看任何網站背後的 CDN。

【CDN 識別】顯示目前網站是否由 CDN 保護/加速;自動識別 18+ 家廠商:Cloudflare、Amazon CloudFront、Fastly、Akamai、Vercel、Netlify、Azure Front Door、Google Cloud、阿里雲、騰訊雲 CDN/EdgeOne、七牛雲、華為雲、金山雲、Gcore、CDN77、BFE 等,並顯示判定依據的回應標頭。

【邊緣節點與歸屬】解析 POP 代碼並顯示地區(如 CF-RAY …-HKG → 香港);結合伺服器 IP 歸屬地(城市/電信業者/AS 號)交叉印證廠商與位置。

【連線時序】主導覽真實連線的細分瀑布圖:DNS 解析、TCP 握手、TLS 握手、首位元組時間(TTFB)、內容下載;另有連線合計、通訊協定版本(h2/h3/HTTP1.1)、傳輸大小與壓縮比。

【快取狀態】瀏覽器本機快取命中(基於 Navigation Timing)與 CDN 邊緣快取命中(X-Cache / CF-Cache-Status / Age)一目瞭然。

【Ping / RTT】以 HTTP 往返近似測量到該網站的延遲(預熱後取 3 次中位數;瀏覽器擴充功能無法傳送 ICMP,故為近似值,介面已如實標註)。

【常駐背景,無需開啟彈窗】圖示角標顯示廠商短名;頁面右下角浮動角標(廠商 · 地區 · 延遲);導覽後自動偵測與自動測量;按網站保存最近 50 筆偵測歷史。

【SPA 支援】追蹤單頁應用(React/Vue 等)的用戶端路由切換,自動重新整理記錄並按需重測延遲。

【多語言】簡體/繁體中文、英語、日語、韓語、俄語、法語、德語、西班牙語,共 9 種介面語言。

【隱私】不收集任何個人資料;偵測結果只存瀏覽器本機;IP 歸屬地查詢(第三方 ip-api.com)、Ping 測量與頁面角標均可一鍵關閉。

---

## English (en)

**Name**:CDN Detector — provider, POP region & timing

**Short description**:See if a site is behind a CDN, which provider and edge POP region it hits, plus DNS/TCP/TLS/TTFB timing and ping.

**Detailed description**:
CDN Detector — see the CDN behind any website with one click.

• CDN detection: shows whether the current site is served by a CDN, identifying 18+ providers (Cloudflare, Amazon CloudFront, Fastly, Akamai, Vercel, Netlify, Azure Front Door, Google Cloud, Alibaba Cloud, Tencent CDN/EdgeOne, Qiniu, Huawei Cloud, Kingsoft, Gcore, CDN77, BFE and more), with the evidence response headers.
• Edge node & geolocation: POP codes decoded into regions (e.g. CF-RAY …-HKG → Hong Kong), cross-checked with the server IP's city/ISP/ASN.
• Connection timing: waterfall of the real main navigation — DNS, TCP handshake, TLS handshake, TTFB, content download — plus total, protocol (h2/h3/HTTP1.1), transfer size and compression.
• Cache status: browser local cache hit (Navigation Timing) and CDN edge cache hit (X-Cache / CF-Cache-Status / Age).
• Ping / RTT: HTTP round-trip approximation (median of 3 after warm-up; ICMP is unavailable to extensions, and the UI says so honestly).
• Always-on without opening the popup: provider badge on the toolbar icon, on-page chip (provider · region · latency), automatic detection and measurement after each navigation, per-site history of the last 50 checks.
• SPA-friendly: tracks client-side routing of single-page apps, refreshing records and re-measuring latency as needed.
• 9 interface languages: Simplified/Traditional Chinese, English, Japanese, Korean, Russian, French, German, Spanish.
• Privacy: no personal data collected; results stay in your browser; IP geolocation (ip-api.com), ping and the on-page chip can each be turned off with one click.

---

## 日本語 (ja)

**名前**:CDN 検出器 — CDN・エッジ地域・接続タイミング

**簡単な説明**:サイトが CDN 経由か、どの事業者・エッジノード(地域)に割り当てられたかを表示。DNS/TCP/TLS/TTFB タイミングと Ping 測定にも対応。

**詳細説明**:
CDN 検出器 —— ワンクリックであらゆるサイトの背後にある CDN を確認。

【CDN 検出】現在のサイトが CDN で保護・高速化されているかを表示。Cloudflare、Amazon CloudFront、Fastly、Akamai、Vercel、Netlify、Azure Front Door、Google Cloud、Alibaba Cloud、Tencent CDN/EdgeOne、Qiniu、Huawei Cloud、Kingsoft、Gcore、CDN77、BFE など 18 社以上を自動識別し、判定根拠のレスポンスヘッダーも表示します。

【エッジノードと所在地】POP コードを解析して地域を表示(例:CF-RAY …-HKG → 香港)。サーバー IP の所在地(都市/ISP/AS 番号)と突き合わせて事業者と位置を確認できます。

【接続タイミング】メインナビゲーションの実際の接続の細分ウォーターフォール:DNS 解決、TCP ハンドシェイク、TLS ハンドシェイク、TTFB、コンテンツ受信。合計、プロトコル(h2/h3/HTTP1.1)、転送サイズと圧縮率も表示。

【キャッシュ状態】ブラウザーローカルキャッシュのヒット(Navigation Timing)と CDN エッジキャッシュのヒット(X-Cache / CF-Cache-Status / Age)を一目で確認。

【Ping / RTT】HTTP 往復による近似レイテンシを測定(ウォームアップ後 3 回の中央値。拡張機能は ICMP を送れないため近似値であり、UI にも明記)。

【常駐バックグラウンド】ポップアップを開かなくても:ツールバーアイコンのバッジ、ページ右下のフローティングバッジ(事業者 · 地域 · レイテンシ)、ナビゲーションごとの自動検出と自動測定、サイト別に直近 50 件の履歴。

【SPA 対応】シングルページアプリ(React/Vue など)のクライアント側ルーティングを追跡し、記録を自動更新、必要に応じてレイテンシを再測定。

【多言語】簡体字/繁体字中国語、英語、日本語、韓国語、ロシア語、フランス語、ドイツ語、スペイン語の 9 言語 UI。

【プライバシー】個人データを収集せず、検出結果はブラウザー内のみ。IP 所在地照会(サードパーティ ip-api.com)、Ping 測定、ページバッジはそれぞれワンクリックでオフにできます。

---

## 한국어 (ko)

**이름**:CDN 탐지기 — CDN·노드 지역·연결 타이밍

**짧은 설명**:사이트의 CDN 보호 여부, 할당된 사업자와 엣지 노드(지역), DNS/TCP/TLS/TTFB 타이밍과 Ping을 표시합니다.

**상세 설명**:
CDN 탐지기 —— 원클릭으로 모든 사이트 뒤의 CDN을 확인하세요.

【CDN 식별】현재 사이트가 CDN으로 보호·가속되는지 표시합니다. Cloudflare, Amazon CloudFront, Fastly, Akamai, Vercel, Netlify, Azure Front Door, Google Cloud, 알리바바 클라우드, 텐센트 CDN/EdgeOne, 치니우, 화웨이 클라우드, 킹소프트, Gcore, CDN77, BFE 등 18개 이상 사업자를 자동 식별하며 판정 근거 응답 헤더도 보여 줍니다.

【엣지 노드와 소재】POP 코드를 해석해 지역을 표시(예: CF-RAY …-HKG → 홍콩). 서버 IP 소재(도시/ISP/AS 번호)와 교차 확인합니다.

【연결 타이밍】기본 탐색의 실제 연결 폭포수: DNS 조회, TCP 핸드셰이크, TLS 핸드셰이크, TTFB, 콘텐츠 다운로드. 합계, 프로토콜(h2/h3/HTTP1.1), 전송 크기와 압축률도 표시.

【캐시 상태】브라우저 로컬 캐시 히트(Navigation Timing)와 CDN 엣지 캐시 히트(X-Cache / CF-Cache-Status / Age)를 한눈에.

【Ping / RTT】HTTP 왕복 근사 지연 측정(워밍업 후 3회 중앙값. 확장 프로그램은 ICMP를 보낼 수 없어 근사값이며 UI에 명시).

【상시 백그라운드】팝업을 열지 않아도: 툴바 아이콘 배지, 페이지 우측 하단 플로팅 배지(사업자 · 지역 · 지연), 탐색마다 자동 감지·측정, 사이트별 최근 50개 기록.

【SPA 대응】단일 페이지 앱(React/Vue 등)의 클라이언트 라우팅을 추적해 기록을 자동 갱신하고 필요 시 지연을 재측정.

【다국어】간체/번체 중국어, 영어, 일본어, 한국어, 러시아어, 프랑스어, 독일어, 스페인어 9개 UI 언어.

【개인정보】개인 데이터를 수집하지 않으며 결과는 브라우저에만 저장됩니다. IP 위치 조회(제3자 ip-api.com), Ping 측정, 페이지 배지는 각각 클릭 한 번으로 끌 수 있습니다.

---

## Русский (ru)

**Название**:Детектор CDN — провайдер, регион узла, тайминги

**Краткое описание**:Показывает, обслуживается ли сайт через CDN, провайдера и регион узла (POP), а также тайминги DNS/TCP/TLS/TTFB и Ping.

**Подробное описание**:
Детектор CDN — увидьте CDN за любым сайтом в один клик.

• Определение CDN: показывает, отдаётся ли текущий сайт через CDN; автоматически распознаёт 18+ провайдеров — Cloudflare, Amazon CloudFront, Fastly, Akamai, Vercel, Netlify, Azure Front Door, Google Cloud, Alibaba Cloud, Tencent CDN/EdgeOne, Qiniu, Huawei Cloud, Kingsoft, Gcore, CDN77, BFE и др. — и показывает заголовки-доказательства.
• Граничный узел и геолокация: коды POP расшифровываются в регионы (например, CF-RAY …-HKG → Гонконг) и подтверждаются по городу/провайдеру/ASN серверного IP.
• Времена соединения: водопад реального соединения — DNS, TCP, TLS, TTFB, загрузка; плюс итого, протокол (h2/h3/HTTP1.1), размер и сжатие.
• Состояние кэша: попадание в локальный кэш браузера (Navigation Timing) и в кэш CDN (X-Cache / CF-Cache-Status / Age).
• Ping / RTT: приближённая задержка по HTTP-циклам (медиана из 3 после прогрева; ICMP недоступен расширениям, что честно указано в интерфейсе).
• Работает в фоне без открытия окна: значок провайдера на иконке, плавающий чип в правом нижнем углу (провайдер · регион · задержка), автоопределение и автозамеры при каждой навигации, история по 50 последним сайтам.
• Поддержка SPA: отслеживает клиентскую маршрутизацию одностраничных приложений (React/Vue и др.).
• 9 языков интерфейса: упрощённый/традиционный китайский, английский, японский, корейский, русский, французский, немецкий, испанский.
• Конфиденциальность: персональные данные не собираются; результаты только локально; геолокация IP (сторонний ip-api.com), замер Ping и чип отключаются одним кликом.

---

## Français (fr)

**Nom**:Détecteur CDN — fournisseur, région POP, chronométrage

**Brève description**:Indique si un site est derrière un CDN, le fournisseur, la région du nœud edge, plus les temps DNS/TCP/TLS/TTFB et le ping.

**Description détaillée**:
Détecteur CDN — voyez le CDN derrière n'importe quel site en un clic.

• Détection CDN : indique si le site actuel est servi par un CDN ; identifie automatiquement 18+ fournisseurs (Cloudflare, Amazon CloudFront, Fastly, Akamai, Vercel, Netlify, Azure Front Door, Google Cloud, Alibaba Cloud, Tencent CDN/EdgeOne, Qiniu, Huawei Cloud, Kingsoft, Gcore, CDN77, BFE…) et montre les en-têtes utilisés comme preuve.
• Nœud edge et géolocalisation : les codes POP sont décodés en régions (ex. CF-RAY …-HKG → Hong Kong) et recoupés avec la ville/FAI/ASN de l'IP du serveur.
• Chronométrage de connexion : cascade de la connexion réelle — DNS, TCP, TLS, TTFB, téléchargement ; total, protocole (h2/h3/HTTP1.1), taille transférée et compression.
• État du cache : cache local du navigateur (Navigation Timing) et cache edge CDN (X-Cache / CF-Cache-Status / Age) en un coup d'œil.
• Ping / RTT : latence approximée par aller-retours HTTP (médiane de 3 après échauffement ; l'ICMP est indisponible pour une extension, et l'interface le précise honnêtement).
• Toujours actif sans ouvrir la popup : badge du fournisseur sur l'icône, pastille flottante en bas à droite (fournisseur · région · latence), détection et mesures automatiques à chaque navigation, historique des 50 derniers sites.
• Compatible SPA : suit le routage client des applications monopages (React/Vue, etc.).
• 9 langues d'interface : chinois simplifié/traditionnel, anglais, japonais, coréen, russe, français, allemand, espagnol.
• Confidentialité : aucune donnée personnelle collectée ; résultats uniquement locaux ; géolocalisation IP (ip-api.com), mesure du ping et pastille se désactivent d'un clic.

---

## Deutsch (de)

**Name**:CDN-Detektor — Anbieter, Knoten-Region, Zeiten

**Kurzbeschreibung**:Zeigt, ob eine Seite über ein CDN läuft, Anbieter und Edge-Knoten-Region, dazu DNS/TCP/TLS/TTFB-Zeiten und Ping.

**Ausführliche Beschreibung**:
CDN-Detektor — sehen Sie mit einem Klick das CDN hinter jeder Website.

• CDN-Erkennung: zeigt, ob die aktuelle Seite über ein CDN ausgeliefert wird; erkennt automatisch 18+ Anbieter (Cloudflare, Amazon CloudFront, Fastly, Akamai, Vercel, Netlify, Azure Front Door, Google Cloud, Alibaba Cloud, Tencent CDN/EdgeOne, Qiniu, Huawei Cloud, Kingsoft, Gcore, CDN77, BFE u. a.) und zeigt die beweisenden Header.
• Edge-Knoten & Geolokation: POP-Codes werden in Regionen aufgelöst (z. B. CF-RAY …-HKG → Hongkong) und mit Stadt/ISP/ASN der Server-IP abgeglichen.
• Verbindungszeiten: Wasserfall der echten Verbindung — DNS, TCP-Handshake, TLS-Handshake, TTFB, Download; zusätzlich gesamt, Protokoll (h2/h3/HTTP1.1), Übertragungsgröße und Komprimierung.
• Cache-Status: Treffer im lokalen Browser-Cache (Navigation Timing) und im CDN-Edge-Cache (X-Cache / CF-Cache-Status / Age) auf einen Blick.
• Ping / RTT: näherungsweise Latenz über HTTP-Round-Trips (Median aus 3 nach Aufwärmen; ICMP ist für Erweiterungen nicht verfügbar — das sagt die Oberfläche ehrlich).
• Immer aktiv ohne die Popup zu öffnen: Anbieter-Badge am Symbol, schwebender Chip unten rechts (Anbieter · Region · Latenz), automatische Erkennung und Messung bei jeder Navigation, Verlauf der letzten 50 Seiten.
• SPA-tauglich: verfolgt das clientseitige Routing von Single-Page-Apps (React/Vue etc.).
• 9 Oberflächensprachen: vereinfachtes/traditionelles Chinesisch, Englisch, Japanisch, Koreanisch, Russisch, Französisch, Deutsch, Spanisch.
• Datenschutz: keine personenbezogenen Daten; Ergebnisse bleiben im Browser; IP-Geolokation (ip-api.com), Ping-Messung und Seiten-Chip lassen sich jeweils mit einem Klick deaktivieren.

---

## Español (es)

**Nombre**:Detector de CDN — proveedor, región POP, tiempos

**Descripción breve**:Muestra si un sitio usa CDN, el proveedor, la región del nodo edge asignado, además de los tiempos DNS/TCP/TLS/TTFB y el ping.

**Descripción detallada**:
Detector de CDN — vea el CDN detrás de cualquier sitio web con un clic.

• Detección de CDN: muestra si el sitio actual se sirve mediante un CDN; identifica automáticamente 18+ proveedores (Cloudflare, Amazon CloudFront, Fastly, Akamai, Vercel, Netlify, Azure Front Door, Google Cloud, Alibaba Cloud, Tencent CDN/EdgeOne, Qiniu, Huawei Cloud, Kingsoft, Gcore, CDN77, BFE, entre otros) y muestra las cabeceras que sirvieron de prueba.
• Nodo edge y geolocalización: los códigos POP se decodifican en regiones (p. ej. CF-RAY …-HKG → Hong Kong) y se contrastan con ciudad/ISP/ASN de la IP del servidor.
• Tiempos de conexión: cascada de la conexión real — DNS, saludo TCP, saludo TLS, TTFB y descarga; además total, protocolo (h2/h3/HTTP1.1), tamaño transferido y compresión.
• Estado de la caché: aciertos de la caché local del navegador (Navigation Timing) y de la caché edge del CDN (X-Cache / CF-Cache-Status / Age) de un vistazo.
• Ping / RTT: latencia aproximada por rondas HTTP (mediana de 3 tras el calentamiento; el ICMP no está disponible para extensiones, y la interfaz lo indica con honestidad).
• Siempre activo sin abrir el emergente: insignia del proveedor en el icono, chip flotante abajo a la derecha (proveedor · región · latencia), detección y medición automáticas en cada navegación, historial de los últimos 50 sitios.
• Compatible con SPA: sigue el enrutado del lado cliente de las aplicaciones de una sola página (React/Vue, etc.).
• 9 idiomas de interfaz: chino simplificado/tradicional, inglés, japonés, coreano, ruso, francés, alemán y español.
• Privacidad: no se recopilan datos personales; los resultados se quedan en el navegador; la geolocalización por IP (ip-api.com), la medición de ping y el chip de página se desactivan con un clic.
