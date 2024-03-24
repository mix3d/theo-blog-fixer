let styleTag = null;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log({ request, sender, sendResponse });
  if (request.action === "applyCSS") {
    applyCSS(request);
  }
});

function applyCSS(request) {
  if (request.enabled) {
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.setAttribute("data-extension", "readability-enhancer");
      document.head.appendChild(styleTag);
    }
    const selectorVal =
      request.selector === "custom" ? request.customSelector : request.selector;

    styleTag.textContent = `${selectorVal} { max-width: ${request.maxWidth}ch !important}`;
    return true;
  } else {
    // Remove existing style tag if any
    const existingStyle =
      styleTag ??
      document.querySelector('style[data-extension="readability-enhancer"]');
    if (existingStyle) existingStyle.remove();
    styleTag = null;
  }
}

// Load the saved values, if previously set, on pageload
const currentDomain = window.location.hostname;
chrome.storage.sync.get([currentDomain], function (data) {
  if (data[currentDomain] !== undefined) {
    applyCSS(data[currentDomain]);
  }
});
