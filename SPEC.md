# Chrome Extension 開發

## 簡介

透過 Chrome Extension 開發，提供使用者一個可以快速開啟 Felo Search 網站的功能，還有加入幾個好用的快速鍵。

## 主要功能

1. 點擊 Extension 圖示，開啟 Felo Search 網站，網址為 https://felo.ai/
2. 將已經寫好的程式注入到 Felo Search 網站中，提供使用者快速鍵功能：
   - `j`: 移動到下一個搜尋結果
   - `k`: 移動到上一個搜尋結果
   - `Ctrl + Delete`: 快速刪除當前聊天記錄
   - `Ctrl + B`: 切換側邊欄

## 注意事項

- 使用 Manifest V3 開發
- 快速鍵在輸入框中不會觸發
- 刪除操作會自動跳轉到下一個記錄

## 程式碼實作

```js
(async function () {
    'use strict';

    document.addEventListener("keydown", async (event) => {

        if (event.key === "j") {
            // 如果是輸入欄位，就不要觸發
            if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
                return;
            }

            // 1. 從網址列取得 pathinfo
            const currentUrl = window.location.pathname;

            // 2. 找到和目前 pathinfo 一樣的超連結
            const matchingLink = document.querySelector(`a[href="${currentUrl}"]`);
            if (matchingLink) {
                // 找到下一個 link
                const nextLink = matchingLink?.closest('li')?.nextElementSibling?.querySelector('a')
                    ?? matchingLink?.closest('li')?.nextElementSibling?.nextElementSibling?.querySelector('a');
                if (nextLink) {
                    nextLink.scrollIntoView();
                    nextLink.click();
                }
            } else {
                const firstLink = document.querySelector(`a[href^="/search/"]`);
                firstLink?.click();
            }
        }

        if (event.key === "k") {
            // 如果是輸入欄位，就不要觸發
            if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
                return;
            }

            // 1. 從網址列取得 pathinfo
            const currentUrl = window.location.pathname;

            // 2. 找到和目前 pathinfo 一樣的超連結
            const matchingLink = document.querySelector(`a[href="${currentUrl}"]`);
            if (matchingLink) {
                // 找到下一個 link
                const previousLink = matchingLink?.closest('li')?.previousElementSibling?.querySelector('a')
                    ?? matchingLink?.closest('li')?.previousElementSibling?.previousElementSibling?.querySelector('a');
                if (previousLink) {
                    previousLink.scrollIntoView();
                    previousLink.click();
                }
            }
        }

        // 按下 Ctrl+Delete 快速刪除 Felo Search 聊天記錄
        if (event.ctrlKey && event.key === "Delete") {
            console.log("Ctrl + Delete detected. Starting delete process...");

            // 1. 從網址列取得 pathinfo
            const currentUrl = window.location.pathname;

            // 2. 找到和目前 pathinfo 一樣的超連結
            const matchingLink = document.querySelector(`a[href="${currentUrl}"]`);
            if (matchingLink) {

                // 找到下一個 link
                const nextLink = matchingLink.closest('li').nextElementSibling.querySelector('a')
                    ?? matchingLink.closest('li').nextElementSibling.nextElementSibling.querySelector('a');

                // 找到超連結的下一個同層的 section 元素
                const nextSection = matchingLink.nextElementSibling;
                // 找到下一層的 button 按鈕
                const button = nextSection.querySelector("button");
                button?.click();

                await delay(200); // 加入一點延遲來模擬真實打字過程

                // 找到一個按鈕其內容為「確認」，用迴圈去跑，找出 textContent 為「確認」的按鈕
                const confirmButton = document.querySelectorAll('button');
                confirmButton.forEach(async (button) => {
                    if (button.textContent.trim() === "確認") {
                        button.click();

                        // 刪除後點擊到下一個連結
                        await delay(200);
                        nextLink?.click();
                    }
                });

            } else {
                console.error("找不到符合條件的超連結");
            }
        }

        // 按下 Ctrl+B 快速切換側邊欄
        if (event.ctrlKey && event.key === "b") {
            console.log("Ctrl + B detected. Clicking close sidebar button...");

            // 找到 section 的 class 為「cursor-pointer」的元素
            const svg = document.querySelector('section.cursor-pointer svg');
            if (svg) {
                svg.parentElement.click();
            } else {
                console.error("找不到切換側邊欄的按鈕");
            }
        }
    });

    // 延遲函式
    async function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

})();
```