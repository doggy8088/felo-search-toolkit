document.addEventListener("DOMContentLoaded", () => {
    // 套用 i18n 於所有帶有 data-i18n 屬性的元素
    applyI18n();

    const summaryPromptTextarea = document.getElementById("summaryPrompt");
    const saveButton = document.getElementById("saveButton");
    const resetButton = document.getElementById("resetButton");
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    // 從 i18n 獲取預設的摘要提示詞
    const DEFAULT_SUMMARY_PROMPT = chrome.i18n.getMessage("default_summary_prompt") || "Give a bullet-point summary of the main arguments and evidence in this text.";

    // 從 storage 讀取現有的 summaryPrompt
    chrome.storage.sync.get("summaryPrompt", ({ summaryPrompt }) => {
        summaryPromptTextarea.value = summaryPrompt || DEFAULT_SUMMARY_PROMPT;
    });

    // 儲存使用者輸入的 summaryPrompt
    saveButton.addEventListener("click", () => {
        const summaryPrompt = summaryPromptTextarea.value.trim();
        chrome.storage.sync.set({ summaryPrompt }, () => {
            showToast(chrome.i18n.getMessage("options_save_success"));
        });
    });

    // 重設為預設值
    resetButton.addEventListener("click", () => {
        summaryPromptTextarea.value = DEFAULT_SUMMARY_PROMPT;
        chrome.storage.sync.set({ summaryPrompt: DEFAULT_SUMMARY_PROMPT }, () => {
            showToast(chrome.i18n.getMessage("options_reset_success"));
        });
    });

    // 顯示 Toast 通知
    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.remove("translate-y-24", "opacity-0");
        toast.classList.add("translate-y-0", "opacity-100");

        // 3秒後隱藏 toast
        setTimeout(() => {
            toast.classList.remove("translate-y-0", "opacity-100");
            toast.classList.add("translate-y-24", "opacity-0");
        }, 3000);
    }

    // 應用 i18n 至頁面
    function applyI18n() {
        // 更新頁面標題
        document.title = chrome.i18n.getMessage("options_title");

        // 更新所有帶有 data-i18n 屬性的元素
        document.querySelectorAll("[data-i18n]").forEach(element => {
            const messageKey = element.getAttribute("data-i18n");
            const message = chrome.i18n.getMessage(messageKey);
            if (message) {
                element.textContent = message;
            }
        });
    }
});
