const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png')
  });

  let fellBack = false;
  win.webContents.on('did-fail-load', (e, code, desc, url, isMainFrame) => {
    if (isMainFrame && !fellBack) {
      fellBack = true;
      win.loadFile('index.html');
    }
  });

  win.loadURL('https://iqravocab.pages.dev');
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
