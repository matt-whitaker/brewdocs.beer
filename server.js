const path = require('path');
const {app, BrowserWindow} = require('electron');

let win;

app.on('ready', () => {
    win = new BrowserWindow({
        show: true,
        width: 1300,
        height: 800,
        webPreferences: {
            webSecurity: false
        }
    });

    win.loadFile(path.resolve(__dirname, 'lib/index.html'));

    win.on('closed', () => {
        win = null;
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});