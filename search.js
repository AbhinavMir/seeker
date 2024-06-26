document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('results');

    function search() {
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
        resultsContainer.innerHTML = '';
        conversations.forEach(conv => {
            const li = document.createElement('li');
            li.innerHTML = `
        <div><strong>URL:</strong> <span class="url">${conv.url}</span></div>
        <div><strong>Timestamp:</strong> <span class="timestamp">${new Date(conv.timestamp).toLocaleString()}</span></div>
        <div><strong>Matching Messages:</strong></div>
        <ul>
          ${conv.messages.filter(msg => msg.content.toLowerCase().includes(query)).map(msg => `
            <li>${msg.role}: ${highlightText(msg.content, query)}</li>
          `).join('')}
        </ul>
      `;
            resultsContainer.appendChild(li);
        });
    }

    function highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    searchInput.addEventListener('input', search);
});