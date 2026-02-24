const { app, BrowserWindow } = require('electron');
const path = require('path');

app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    if (new URL(navigationUrl).origin !== 'file://') event.preventDefault();
  });
  contents.setWindowOpenHandler(() => ({ action: 'deny' }));
  contents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) event.preventDefault();
    if (input.control || input.meta) {
      if (['i', 'r', 'j', 'shift'].includes(input.key.toLowerCase())) event.preventDefault();
    }
  });
  contents.on('context-menu', (event) => event.preventDefault());
  contents.session.on('will-download', (event, item) => {
    item.setSavePath(require('path').join(require('os').homedir(), 'Downloads', item.getFilename()));
  });
});

function window() {
  const win = new BrowserWindow({
    width: 500, height: 500, frame: false, resizable: false,
    backgroundColor: '#00000000', transparent: true, show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
      webSecurity: true, devTools: false
    }
  });
  win.loadFile('index.html');
  win.webContents.executeJavaScript(`window.backend = 'http://150.241.230.45';`);
  win.once('ready-to-show', () => win.show());
  return win;
}

app.whenReady().then(() => {
  window();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) window();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
