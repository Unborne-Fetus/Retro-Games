const {app,BrowserWindow,shell} = require('electron');
const path = require('node:path');
app.whenReady().then(()=>{
  const win = new BrowserWindow({
    width:1200,height:800,minWidth:760,minHeight:560,
    backgroundColor:'#090d1e',
    autoHideMenuBar:true,
    webPreferences:{
      nodeIntegration:false,
      contextIsolation:true,
      sandbox:true,
      webSecurity:true
    }
  });
  win.loadFile(path.join(__dirname,'..','index.html'));
  win.webContents.setWindowOpenHandler(({url})=>{
    if(url.startsWith('https://')) shell.openExternal(url);
    return {action:'deny'};
  });
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
