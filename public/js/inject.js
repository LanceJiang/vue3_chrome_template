// 发送普通消息到content-script
function sendMessageToContentScript_byPostMessage(data) {
  window.postMessage({cmd: 'message', data}, '*');
}

// 通过DOM事件发送消息给content-script
(function () {
  var customEvent = document.createEvent('Event');
  customEvent.initEvent('myCustomEvent', true, true);

  // 通过事件发送消息给content-script
  function sendMessageToContentScript_byEvent(data) {
    data = data || '你好，我是injected-script!';
    var hiddenDiv = document.getElementById('myCustomEventDiv');
    hiddenDiv.innerText = data
    hiddenDiv.dispatchEvent(customEvent);
  }

  window.sendMessageToContentScript_byEvent = sendMessageToContentScript_byEvent;
})();
