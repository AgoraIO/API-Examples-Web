import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HashRouter } from "react-router-dom";
import 'antd/dist/reset.css';
import "./css/index.css";
ReactDOM.createRoot(document.getElementById('root')).render(<HashRouter>
    <App />
  </HashRouter>);