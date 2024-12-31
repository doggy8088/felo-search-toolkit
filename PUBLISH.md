# Pubilsh Notes

Simply zip whole folder as a zip file and upload to [Chrome Web Store](https://chrome.google.com/webstore/devconsole/1493e0a9-a65c-4e31-aefb-d9f27e0d8026/nkeadnckjdandlphpaniomonofdhlanb/edit/package).

```sh
$filePath = "FeloSearchToolkitExtension_v0.8.0.zip"
7z a $filePath _locales images src CHANGELOG.md manifest.json README.*
(Get-ChildItem -Path . -Filter $filePath -Recurse | Select-Object -ExpandProperty FullName) | Set-Clipboard
```
