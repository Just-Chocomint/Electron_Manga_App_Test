const { log } = require('console');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== 'development';
// const {getManga} = require("./api/mangadex.js");
// const ipc = ipc;

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1000,
        minHeight: 800,  
        icon: path.join(__dirname, '/assets/appicon.ico'),
        
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true,
            contentSecurityPolicy: "default-src 'self' https://uploads.mangadex.org/covers/"
        }, 
        backgroundColor: '#151520', 
        // icon: null,
        frame:false
    });
    if (isDev) {
        win.webContents.openDevTools();
    }
    // console.log(path.join(__dirname, '/assets/appicon.png'));
    win.setMenuBarVisibility(false);
    win.loadFile(path.join(__dirname, './pages/index.html'))
    win.webContents.send("loadDetails",0,'');
    win.webContents.send("loadDetailsNato",1,'');

    ipcMain.on("minimiseApp", () => {
        console.log("Clicked Minimise button!");
        win.minimize();
    });

    // Maximize Restore App
    ipcMain.on("maximizeRestoreApp", () => {
        if (win.isMaximized()) {
            console.log("Clicked on Restore");
            win.restore();
        } else {
            console.log("Clicked on Maximize");
            win.maximize();
        }
    });
    //Close the app
    ipcMain.on("closeApp", () => {
        console.log("Clicked Close button!");
        win.close();
    });

    ipcMain.on("getInfoNato", (event,offset,search) => {
        console.log(offset);
        win.webContents.send("loadDetailsNato",offset,search);
    });

    ipcMain.on("getInfo", (event,offset,search) => {
        console.log(offset);
        win.webContents.send("loadDetails",offset,search);
    });

    ipcMain.on("getList", (event,offset,id) => {
        console.log(offset);
        win.webContents.send("loadChapters",offset,id);
    });

    ipcMain.on("getNatoDetails", (event,link,id) => {
        win.webContents.send("loadNatoDetails",link,id);
    });

    ipcMain.on("getImages", (event,id,index,mangaid) => {
        console.log(id);
        win.webContents.send("loadImages",id,index,mangaid);
    });

    ipcMain.on("getImagesNato", (event,link, id,title,index) => {
        console.log(id);
        win.webContents.send("loadNatoImages",link,id,title,index);
    });

    
    //Check if maximized
    win.on("maximize", () => {
        console.log('maximised');
        win.webContents.send("isMaximized");
    });

    // Check if is restored
    win.on("unmaximize", () => {
        console.log('herherhe');
    win.webContents.send("isRestored");
    });

    

}

app.whenReady().then(() => {
    // console.log('here3');
    // ipcMain.handle('getInfo',()=>{
    //     console.log("getInfo"); 
    //     return getManga()
    // })
    createWindow()
    app.on('activate', () => {
        console.log("here2")
        if (BrowserWindow.getAllWindows().length === 0) {
            console.log('here');
            createWindow()
        }
    });
});

app.on('window-all-closed', () => {
    if (!isMac ) app.quit() ;
});
  

// npx electronmon . 