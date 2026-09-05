# 專案現況筆記（2026-09-06 建立版控基準時記錄）

## 這份快照的定位

這是目前手上唯一完整的專案結構快照，日期為 **2026-07-17**。
線上 `b2b.seadream.com.tw` 由委外同事另行維護與部署，最新的實際原始碼還沒有從委外同事那邊完整拿回來。這份快照先納入版控，作為之後 diff／回溯的基準點。

**2026-09-06 已完成實測比對，結果見下方「版本比對結果」。**

（歷史記錄，僅供追溯：這裡曾經寫過「線上是 index v21.9 / order.html v16.4，依委外同事告知」，那個來源是錯的——並沒有委外同事告知這件事，v16.4 其實是從線上網頁未維護的 `<meta name="description">` 讀來的，不可靠。這個錯誤已在下方用實測結果取代。）

## 版本比對結果（2026-09-06）

**比對方法**：用瀏覽器將 `b2b.seadream.com.tw` 目前實際部署的頁面另存到本機（`C:\b2b-live-snapshot\`），讀取頁面原始碼內的 `VERSION` 常數字串（不是 `<meta name="description">`，那個不可靠），逐一與這份 repo 裡 `public/` 對應檔案的 `VERSION` 常數比對。

| 功能 | 線上實際 VERSION | 本機對應檔案 | 本機 VERSION | 結論 |
|---|---|---|---|---|
| 會員入口 | `index_b2b_v21_9_quicknav_date_nowrap` | `public/index_2.html` | `index_b2b_v21_9_quicknav_date_nowrap` | ✅ **相符**（本機 `public/index.html` 是另一個頁面，不是這個，見下方說明） |
| 設備批發 order.html | `v19.10.25-mode-a-auto-sync-official-shop` | `public/order.html` | `v19.10.25-mode-a-auto-sync-official-shop` | ✅ 相符 |
| 快捷導覽 b2b_admin_nav.js | `seadream_b2b_quick_nav_v1_2_0`（18,617 bytes） | `public/b2b_admin_nav.js` | `seadream_b2b_quick_nav_v1_2_0`（本機檔案大小同為 18,617 bytes） | ✅ 相符（版本字串與檔案大小都吻合） |
| 活體訂單 livestock_order.html | `livestock_order_v1_0_11_legacy_submit_permission_fix` | `public/livestock_order.html` | `livestock_order_v1_0_11_legacy_submit_permission_fix` | ✅ 相符 |
| 商城管理中心 admin-center.html | `admin_center_v3_0_step1` | `public/admin-center.html` | `admin_center_v3_0_step1` | ✅ 相符 |
| 多魚缸元素比較 element_calculator.html | `element_calculator_v1_2_20_restore_rows_custom_default` | `public/element_calculator.html` | `element_calculator_v1_2_20_restore_rows_custom_default` | ✅ 相符 |
| 客服聊天室 chat_admin.html | `chat_admin_v1_1_notify_quick_reply` | `public/chat_admin.html` | `chat_admin_v1_1_notify_quick_reply` | ✅ 相符 |

**總結：這份 2026-07-17 快照除了「`index.html` 這個檔名」本身對不上之外，其餘全部 6 個功能（order.html、b2b_admin_nav.js、livestock_order.html、admin-center.html、element_calculator.html、chat_admin.html）的內部版號都跟線上目前實際部署的版本完全一致。** 也就是說這份 repo 目前的內容其實相當貼近線上現況，主要落差只集中在 `index.html` 的檔名／內容錯位這一點上（見下方說明），不是整包程式碼都過時。

## ⚠️ 檔名與線上部署不一致（重要，避免未來誤部署）

調查這份快照時發現，本機 `public/` 目錄下的檔名，跟「線上實際服務的內容」對不起來：

| 本機檔名 | 內部 VERSION 字串 | 實際內容 |
|---|---|---|
| `public/index.html` | `seadream_home_v1_4_admin_brand_category_service_b2b_gate` | **海洋夢商城前台首頁**（一般消費者商城首頁，不是 B2B 入口） |
| `public/index_1.html` | `index_b2b_v21_8_application_notice_direct_approve_flow` | B2B 會員入口，v21.8（v21.9 的前一版） |
| `public/index_2.html` | `index_b2b_v21_9_quicknav_date_nowrap` | **B2B 會員入口，本機內部版號 v21.9** |

也就是說：**本機目前檔名叫 `index.html` 的檔案，內容是舊的商城首頁（v1.4），不是 B2B 會員入口。** 本機存有的最新 B2B 入口版本（v21.9）檔名是 `index_2.html`。

**已於 2026-09-06 實測確認：線上 `b2b.seadream.com.tw` 實際部署的 `index.html`，內部 VERSION 常數就是 `index_b2b_v21_9_quicknav_date_nowrap`，跟本機 `public/index_2.html` 完全一致。「委外同事部署時把 `index_2.html` 另存/改名成 `index.html` 上傳」這個推測成立。** 本機檔名叫 `index.html` 的檔案（商城首頁 v1.4）跟線上實際的 `index.html`（B2B 入口 v21.9）不是同一份內容，這個落差是真實存在的，不是推測。

### `order.html` 版本號

**已於 2026-09-06 實測確認一致**：本機 `public/order.html` 內部 `VERSION` 常數為 `v19.10.25-mode-a-auto-sync-official-shop`，與線上 `b2b.seadream.com.tw` 實際部署的 `order.html` 完全相同。先前寫的「線上是 v16.4」是錯誤資訊（來源是未維護的 `<meta name="description">` 文字，且並未向委外同事確認過），已由實測結果取代。

## 進版控前的建議動作

1. ~~向委外同事確認線上 index.html / order.html 版本~~ — 已於 2026-09-06 用瀏覽器另存線上頁面直接實測確認，見上方「版本比對結果」，不需要再問。
2. **`index.html` 的檔名/內容落差需要處理**，兩個方向擇一：
   - 把本機 `index_2.html` 的內容同步/覆蓋到 `index.html`，讓 repo 裡的 `index.html` 就是實際部署的 B2B 入口內容；或
   - 直接讓 `index_2.html` 成為唯一的 B2B 入口來源檔名，`index.html` 保留做商城首頁用途，並在部署流程/說明裡明確標注兩者用途，避免未來部署時搞混、誤把舊商城首頁蓋掉線上的 B2B 入口。
3. 其餘 6 個檔案（`order.html`、`b2b_admin_nav.js`、`livestock_order.html`、`admin-center.html`、`element_calculator.html`、`chat_admin.html`）版本已確認與線上一致，**這份 2026-07-17 快照在這幾個檔案上可以放心當作目前的真實基準**，不需要再找委外同事要新版本。

## `public/backup/` 說明

`public/backup/` 底下有 133 個歷史快照檔案（`order_*.html`、`index2*.html`、`element_calculator_*.html` 等），是這個專案唯一的歷史演進紀錄，總計約 12MB，已隨此次進版控一併保留，不建議刪除。
