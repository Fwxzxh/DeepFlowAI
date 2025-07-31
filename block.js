document.addEventListener('DOMContentLoaded', () => {
  const justificationText = document.getElementById('justification-text');
  const goBackButton = document.getElementById('go-back-button');
  const params = new URLSearchParams(window.location.search);
  const reason = params.get('reason');

  if (reason) {
    justificationText.textContent = reason;
  } else {
    justificationText.textContent = "This site is not aligned with your current task.";
  }

  goBackButton.addEventListener('click', () => {
    chrome.storage.local.get('lastUnblockedUrl', (data) => {
      const lastUrl = data.lastUnblockedUrl;
      // Navigate to the last good URL, or to the truly safe new tab page as a fallback.
      window.location.href = lastUrl || 'chrome://newtab';
    });
  });
});