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

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getConversation") {
        const conversation = extractConversation();
        sendResponse(conversation);
    }
});

console.log("ChatGPT Extractor content script loaded");