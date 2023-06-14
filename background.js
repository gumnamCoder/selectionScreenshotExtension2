chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.message === 'capture') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (image) => {
      res({ message: 'image', image });
    });
    return true; 
  }
});


