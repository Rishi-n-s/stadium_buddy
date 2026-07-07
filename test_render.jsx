import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './src/App.jsx';

try {
  console.log("Rendering App...");
  renderToString(<App />);
  console.log("Rendered App successfully!");
} catch (e) {
  console.error(e);
}
