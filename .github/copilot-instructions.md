# Copilot 使用指南

本專案為 Felo Search 萬能工具箱 Chrome Extension，提供以下檔案結構：

- `src/background.js`：背景執行緒，管理 context menu 與通知呼叫
- `src/content.js`：內容腳本，注入網頁以實作鍵盤快速鍵與畫面操作
- `src/playwright.js`：自製 函式庫，提供 Locator API，包含 `getByRole`、`getByText`、`getByLabel`、`getByPlaceholder` 等方法
- `manifest.json`：Chrome Extension 設定（Manifest V3）
- `_locales/`：多語系 資源檔案
- `CHANGELOG.md`：版本紀錄

## 編碼規範

- 使用 Manifest V3 API（`chrome.action`、`chrome.runtime`、`chrome.contextMenus`、`chrome.storage`）
- 在鍵盤事件中，首行需呼叫 `isInInputMode()` 與 `isCtrlOrMetaKeyPressed()` 判斷，避免在輸入框中觸發
- 元素選取統一透過 `window.page` 函式庫，避免直接使用 `document.querySelector`：
  - `getByRole(role, options)`
  - `getByText(text, options)`
  - `getByLabel(text, options)`
  - `getByPlaceholder(text, options)`
- 所有使用者顯示文字需透過 `chrome.i18n.getMessage()` 實現多語系
- 非同步 程式碼使用 `async/await` 撰寫，並遵循 Promise 錯誤處理
- 新增功能時，請撰寫中英雙語註解，並參考現有程式碼片段範例

## 版本管理與 commit 規範

- PR 標題格式：`feat:<範圍> 新增xxx` / `fix:<範圍> 修正xxx`
- 主要類型：`feat`、`fix`、`refactor`、`chore`、`docs`
- 每次 release 後，同步更新 `CHANGELOG.md`，並在 `PUBLISH.md` 中更新打包流程
