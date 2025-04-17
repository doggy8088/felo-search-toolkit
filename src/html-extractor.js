/**
 * 提取網頁主要內容元素
 *
 * @param {Document} doc - 文件物件
 * @returns {HTMLElement|null} - 回傳 main、唯一 article 或特殊 div.main-content，若皆無則回傳 null
 */
function extractMainContent(doc) {
    let main = doc.querySelector('main');

    // 如果沒有 main，就找唯一的 article
    if (!main && doc.querySelectorAll('article').length === 1) {
        main = doc.querySelector('article');
    }

    // 如果還是沒找到，而是在 VS Code Marketplace，就找 div.main-content
    if (!main && doc.location.hostname === 'marketplace.visualstudio.com') {
        main = doc.querySelector('div.main-content');
    }

    return main;
}