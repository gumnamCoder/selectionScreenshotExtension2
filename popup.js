document.addEventListener('DOMContentLoaded', function() {
    var selectButton = document.getElementById('selectButton');
    selectButton.addEventListener('click', ()=> {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { action: 'startSelection' });
      });
    });
  });
  