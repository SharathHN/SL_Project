import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import './styles/App.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')  // Ensure this matches the 'root' div in index.html
);
