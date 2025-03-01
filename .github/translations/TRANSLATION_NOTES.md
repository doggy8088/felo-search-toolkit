# 翻譯筆記

## 人工整理

1. 完整的翻譯清單整理在 `LANGUAGE_CODE.txt` 檔案

    參考自: [Felo - 您的免費 AI 搜尋助手](https://chromewebstore.google.com/detail/fbnbeocmafoobaeodhmcgnammdeaoglg)

    共 49 種語言。

2. 移除已經翻譯的語言，並放在 `LANGUAGE_CODE_MISSING.txt`

    手動移除已經刪除的 5 種語言。

## 透過 GitHub Copilot 代理人翻譯

提示範本:

```txt
You have a series of multilingual translation tasks to complete. All the needed language listed in the #file:LANGUAGE_CODE_MISSING.txt file. Please translate one language at a time.

Here is the guideline for each language translation:

Please refer to #file:README.md  and #file:_locales/en/messages.json as my original content, generate corresponding {LANGUAGE_CODE} translations for it.
```
