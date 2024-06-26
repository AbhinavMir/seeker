document.addEventListener('DOMContentLoaded', function () {
    const extractButton = document.getElementById('extractButton');
    const searchInput = document.getElementById('searchInput');
    const results = document.getElementById('results');
    const savedConversationsLink = document.getElementById('savedConversationsLink');

    extractButton.addEventListener('click', extractConversation);
    searchInput.addEventListener('input', performSearch);
    savedConversationsLink.addEventListener('click', openSavedConversations);

    function extractConversation() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tab = tabs[0];
            if (tab.url.startsWith("https://chat.openai.com/") || tab.url.startsWith("https://chatgpt.com/")) {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: () => {
                        // ... (keep the existing extractConversation function)
                    }
                }, (results) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error:', chrome.runtime.lastError.message);
                    } else if (results && results[0] && results[0].result) {
                        saveConversation(results[0].result);
                    }
                });
            } else {
                alert('Please navigate to https://chatgpt.com/ or https://chat.openai.com/ to use this extension');
            }
        });
    }

    function saveConversation(conversation) {
        chrome.storage.local.get({ conversations: [] }, function (result) {
            let conversations = result.conversations;
            conversations.push({
                id: Date.now(),
                url: conversation.url,
                timestamp: new Date().toISOString(),
                messages: conversation.messages
            });
            chrome.storage.local.set({ conversations: conversations }, function () {
                console.log('Conversation saved');
                alert('Conversation extracted and saved successfully!');
            });
        });
    }

    function performSearch() {
        const query = searchInput.value.toLowerCase();
        chrome.storage.local.get({ conversations: [] }, function (result) {
            const conversations = result.conversations;
            const matchedConversations = conversations.filter(conv =>
                conv.messages.some(msg => msg.content.toLowerCase().includes(query))
            );

            displayResults(matchedConversations, query);
        });
    }

    function displayResults(conversations, query) {
        results.innerHTML = '';
        conversations.forEach(conv => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = `
                <div><strong>${new Date(conv.timestamp).toLocaleString()}</strong></div>
                <div>${highlightText(conv.messages[0].content, query)}</div>
            `;
            div.addEventListener('click', () => openConversation(conv.url));
            results.appendChild(div);
        });
    }

    function highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    function openConversation(url) {
        chrome.tabs.create({ url: url });
    }

    function openSavedConversations() {
        chrome.tabs.create({ url: chrome.runtime.getURL('saved_conversations.html') });
    }
});