document.addEventListener('DOMContentLoaded', function() {
    var selectButton = document.getElementById('selectButton');
    selectButton.addEventListener('click', ()=> {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { action: 'startSelection' });
      });
    });
  });
  
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log('Message received:', message);
    if (message.action === 'openPopup') {
      launchPopup(message.dataUrl);
    }
  });