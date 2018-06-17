const path = require('path');
const {app, BrowserWindow} = require('electron');

require('dotenv').config({});

const windows = {};

function createWindow () {
    windows.main = new BrowserWindow({
        show: false,
        fullscreen: process.env.FULLSCREEN === 'true',
        width: 1300,
        height: 800,
        webPreferences: {
            webSecurity: false // todo: look into this
        }
    });

    windows.main.loadFile(path.resolve(__dirname, 'lib/index.html'));

    windows.main.on('closed', () => {
        windows.main = null;
    });

    windows.main.on('ready', () => {
        windows.main.show();
        windows.main.toggleDevTools();
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (!windows.main.main) {
        createWindow();
    }
});