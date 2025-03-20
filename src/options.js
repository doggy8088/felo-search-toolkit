document.addEventListener("DOMContentLoaded", () => {
    const summaryPromptTextarea = document.getElementById("summaryPrompt");
    const saveButton = document.getElementById("saveButton");

    // 從 storage 讀取現有的 summaryPrompt
    chrome.storage.sync.get("summaryPrompt", ({ summaryPrompt }) => {
        summaryPromptTextarea.value = summaryPrompt || '';
    });

    // 儲存使用者輸入的 summaryPrompt
    saveButton.addEventListener("click", () => {
        const summaryPrompt = summaryPromptTextarea.value.trim();
        chrome.storage.sync.set({ summaryPrompt }, () => {
            alert("摘要提示詞已儲存！");
        });
    });
});
