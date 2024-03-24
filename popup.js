document.addEventListener("DOMContentLoaded", function () {
  const toggleSwitch = document.getElementById("toggleSwitch");
  const selector = document.getElementById("selector");
  const maxWidth = document.getElementById("maxWidth");
  const customSelector = document.getElementById("customSelector");

  toggleSwitch.addEventListener("change", saveAndApplyCss);
  selector.addEventListener("change", (event) => {
    // toggle the custom view
    customSelector.style.display =
      event.target.value === "custom" ? "block" : "none";
    saveAndApplyCss();
  });
  maxWidth.addEventListener("input", debounce(saveAndApplyCss, 300));
  customSelector.addEventListener("input", debounce(saveAndApplyCss, 300));

  try {
    // Load settings when popup is opened
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      const currentDomain = new URL(currentTab.url).hostname;
      chrome.storage.sync.get([currentDomain], function (data) {
        if (data[currentDomain] !== undefined) {
          toggleSwitch.checked = data[currentDomain].enabled;
          selector.value = data[currentDomain].selector;
          maxWidth.value = data[currentDomain].maxWidth;
          customSelector.value = data[currentDomain].customSelector;
          if (selector.value === "custom")
            customSelector.style.display = "block";
        } else {
          maxWidth.value = 60;
        }
      });
    });
  } catch (e) {
    console.log("load data error", e);
  }

  function saveAndApplyCss() {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTab = tabs[0];
        const currentDomain = new URL(currentTab.url).hostname;
        const data = {
          enabled: toggleSwitch.checked,
          selector: selector.value,
          customSelector: customSelector.value,
          maxWidth: maxWidth.value,
        };
        try {
          chrome.tabs.sendMessage(currentTab.id, {
            action: "applyCSS",
            ...data,
          });
        } catch (e) {
          console.log(e);
        }
        // Save settings to storage for the current domain
        chrome.storage.sync.set({
          [currentDomain]: data,
        });
      });
    } catch (e) {
      console.log("saveandapplyerror", e);
    }
  }
});

// Function to debounce a function execution
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
