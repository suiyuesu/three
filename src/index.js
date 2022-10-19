/*
 * @Descripttion: 
 * @version: 
 * @Author: 苏
 * @email: 1373842098@qq.com
 * @Date: 2022-10-19 14:06:26
 * @LastEditors: sj
 * @LastEditTime: 2022-10-19 14:59:31
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App';
import { Vr } from './VR/VR4.tsx'
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <App /> */}
    <Vr />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
