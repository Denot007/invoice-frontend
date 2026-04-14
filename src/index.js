import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './ErrorBoundary';

console.log('INDEX.JS: Starting app initialization...');

const rootElement = document.getElementById('root');
console.log('INDEX.JS: Root element:', rootElement);

if (!rootElement) {
  console.error('INDEX.JS: ERROR - Root element not found!');
  alert('CRITICAL ERROR: Root element not found! Check console.');
} else {
  try {
    console.log('INDEX.JS: Creating React root...');
    const root = ReactDOM.createRoot(rootElement);

    console.log('INDEX.JS: Rendering App component...');
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('INDEX.JS: ✓ App rendered successfully');
  } catch (error) {
    console.error('INDEX.JS: ✗ CRITICAL ERROR rendering app:', error);
    alert('CRITICAL ERROR: ' + error.message + ' - Check console for details');
    rootElement.innerHTML = `
      <div style="background: #fee; color: #c00; padding: 20px; font-family: monospace; font-size: 14px;">
        <h2>❌ Critical Error Loading Application</h2>
        <p><strong>Error:</strong> ${error.message}</p>
        <p><strong>Stack:</strong></p>
        <pre style="background: #fff; padding: 10px; overflow: auto;">${error.stack}</pre>
        <hr/>
        <p><strong>Instructions:</strong> Please take a screenshot of this error and share it.</p>
      </div>
    `;
  }
}
