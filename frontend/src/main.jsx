import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './global.css' // 引入全局样式文件

// If you see something like this:
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// You could modify it to remove StrictMode for production:
// ReactDOM.createRoot(document.getElementById('root')).render(<App />);
