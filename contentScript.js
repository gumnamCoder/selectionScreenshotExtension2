chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'startSelection') {
    startSelection();
  }
});

function startSelection() {
  var selectionOverlay = document.createElement('div');
  selectionOverlay.style.position = 'fixed';
  selectionOverlay.style.top = '0';
  selectionOverlay.style.left = '0';
  selectionOverlay.style.width = '100%';
  selectionOverlay.style.height = '100%';
  selectionOverlay.style.background = 'rgba(0, 0, 0, 0.5)';
  selectionOverlay.style.zIndex = '9999';
  document.body.appendChild(selectionOverlay);

  var startPoint;
  var selectionRect;

  function handleMouseDown(event) {
    startPoint = { x: event.clientX, y: event.clientY };
    selectionRect = document.createElement('div');
    selectionRect.style.position = 'absolute';
    selectionRect.style.border = '2px dashed #fff';
    selectionRect.style.background = 'rgba(0, 0, 0, 0.2)';
    selectionRect.style.pointerEvents = 'none';
    document.body.appendChild(selectionRect);

    window.removeEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  function handleMouseMove(event) {
    var width = event.clientX - startPoint.x;
    var height = event.clientY - startPoint.y;
    var x = width >= 0 ? startPoint.x : startPoint.x + width;
    var y = height >= 0 ? startPoint.y : startPoint.y + height;
    width = Math.abs(width);
    height = Math.abs(height);

    selectionRect.style.left = x + 'px';
    selectionRect.style.top = y + 'px';
    selectionRect.style.width = width + 'px';
    selectionRect.style.height = height + 'px';
  }

  function handleMouseUp(event) {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);

    var screenshotRect = {
      x: parseInt(selectionRect.style.left),
      y: parseInt(selectionRect.style.top),
      width: parseInt(selectionRect.style.width),
      height: parseInt(selectionRect.style.height)
    };

    chrome.runtime.sendMessage({ message: 'capture' }, (response) => {
      if (response.message === 'image') {
        var image = response.image;
        captureElement(image, screenshotRect);
      }
    });

    selectionOverlay.remove();
    selectionRect.remove();
  }

  window.addEventListener('mousedown', handleMouseDown);
}

function captureElement(image, screenshotRect) {
  var dpr = window.devicePixelRatio || 1;
  var preserve = true;
  var format = 'png';

  var top = screenshotRect.y * dpr;
  var left = screenshotRect.x * dpr;
  var width = screenshotRect.width * dpr;
  var height = screenshotRect.height * dpr;
  var w = (dpr !== 1 && preserve) ? width : screenshotRect.width;
  var h = (dpr !== 1 && preserve) ? height : screenshotRect.height;

  var canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;



  var img = new Image();
  img.onload = function () {
    // Introduce a small delay before capturing the screenshot
    setTimeout(function() {
      var context = canvas.getContext('2d');
      context.drawImage(
        img,
        left, top,
        width, height,
        0, 0,
        w, h
      );

      var dataUrl = canvas.toDataURL('image/' + format);
      downloadScreenshot(dataUrl);
      chrome.runtime.sendMessage({ action: 'openPopup', dataUrl: dataUrl });
    }, 100); // Adjust the delay (in milliseconds) as needed
  };

  img.src = image;
}

function downloadScreenshot(dataUrl) {
  // console.log("I am inside the download function")
  var link = document.createElement('a');
  link.href = dataUrl;
  link.download = 'walmartScreenshot.png';
  link.click();
}



