import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../ui/App';
import tailwindStyles from './content.css?inline';

const HOST_ID = 'dsa-thinking-coach-host';

function mountDSAThinkingCoach() {
  // Prevent duplicate mounts
  if (document.getElementById(HOST_ID)) {
    return;
  }

  // 1. Create Host Element in document body (zero layout shift, non-blocking)
  const host = document.createElement('div');
  host.id = HOST_ID;
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.left = '0';
  host.style.width = '0';
  host.style.height = '0';
  host.style.zIndex = '999999';
  host.style.pointerEvents = 'none';
  document.body.appendChild(host);

  // 2. Attach Shadow DOM (open mode) to isolate styles from LeetCode
  const shadowRoot = host.attachShadow({ mode: 'open' });

  // 3. Inject compiled Tailwind styles directly into shadow root
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-source', 'dsa-thinking-coach-tailwind');
  styleEl.textContent = tailwindStyles;
  shadowRoot.appendChild(styleEl);

  // 4. Create React mount container inside Shadow Root
  const container = document.createElement('div');
  container.id = 'dsa-thinking-coach-app';
  container.style.pointerEvents = 'auto';
  shadowRoot.appendChild(container);

  // 5. Render React Application
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountDSAThinkingCoach);
} else {
  mountDSAThinkingCoach();
}
