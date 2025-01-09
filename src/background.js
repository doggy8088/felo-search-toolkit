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
    showNotification(`此域名 ${domain} 無法使用 Felo Search 總結`);
    return;
  }

  // 判斷是否為私有IP地址
  const isPrivateIP = (ip) => /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/.test(ip);

  if (isPrivateIP(domain)) {
    showNotification(`此 IP 地址 ${domain} 無法使用 Felo Search 總結`);
    return;
  }

  if (info.menuItemId === "summaryUrl") {
    const prompt = `summary this ${tab.url}`;
    chrome.tabs.create({ url: `https://felo.ai/?invite=dOLn1YloyaD3j&mode=verbose&q=${encodeURIComponent(prompt)}` });
  }

});

// 這會通知到 Windows 的「通知中心」，如果使用者關閉的話，就看不到了！
// https://developer.chrome.com/docs/extensions/how-to/ui/notifications?hl=zh-tw
// https://developer.chrome.com/docs/extensions/reference/api/notifications
function showNotification(message, url) {
  chrome.notifications.create(url, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('/images/icon128.png'),
    title: 'Felo Search 萬能工具箱',
    message: message
  });
}