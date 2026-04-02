function restoreBadge() {
  chrome.storage.local.get(['badgeText', 'badgeColor'], (result) => {
    const text = result['badgeText'] as string | undefined;
    const color = (result['badgeColor'] as string | undefined) || '#1a1a2e';
    if (text) {
      chrome.action.setBadgeText({ text });
      chrome.action.setBadgeBackgroundColor({ color });
    }
  });
}

chrome.runtime.onInstalled.addListener(restoreBadge);
chrome.runtime.onStartup.addListener(restoreBadge);
