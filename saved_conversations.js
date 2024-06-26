document.addEventListener('DOMContentLoaded', function () {
    const conversationList = document.getElementById('conversationList');

    function displayConversations() {
        chrome.storage.local.get({ conversations: [] }, function (result) {
            conversationList.innerHTML = '';
            result.conversations.forEach(function (conv) {
                let li = document.createElement('li');
                li.textContent = `${new Date(conv.timestamp).toLocaleString()} - ${conv.url}`;
                li.addEventListener('click', function () {
                    chrome.tabs.create({ url: conv.url });
                });
                conversationList.appendChild(li);
            });
        });
    }

    displayConversations();
});