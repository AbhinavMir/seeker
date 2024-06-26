chrome.action.onClicked.addListener((tab) => {
    if (tab.url.startsWith("https://chat.openai.com/") || tab.url.startsWith("https://chatgpt.com/")) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
    }
});