chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: "https://felo.ai/?invite=dOLn1YloyaD3j" });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summaryUrl",
    title: chrome.i18n.getMessage("summary_this_page"),
    contexts: ["page"]
  });

  chrome.notifications.onClicked.addListener(function (notificationId) {
    chrome.tabs.create({ url: "https://felo.ai/?invite=dOLn1YloyaD3j" });
  });

  // 初始化 summaryPrompt 的預設值
  chrome.storage.sync.set({ summaryPrompt: chrome.i18n.getMessage("default_summary_prompt") });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  var url = new URL(tab.url);
  var domain = url.hostname;

  const excludedDomains = [
    "felo.ai",
    "localhost",
    "local",

    "studio.youtube.com",
  ];

  // 排除一些無法總結的域名和私有IP地址
  const isExcludedDomain = () => excludedDomains.some(excludedDomain =>
    domain === excludedDomain || domain.endsWith(`.${excludedDomain}`)
  );

  if (isExcludedDomain()) {
    showNotification(chrome.i18n.getMessage("domain_excluded_notification", [domain]));
    return;
  }

  // 判斷是否為私有IP地址
  const isPrivateIP = (ip) => /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/.test(ip);

  if (isPrivateIP(domain)) {
    showNotification(chrome.i18n.getMessage("ip_excluded_notification", [domain]));
    return;
  }

  if (info.menuItemId === "summaryUrl") {
    chrome.storage.sync.get("summaryPrompt", ({ summaryPrompt }) => {
      let prompt;
      if (domain === "www.youtube.com" || domain === "youtube.com") {
        const cleanedTitle = cleanYouTubeTitle(tab.title);
        prompt = `${cleanedTitle}\n${tab.url}\n${summaryPrompt}`;
      } else {
        prompt = `${tab.title}\n${tab.url}\n${summaryPrompt}`;
      }
      chrome.tabs.create({ url: `https://felo.ai/?invite=dOLn1YloyaD3j&mode=verbose&q=${encodeURIComponent(prompt)}` });
    });
  }

});

// 這會通知到 Windows 的「通知中心」，如果使用者關閉的話，就看不到了！
// https://developer.chrome.com/docs/extensions/how-to/ui/notifications?hl=zh-tw
// https://developer.chrome.com/docs/extensions/reference/api/notifications
function showNotification(message, url) {
  chrome.notifications.create(url, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('/images/icon128.png'),
    title: chrome.i18n.getMessage("tool_name"),
    message: message
  });
}

function cleanYouTubeTitle(title) {
  // 只去除標題開頭的未讀數字，使用 ^ 確保只匹配開頭
  return title.replace(/^\(\d+\)\s*/, '').trim();
}