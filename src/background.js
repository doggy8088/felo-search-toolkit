chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: "https://felo.ai/?invite=dOLn1YloyaD3j" });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summaryUrl",
    title: chrome.i18n.getMessage("summary_this_page"),
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "summaryUrl") {
    const prompt = `summary this ${tab.url}`;
    chrome.tabs.create({ url: `https://felo.ai/?invite=dOLn1YloyaD3j&mode=verbose&q=${encodeURIComponent(prompt)}` });
  }
});
