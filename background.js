chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: "https://felo.ai/" });
});
