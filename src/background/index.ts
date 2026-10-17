/**
 * Background Service Worker (Manifest V3)
 * Manages API calls securely without exposing API keys to content scripts or LeetCode DOM.
 * Supports streaming responses and error handling for Gemini & Claude.
 */
import { getStorageState } from '../core/storage';
import { AskCoachContext, AIConfig } from '../core/types';
import { DSA_COACH_SYSTEM_PROMPT, formatUserContext } from './prompt';

// Test connection handler
async function handleTestApiKey(config: AIConfig): Promise<{ success: boolean; message: string }> {
  if (!config.apiKey.trim()) {
    return { success: false, message: 'API key cannot be empty' };
  }

  try {
    if (config.provider === 'gemini') {
      const model = config.model || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
        config.apiKey.trim()
      )}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Hello, reply with "OK".' }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      });

      if (!res.ok) {
        if (res.status === 400 || res.status === 403) {
          return { success: false, message: '❌ Invalid API Key: Google Gemini ne key reject kar di.' };
        }
        if (res.status === 429) {
          return { success: false, message: '⏳ Rate limit exceeded. Kuch der baad koshish karein.' };
        }
        return { success: false, message: `Server error (${res.status}): ${res.statusText}` };
      }

      return { success: true, message: '✅ Gemini API connected successfully!' };
    } else {
      // Claude
      const model = config.model || 'claude-3-5-sonnet-20241022';
      const url = 'https://api.anthropic.com/v1/messages';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': config.apiKey.trim(),
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'dangerously-allow-browser': 'true',
        },
        body: JSON.stringify({
          model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Reply with "OK"' }],
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return { success: false, message: '❌ Invalid API Key: Anthropic Claude key invalid hai.' };
        }
        if (res.status === 429) {
          return { success: false, message: '⏳ Rate limit exceeded. Kuch der baad koshish karein.' };
        }
        return { success: false, message: `Server error (${res.status}): ${res.statusText}` };
      }

      return { success: true, message: '✅ Claude API connected successfully!' };
    }
  } catch (err: any) {
    return { success: false, message: `🔌 Network Error: ${err.message || 'Cannot reach API provider'}` };
  }
}

// Ask Coach Query Handler (Non-streaming fallback)
export async function askCoach(context: AskCoachContext): Promise<{ success: boolean; text?: string; error?: string }> {
  const state = await getStorageState();
  const config = state.aiConfig;

  if (!config || !config.enabled) {
    return {
      success: false,
      error: 'AI Mode disabled hai. Kripya Options page me ja kar AI Mode ON karein.',
    };
  }

  if (!config.apiKey || !config.apiKey.trim()) {
    return {
      success: false,
      error: 'API Key set nahi hai. Kripya Options me ja kar apni Gemini ya Claude API key dalein.',
    };
  }

  const promptText = formatUserContext(context);

  try {
    if (config.provider === 'gemini') {
      const model = config.model || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
        config.apiKey.trim()
      )}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${DSA_COACH_SYSTEM_PROMPT}\n\n${promptText}` }],
            },
          ],
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 600,
          },
        }),
      });

      if (!res.ok) {
        if (res.status === 400 || res.status === 403) {
          return { success: false, error: '❌ Invalid API key. Options me ja kar key check karein.' };
        }
        if (res.status === 429) {
          return { success: false, error: '⏳ Gemini rate limit exceed ho gayi. 30 seconds wait karein.' };
        }
        return { success: false, error: `API error (${res.status}): ${res.statusText}` };
      }

      const data = await res.json();
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!answer) {
        return { success: false, error: 'Empty response received from AI model.' };
      }

      return { success: true, text: answer.trim() };
    } else {
      // Claude
      const model = config.model || 'claude-3-5-sonnet-20241022';
      const url = 'https://api.anthropic.com/v1/messages';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': config.apiKey.trim(),
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'dangerously-allow-browser': 'true',
        },
        body: JSON.stringify({
          model,
          max_tokens: 600,
          system: DSA_COACH_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: promptText }],
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return { success: false, error: '❌ Invalid Claude API key. Options me key verify karein.' };
        }
        if (res.status === 429) {
          return { success: false, error: '⏳ Claude rate limit exceed ho gayi. 30 seconds wait karein.' };
        }
        return { success: false, error: `Claude API error (${res.status}): ${res.statusText}` };
      }

      const data = await res.json();
      const answer = data.content?.[0]?.text;
      if (!answer) {
        return { success: false, error: 'Empty response from Claude.' };
      }

      return { success: true, text: answer.trim() };
    }
  } catch (err: any) {
    return { success: false, error: `🔌 Network Error: ${err.message || 'Cannot connect to AI provider'}` };
  }
}

// Stream query handler over Chrome port
async function streamCoach(port: chrome.runtime.Port, context: AskCoachContext) {
  const state = await getStorageState();
  const config = state.aiConfig;

  if (!config || !config.enabled) {
    port.postMessage({
      type: 'ERROR',
      error: 'AI Mode disabled hai. Kripya Options page me ja kar AI Mode ON karein.',
    });
    return;
  }

  if (!config.apiKey || !config.apiKey.trim()) {
    port.postMessage({
      type: 'ERROR',
      error: 'API Key set nahi hai. Kripya Options me ja kar apni Gemini ya Claude API key dalein.',
    });
    return;
  }

  // Use askCoach and stream tokens in simulated chunks or SSE
  const result = await askCoach(context);
  if (!result.success) {
    port.postMessage({ type: 'ERROR', error: result.error });
    return;
  }

  // Chunk output for typing animation effect
  const fullText = result.text || '';
  const words = fullText.split(' ');
  let buffer = '';

  for (let i = 0; i < words.length; i++) {
    buffer += (i > 0 ? ' ' : '') + words[i];
    port.postMessage({ type: 'CHUNK', text: buffer });
    // Micro-delay between word batches
    if (i % 3 === 0) {
      await new Promise((r) => setTimeout(r, 20));
    }
  }

  port.postMessage({ type: 'DONE', text: fullText });
}

// Chrome Runtime Port Connection Listener (Streaming)
if (typeof chrome !== 'undefined' && chrome?.runtime?.onConnect) {
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'coach-stream') {
      port.onMessage.addListener(async (msg) => {
        if (msg.type === 'ASK_COACH_STREAM') {
          await streamCoach(port, msg.payload);
        }
      });
    }
  });
}

// Chrome Runtime Single Message Listener
if (typeof chrome !== 'undefined' && chrome?.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'ASK_COACH') {
      askCoach(message.payload).then(sendResponse);
      return true; // Asynchronous sendResponse
    }

    if (message.type === 'TEST_API_KEY') {
      handleTestApiKey(message.payload).then(sendResponse);
      return true;
    }

    return false;
  });
}
