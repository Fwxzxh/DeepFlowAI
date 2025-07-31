// background.js
const POMODORO_DURATION = 25 * 60; // 25 minutes
let siteCache = {}; // Simple in-memory cache

chrome.runtime.onInstalled.addListener(() => {
  console.log("DeepFlowAI extension installed.");
  chrome.storage.sync.set({ focusMode: false, pomodoroMode: false, theme: 'light', intention: '' });
  chrome.storage.local.set({ timer: POMODORO_DURATION });
});

// Clear cache and justifications when the intention changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.intention) {
    console.log('Intention changed, clearing site cache.');
    siteCache = {};
    chrome.storage.local.remove(['lastUnblockedUrl'].concat(Object.keys(localStorage).filter(k => k.startsWith('justification-'))));
  }
});

// --- Pomodoro Timer Logic (remains the same) ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.command) {
    case 'start': startTimer(); break;
    case 'stop': stopTimer(); break;
    case 'reset': resetTimer(); break;
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pomodoroTimer') {
    chrome.storage.local.get('timer', (data) => {
      if (data.timer > 0) {
        chrome.storage.local.set({ timer: data.timer - 1 });
      } else {
        stopTimer();
        chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon128.png', title: 'Pomodoro Finished', message: 'Time for a break!' });
      }
    });
  }
});

function startTimer() { /* ... same as before ... */ }
function stopTimer() { /* ... same as before ... */ }
function resetTimer() { /* ... same as before ... */ }
// --- End of Pomodoro Logic ---


// --- Core Blocking Logic ---
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url || !tab.title) return;

  const url = new URL(tab.url);
  if (url.protocol.startsWith('chrome') || url.hostname.includes(chrome.runtime.id)) return;

  const { focusMode, intention, apiKey, geminiModel, wordLimit } = await chrome.storage.sync.get();

  if (focusMode && intention && apiKey) {
    // Pass the tab title to the decision function
    const { shouldBlock, justification } = await getBlockingDecision(intention, url.href, tab.title, apiKey, geminiModel, wordLimit || 40);
    
    // Store justification for the popup to use
    chrome.storage.local.set({ [`justification-${tabId}`]: justification });

    if (shouldBlock) {
      const blockPageUrl = chrome.runtime.getURL('block.html') + `?reason=${encodeURIComponent(justification)}`;
      chrome.tabs.update(tabId, { url: blockPageUrl });
    } else {
      // If the site is not blocked, save it as the last known good URL
      chrome.storage.local.set({ 'lastUnblockedUrl': tab.url });
    }
  }
});

async function getBlockingDecision(intention, url, title, apiKey, model, wordLimit) {
  const cacheKey = `${intention}::${url}`;
  if (siteCache[cacheKey]) {
    console.log(`Cache hit for ${url}`);
    return siteCache[cacheKey];
  }

  console.log(`Getting decision from Gemini for: ${title}`);
  // Updated prompt with both title and URL for better context
  const prompt = `My current task is: "${intention}". A user wants to visit a website with the title "${title}" at the URL "${url}". 

Is this site relevant to the task? 

Respond with a JSON object with two keys: 
1. "decision": a single word, either "YES" or "NO".
2. "justification": a brief explanation (under ${wordLimit} words) for your decision.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;
    const jsonText = rawText.match(/\`\`\`json\n(.*)\n\`\`\`/s)[1];
    const result = JSON.parse(jsonText);

    const decision = {
      shouldBlock: result.decision.toUpperCase() === 'NO',
      justification: result.justification
    };

    siteCache[cacheKey] = decision; // Cache the entire decision object
    return decision;

  } catch (error) {
    console.error("Error getting Gemini decision:", error);
    return { shouldBlock: false, justification: "Could not get a decision from the AI. Allowing site." }; // Default to allowing on error
  }
}