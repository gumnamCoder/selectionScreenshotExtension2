
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'startSelection') {
    startSelection()
  }
});

function startSelection() {

  console.log("I am entering inside the startSelection function")

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
    console.log("my reactangle's coordinates are:", screenshotRect);
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

function captureElement(image,screenshotRect) {
  console.log("hey! I am inside the captureElement function", screenshotRect);
  console.log("the image:",image)
  window.scrollTo(screenshotRect.x, screenshotRect.y);
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.margin = '0';

  var canvas = document.createElement('canvas');
  canvas.width = screenshotRect.width;
  canvas.height = screenshotRect.height;

  console.log("printing the canvas:", canvas);
  
  var img = new Image()
  
  img.onload = ()=>{
    var context = canvas.getContext('2d');
    context.drawImage(
      img,
      screenshotRect.x,
      screenshotRect.y,
      screenshotRect.width,
      screenshotRect.height,
      0,
      0,
      screenshotRect.width,
      screenshotRect.height
    );
    console.log("error iske baad aa raha");
    var dataUrl = canvas.toDataURL('image/png');
    console.log("dataURL",dataUrl)
  }
  img.src = image;
  console.log("canvas after drawImage:", canvas)
  console.log("dataURL is:", dataUrl) 

}


