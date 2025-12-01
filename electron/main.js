
const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 420, // Compact width for widget feel
    height: 700,
    minWidth: 380,
    minHeight: 500,
    frame: true, // Standard OS frame (set to false for custom pixel art frame later if desired)
    autoHideMenuBar: true, // Cleaner look
    icon: path.join(__dirname, '../public/icon.ico'), // You'll need an icon file
    backgroundColor: '#fffbeb', // Matches bg-yellow-50
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true, // Keep true for debugging, false for production
    },
  });

  // Handle Microphone Permissions specifically for Electron
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      // Approves the permissions request
      callback(true);
    } else {
      callback(false);
    }
  });

  // Load the app
  // In development, we load the Vite dev server
  // In production, we load the built index.html
  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Open the DevTools only in dev mode
  if (process.env.ELECTRON_START_URL) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
