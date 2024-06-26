document.addEventListener('DOMContentLoaded', function () {
    const extractButton = document.getElementById('extractButton');
    const searchInput = document.getElementById('searchInput');
    const results = document.getElementById('results');
    const savedConversationsLink = document.getElementById('savedConversationsLink');

    extractButton.addEventListener('click', extractConversation);
    searchInput.addEventListener('input', performSearch);
    savedConversationsLink.addEventListener('click', openSavedConversations);

    function extractConversation() {
        chrome.runtime.sendMessage({ action: "extractConversation" }, function (response) {
            if (chrome.runtime.lastError) {
                console.error('Error:', chrome.runtime.lastError.message);
                showErrorMessage('Error extracting conversation. Please make sure you are on a ChatGPT page.');
            } else if (response) {
                if (response.error) {
                    console.error('Extraction error:', response.error);
                    showErrorMessage(response.error);
                } else {
                    console.log('Extracted conversation:', response);
                    saveConversation(response);
                }
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
                console.log('Conversation saved:', conversation);
                showSuccessMessage('Conversation extracted and saved successfully!');
            });
        });
    }

    function showSuccessMessage(message) {
        showMessage(message, 'green');
    }

    function showErrorMessage(message) {
        showMessage(message, 'red');
    }

    function showMessage(message, color) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.color = color;
        messageDiv.style.marginTop = '10px';
        document.querySelector('.container').appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
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