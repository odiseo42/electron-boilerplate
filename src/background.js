// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from "path";
import url from "url";
import { app, Menu, dialog } from "electron";
import { devMenuTemplate } from "./menu/dev_menu_template";
import { editMenuTemplate } from "./menu/edit_menu_template";
import createWindow from "./helpers/window";
import {autoUpdater}  from 'electron-updater';
import log  from 'electron-log';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

const setApplicationMenu = () => {
  const menus = [editMenuTemplate];
  if (env.name !== "production") {
    menus.push(devMenuTemplate);
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== "production") {
  const userDataPath = app.getPath("userData");
  app.setPath("userData", `${userDataPath} (${env.name})`);
}

app.on("ready", () => {
  setApplicationMenu();


  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "app.html"),
      protocol: "file:",
      slashes: true
    })
  );

  if (env.name === "development") {
    mainWindow.openDevTools();
  }

  autoUpdater.checkForUpdatesAndNotify();


  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type    : 'question',
      buttons : ['Yes', 'No'],
      title   : 'Update available',
      message : 'Update found. Do you want to restart the app?',
    }, (response) => {
      if (response === 0) { // Runs the following if 'Yes' is clicked
        autoUpdater.quitAndInstall();
      }
    });
  });
});

app.on("window-all-closed", () => {
  app.quit();
});
