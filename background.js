chrome.runtime.onInstalled.addListener(() => {
    chrome.action.disable();
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostEquals: 'chat.openai.com' },
                }),
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostEquals: 'chatgpt.com' },
                })
            ],
            actions: [new chrome.declarativeContent.ShowAction()]
        }]);
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractConversation") {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0]) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: extractConversation,
                }, (results) => {
                    if (chrome.runtime.lastError) {
                        sendResponse({ error: chrome.runtime.lastError.message });
                    } else if (results && results[0]) {
                        sendResponse(results[0].result);
                    }
                });
            } else {
                sendResponse({ error: "No active tab found" });
            }
        });
        return true;  // Will respond asynchronously
    }
});

function extractConversation() {
    const url = window.location.href;
    const conversationDiv = document.querySelector('div[class*="react-scroll-to-bottom"]');

    if (!conversationDiv) {
        console.log("Conversation div not found");
        return { url, messages: [], error: "Conversation div not found" };
    }

    const messages = conversationDiv.querySelectorAll('div[class*="text-message"]');
    const conversation = {
        url: url,
        messages: []
    };

    if (messages.length === 0) {
        console.log("No messages found");
        return { ...conversation, error: "No messages found" };
    }

    messages.forEach((message, index) => {
        const roleDiv = message.closest('[data-message-author-role]');
        const role = roleDiv ? roleDiv.getAttribute('data-message-author-role') : (index % 2 === 0 ? 'user' : 'assistant');
        const content = message.textContent.trim();
        conversation.messages.push({ role, content });
    });

    console.log("Extracted conversation:", conversation);
    return conversation;
}