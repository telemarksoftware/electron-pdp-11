// main.js

//+
// Author:  Mark H. Shin.  Copyright © 2022 telemark software®
//-

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, protocol } = require('electron')
const path = require('path')
const settings = require('electron-settings');
const express = require('express');

// Our self-contained web server
const server = express();
// Listen on port
server.listen(1145);
// Serve static files in pdp11 folder:  http://localhost:1145/pdp11-45.html
server.use(express.static(path.join(__dirname, 'pdp11')));

// Register file:// for privileged local file access bypassing Content Security Protocol
//protocol.registerSchemesAsPrivileged([
//  { scheme: 'file', privileges: { bypassCSP: true } }
//]);
// Register http:// for privileged local file access bypassing Content Security Protocol
//protocol.registerSchemesAsPrivileged([
//  { scheme: 'http', privileges: { bypassCSP: true } }
//]);
// Register https:// for privileged local file access bypassing Content Security Protocol
//protocol.registerSchemesAsPrivileged([
//  { scheme: 'https', privileges: { bypassCSP: true } }
//]);

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 760,
    height: 344,
		frame: false,
		transparent: true,
		hasShadow: true,
		resizable: false,
		maximizable: false,
		titleBarStyle: 'customButtonsOnHover',				// MacOS
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Restore mainWindow position & size if setting exists
	if (settings.hasSync('mainWindow.bounds')) {
		mainWindow.setBounds(settings.getSync('mainWindow.bounds'));
	}

	// Save mainWindow position & flavor synchronously before exit
	mainWindow.on('close', () => {
		settings.setSync('mainWindow.bounds',mainWindow.getBounds());
	});

  // Prevent nagigation away from main page.
  mainWindow.webContents.on('will-navigate', (event) => {
    event.preventDefault()
  });

  // and load the index.html of the app.
  mainWindow.loadURL('http://localhost:1145/pdp11-45.html');

	// Handlers for IPC
	ipcMain.on('minimize', () => {
	    mainWindow.minimize();
	});
	ipcMain.on('maximize', () => {
		mainWindow.maximize();
	});
	ipcMain.on('unmaximize', () => {
		mainWindow.unmaximize();
	});
	ipcMain.on('close', () => {
		if (process.platform !== 'darwin') app.quit()
	});
	ipcMain.handle('ismaximized', () => {
		return mainWindow.isMaximized();
	});
  // Toggle console tray
  ipcMain.on('console', () => {
    if (mainWindow.getBounds().height === 764) {
      mainWindow.setSize(760,344,true);
    } else {
      mainWindow.setSize(760,764,true);
    }
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  //if (process.platform !== 'darwin')
  app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.