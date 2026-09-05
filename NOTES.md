# 專案現況筆記（2026-09-06 建立版控基準時記錄）

## 這份快照的定位

這是目前手上唯一完整的專案結構快照，日期為 **2026-07-17**，並非線上最新版本。
線上 `b2b.seadream.com.tw` 由委外同事另行維護與部署，最新的實際原始碼還沒有從委外同事那邊拿回來。這份快照先納入版控，作為之後 diff／回溯的基準點。

**線上目前實際版本：未知，尚未向委外同事確認。**

先前這裡曾寫「線上是 index v21.9 / order.html v16.4，依委外同事告知」，這個來源是錯的——並沒有委外同事告知這件事。這兩個數字其實是從線上網頁的 `<meta name="description">` 讀出來的，而 meta description 是未維護的遺留文字（詳見下方說明），**不能當作真實版本依據**。在向委外同事實際確認之前，線上版本號應視為未知。

## ⚠️ 檔名與線上部署不一致（重要，避免未來誤部署）

調查這份快照時發現，本機 `public/` 目錄下的檔名，跟「線上實際服務的內容」對不起來：

| 本機檔名 | 內部 VERSION 字串 | 實際內容 |
|---|---|---|
| `public/index.html` | `seadream_home_v1_4_admin_brand_category_service_b2b_gate` | **海洋夢商城前台首頁**（一般消費者商城首頁，不是 B2B 入口） |
| `public/index_1.html` | `index_b2b_v21_8_application_notice_direct_approve_flow` | B2B 會員入口，v21.8（v21.9 的前一版） |
| `public/index_2.html` | `index_b2b_v21_9_quicknav_date_nowrap` | **B2B 會員入口，本機內部版號 v21.9** |

也就是說：**本機目前檔名叫 `index.html` 的檔案，內容是舊的商城首頁（v1.4），不是 B2B 會員入口。** 本機存有的最新 B2B 入口版本（v21.9）檔名是 `index_2.html`。是否與線上 `b2b.seadream.com.tw` 實際部署的 `index.html` 相符，尚未確認。

推測委外同事部署時的流程是把 `index_2.html` 另存/重新命名成 `index.html` 再上傳到 Firebase Hosting，但這個改名動作沒有同步回這份專案快照，導致本機的 `index.html` 停留在舊的商城首頁版本。這只是推測，尚未跟委外同事求證。

### `order.html` 版本號

- 本機 `public/order.html` 標題與內部 `VERSION` 常數：**v19.10.25**（`v19.10.25-mode-a-auto-sync-official-shop`）——這是本機檔案的實際內部版號。
- 線上網頁 `<meta name="description">` 裡的文字寫著 **v16.4**。這是遺留文字：本機許多歷史備份檔案（涵蓋很長一段時間）的 meta description 都還是這行沒更新過，代表這行文字本來就沒有跟著實際版本同步維護，**不能拿來當真實版本依據**。
- 線上目前實際的 `order.html` 版本號是多少（是本機這份的 v19.10.25、更新的版本、還是别的），**目前未知，需要向委外同事確認**（確認方式建議看網頁原始碼裡的 `VERSION` 常數，而不是 meta description）。

## 進版控前的建議動作

1. **向委外同事實際確認線上 `index.html` 與 `order.html` 目前的版本**，請他直接提供網頁原始碼裡的 `VERSION` 常數字串（不要用 `<meta description>` 的文字，那個沒有跟著更新，不可靠）。
2. 若確認線上 `index.html` 確實對應本機的 `index_2.html`，之後要嘛：
   - 在部署流程中把 `index_2.html` 的內容同步/覆蓋到 `index.html`，或
   - 直接讓 `index_2.html` 成為唯一的 B2B 入口來源，`index.html` 改用途做商城首頁，並在部署腳本/說明中明確標注兩者用途，避免未來誤把舊的商城首頁部署上去覆蓋掉 B2B 入口。
3. 跟委外同事核對 `order.html` 目前線上實際的 `VERSION` 常數字串，確認跟本機的 v19.10.25 是否相符（相符、更新、或不同），避免拿錯基準做後續修改。

## `public/backup/` 說明

`public/backup/` 底下有 133 個歷史快照檔案（`order_*.html`、`index2*.html`、`element_calculator_*.html` 等），是這個專案唯一的歷史演進紀錄，總計約 12MB，已隨此次進版控一併保留，不建議刪除。
