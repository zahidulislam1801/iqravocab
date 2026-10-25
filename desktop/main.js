const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png')
  });

  // Google login and outside links open in the PC's own browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Let the X button close the window
  win.webContents.on('will-prevent-unload', (event) => {
    event.preventDefault();
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
