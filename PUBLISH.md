# Pubilsh Notes

Simply zip whole folder as a zip file and upload to [Chrome Web Store](https://chrome.google.com/webstore/devconsole/1493e0a9-a65c-4e31-aefb-d9f27e0d8026/nkeadnckjdandlphpaniomonofdhlanb/edit/package).

## Package

```sh
$filePath = "FeloSearchToolkitExtension_v0.14.0.zip"
7z a $filePath _locales images src CHANGELOG.md manifest.json README.*
(Get-ChildItem -Path . -Filter $filePath -Recurse | Select-Object -ExpandProperty FullName) | Set-Clipboard
```

## GitHub Actions

* [Use the Chrome Web Store Publish API](https://developer.chrome.com/docs/webstore/using-api)

### 申請 Chrome Web Store API 存取權限步驟說明

1. 建立 Google Cloud Project

   * 前往 [Google Cloud Console](https://console.cloud.google.com/)
   * 建立新專案
   * 啟用 Chrome Web Store API

2. 設定 OAuth 同意畫面

   ```markdown
   1. 側邊選單選擇「OAuth 同意畫面」
   2. 選擇「外部」使用者類型
   3. 填寫必要資訊：
      - 應用程式名稱
      - 使用者支援電子郵件
      - 開發人員聯絡資訊
   ```

3. 取得 `CLIENT_ID` 和 `CLIENT_SECRET`

   ```markdown
   1. 側邊選單選擇「憑證」
   2. 點選「建立憑證」→「OAuth 用戶端 ID」
   3. 應用程式類型選擇「桌面應用程式」
   4. 記下 `CLIENT_ID` 和 `CLIENT_SECRET`
   ```

4. 取得 `REFRESH_TOKEN`

   請透過 [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) 取得 Refresh Token (刷新金鑰)

5. 設定 GitHub Secrets

   ```markdown
   1. 前往專案的 Settings → Secrets → Actions
   2. 新增以下 Secret：
      - GH_TOKEN (GitHub Personal Access Token)
      - EXTENSION_ID (從 Chrome Web Store 開發者面板取得)
      - CLIENT_ID
      - CLIENT_SECRET
      - REFRESH_TOKEN
   ```

注意事項：

* OAuth 同意畫面需要等待 Google 審核
* `REFRESH_TOKEN` 具有長期有效性，請妥善保管
* 建議在本機測試 API 呼叫是否正常運作