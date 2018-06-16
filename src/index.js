import React from 'react';
import ReactDOM from 'react-dom/server';
import {app, BrowserWindow} from 'electron';

function Test() {
  return 'Hello World';
}

function createWindow () {
  const win = new BrowserWindow({show: false, width: 800, height: 600});

  win.once('ready-to-show', () => {
    win.show()
  });

  document.body.innerHTML = ReactDOM.renderToString(<Test/>);
}

app.on('ready', createWindow);