document.addEventListener('DOMContentLoaded', () => {
  // --- View Elements ---
  const mainView = document.getElementById('main-view');
  const settingsView = document.getElementById('settings-view');
  const savedIntentionsView = document.getElementById('saved-intentions-view');

  // --- Main View Elements ---
  const themeToggle = document.getElementById('theme-toggle');
  const settingsButton = document.getElementById('settings-button');
  const intentionInput = document.getElementById('intention');
  const saveIntentionBtn = document.getElementById('save-intention-btn');
  const manageIntentionsBtn = document.getElementById('manage-intentions-btn');
  const focusModeToggle = document.getElementById('focus-mode-toggle');
  const pomodoroModeToggle = document.getElementById('pomodoro-mode-toggle');
  const pomodoroTimerEl = document.getElementById('pomodoro-timer');
  const timerDisplay = document.querySelector('.timer-display');
  const startPomodoroBtn = document.getElementById('start-pomodoro');
  const stopPomodoroBtn = document.getElementById('stop-pomodoro');
  const resetPomodoroBtn = document.getElementById('reset-pomodoro');
  const justificationArea = document.getElementById('justification-area');
  const justificationText = document.getElementById('justification-text');

  // --- Settings View Elements ---
  const backButton = document.getElementById('back-button');
  const apiKeyInput = document.getElementById('api-key');
  const modelSelect = document.getElementById('model-select');
  const wordLimitInput = document.getElementById('word-limit');
  const saveButton = document.getElementById('save-button');
  const statusMessage = document.getElementById('status-message');

  // --- Saved Intentions View Elements ---
  const backToMainBtn = document.getElementById('back-to-main-btn');
  const savedIntentionsList = document.getElementById('saved-intentions-list');

  // --- Functions ---
  const switchToView = (viewToShow) => {
    [mainView, settingsView, savedIntentionsView].forEach(view => view.classList.add('hidden'));
    viewToShow.classList.remove('hidden');
  };

  const renderSavedIntentions = (intentions) => {
    savedIntentionsList.innerHTML = '';
    if (intentions && intentions.length > 0) {
      intentions.forEach((intention, index) => {
        const li = document.createElement('li');
        li.textContent = intention;
        li.addEventListener('click', () => {
          intentionInput.value = intention;
          chrome.storage.sync.set({ intention: intention });
          switchToView(mainView);
        });
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✖';
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          intentions.splice(index, 1);
          chrome.storage.sync.set({ savedIntentions: intentions });
        });
        li.appendChild(deleteBtn);
        savedIntentionsList.appendChild(li);
      });
    } else {
      savedIntentionsList.innerHTML = '<li class="no-intentions">No saved intentions yet.</li>';
    }
  };

  const showJustification = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      const data = await chrome.storage.local.get(`justification-${tab.id}`);
      const justification = data[`justification-${tab.id}`];
      if (justification) {
        justificationText.textContent = justification;
        justificationArea.classList.remove('hidden');
      } else {
        justificationArea.classList.add('hidden');
      }
    }
  };

  const updateTimerDisplay = () => {
    chrome.storage.local.get('timer', (data) => {
      const time = data.timer !== undefined ? data.timer : (25 * 60);
      const minutes = Math.floor(time / 60).toString().padStart(2, '0');
      const seconds = (time % 60).toString().padStart(2, '0');
      timerDisplay.textContent = `${minutes}:${seconds}`;
    });
  };

  // --- Load Initial State ---
  chrome.storage.sync.get(['focusMode', 'pomodoroMode', 'theme', 'intention', 'apiKey', 'geminiModel', 'wordLimit', 'savedIntentions'], (data) => {
    focusModeToggle.checked = !!data.focusMode;
    pomodoroModeToggle.checked = !!data.pomodoroMode;
    if (data.pomodoroMode) pomodoroTimerEl.classList.remove('hidden');
    if (data.theme === 'dark') document.body.classList.add('dark-mode');
    if (data.intention) intentionInput.value = data.intention;
    if (data.apiKey) apiKeyInput.value = data.apiKey;
    if (data.geminiModel) modelSelect.value = data.geminiModel;
    wordLimitInput.value = data.wordLimit || 40;
    renderSavedIntentions(data.savedIntentions);
  });

  updateTimerDisplay();
  setInterval(updateTimerDisplay, 1000);
  showJustification();

  // --- Event Listeners ---
  // View Switching
  settingsButton.addEventListener('click', () => switchToView(settingsView));
  backButton.addEventListener('click', () => switchToView(mainView));
  manageIntentionsBtn.addEventListener('click', () => switchToView(savedIntentionsView));
  backToMainBtn.addEventListener('click', () => switchToView(mainView));

  // Main View
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    chrome.storage.sync.set({ theme });
  });

  intentionInput.addEventListener('input', () => {
    chrome.storage.sync.set({ intention: intentionInput.value });
  });

  focusModeToggle.addEventListener('click', () => {
    chrome.storage.sync.set({ focusMode: focusModeToggle.checked });
  });

  pomodoroModeToggle.addEventListener('click', () => {
    const isEnabled = pomodoroModeToggle.checked;
    pomodoroTimerEl.classList.toggle('hidden', !isEnabled);
    chrome.storage.sync.set({ pomodoroMode: isEnabled });
    if (!isEnabled) chrome.runtime.sendMessage({ command: 'stop' });
  });

  startPomodoroBtn.addEventListener('click', () => chrome.runtime.sendMessage({ command: 'start' }));
  stopPomodoroBtn.addEventListener('click', () => chrome.runtime.sendMessage({ command: 'stop' }));
  resetPomodoroBtn.addEventListener('click', () => chrome.runtime.sendMessage({ command: 'reset' }));

  saveIntentionBtn.addEventListener('click', () => {
    const newIntention = intentionInput.value.trim();
    if (newIntention) {
      chrome.storage.sync.get('savedIntentions', (data) => {
        const intentions = data.savedIntentions || [];
        if (!intentions.includes(newIntention)) {
          intentions.push(newIntention);
          chrome.storage.sync.set({ savedIntentions: intentions });
        }
      });
    }
  });

  // Settings View
  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    const geminiModel = modelSelect.value;
    const wordLimit = wordLimitInput.value;
    if (!apiKey) {
      statusMessage.textContent = 'API key is required.';
      return;
    }
    chrome.storage.sync.set({ apiKey, geminiModel, wordLimit }, () => {
      statusMessage.textContent = 'Settings saved!';
      setTimeout(() => { statusMessage.textContent = ''; }, 2000);
    });
  });

  // Live update for saved intentions list
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.savedIntentions) {
      renderSavedIntentions(changes.savedIntentions.newValue);
    }
  });
});