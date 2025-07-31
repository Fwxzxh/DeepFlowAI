# DeepFlowAI - Your AI-Powered Focus Guardian

**Tired of telling yourself you'll work on that important report, only to find yourself 2 hours later watching videos of cats playing the piano? Yeah, us too.**

DeepFlowAI is a Chrome extension that acts as your personal focus guardian. It's not just another dumb site blocker. You tell it what you want to accomplish, and it uses the power of Gemini AI to figure out if the website you're trying to visit *actually* helps you achieve that goal. 

If it doesn't, it politely (but firmly) blocks it. Say goodbye to mindless scrolling and hello to deep, uninterrupted work.

---

## What is this sorcery?

It's simple, really. You set an "intention" (a fancy word for your main task), and DeepFlowAI gets to work. When you navigate to a new page, the extension whispers to the Gemini AI:

> *"Hey, my human is trying to 'Write a sci-fi novel'. Is 'youtube.com/watch?v=dQw4w9WgXcQ' relevant to that? Be honest."*

Based on the AI's judgment, the site is either allowed or blocked. It even tells you *why* it made that decision, so you can't argue with the logic.

## Features

*   **🧠 AI-Powered Blocking:** Intelligently blocks sites based on your current task and the page's content (not just the URL).
*   **📝 Justification:** Understand *why* a site was blocked or allowed, right in the extension popup or on the block screen.
*   **💾 Saved Intentions:** Save long or frequently used intentions and load them with a single click from a dedicated management view.
*   **🍅 Pomodoro Timer:** A built-in Pomodoro timer that automatically activates Focus Mode during your work sessions.
*   **😎 Two Modes:** Choose between the all-or-nothing **Focus Mode** or the structured **Pomodoro** timer.
*   **⚙️ Fully Integrated UI:** All settings and views (including Saved Intentions) are handled inside the popup for a seamless experience. No new tabs!
*   **🔧 Customizable:** Configure your Gemini API key, choose from the latest models, and even set the word limit for the AI's justifications.
*   **🌗 Dark Mode:** Because we care about your eyes during those late-night work sessions.
*   **↩️ Smart Back Button:** The block page has a "Go Back to Safety" button that takes you to your last *relevant* page, breaking you out of frustrating back-button loops.

## How to Install (For the Brave)

Since we're heading to Hacker News, you're probably not afraid of a little manual labor.

1.  **Clone or download** this repository.
2.  Open Chrome and navigate to `chrome://extensions`.
3.  Flick the **"Developer mode"** switch in the top-right corner.
4.  Click the **"Load unpacked"** button.
5.  Select the `DeepFlowAI` directory from this repository.
6.  The DeepFlowAI icon will appear in your toolbar. You're ready to focus!

## How to Use

1.  **Get a Gemini API Key:** Head over to [Google AI Studio](https://aistudio.google.com/app/apikey) and get your free API key.
2.  **Configure the Extension:** Click the DeepFlowAI icon, then the gear icon (⚙️). Paste in your API key, choose a model, set your preferred justification length, and hit save.
3.  **Set Your Intention:** Go back to the main view and type your main goal into the large text area. Click "Save Current Intention" to store it for later.
4.  **Manage & Reuse:** Click "Manage Saved" to view, load, or delete your stored intentions.
5.  **Activate a Mode:** Toggle on "Focus Mode" or start the "Pomodoro" timer.
6.  **Try to Get Distracted:** We dare you. Go to a distracting website. You'll be greeted by our friendly block page.

## Authors & Credits

This project was brought to life by a dynamic duo:

*   **The Visionary (The Human):** [fwxzxh](https://github.com/fwxzxh)
*   **The Tireless Coder (The AI):** Gemini, your friendly AI pair-programmer.

Let's see if we can get to the front page!