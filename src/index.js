const { app, BrowserWindow,ipcMain, dialog } = require('electron');
const path = require('path');
const { electron } = require('process');
const fs = require("fs");
const { dir } = require('console');
const { promisify } = require('util');
const toPdf = require('office-to-pdf')
const readdir = promisify(fs.readdir);
const rmdir = promisify(fs.rmdir);
const unlink = promisify(fs.unlink);
const getmac = require('getmac');
const crypto = require('crypto');

var type;

if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    minHeight : 800,
    minWidth:1000,
    icon: path.join(__dirname, 'LOGO_CanonApp2021.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });

  global.mainWindow = mainWindow;

  mainWindow.setMenu(null);

  checkFileLog();
  // mở console
  //mainWindow.webContents.openDevTools();
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

//hàm test 
ipcMain.addListener('ddd',function(event,arg){
  dialog.showErrorBox("loi","co loi xay ra");
})


//xử lí đọc file từ folder đầu vào

const getAllFiles = function(dirPath, arrayOfFiles) {
  CheckExist(dirPath);
  files = fs.readdirSync(dirPath)
  arrayOfFiles = arrayOfFiles || []
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles.push(path.join(dirPath, "/", file))
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file))
    }
  })
  return arrayOfFiles
}

//nhận yêu cầu đọc thư mục : bao gồm file và thư mục con
ipcMain.addListener('LoadAllFile_In_Directory',function(event,arg){
  var localAppDataFolder = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
  var path = localAppDataFolder+'\\Canon\\' + arg
  console.log(path)
  if(CheckExist(path)) {
    //tiến hành đọc file đầu vào
    const result = getAllFiles(path);
    mainWindow.webContents.send('XuliFileName', result);
  }
  else{

  }

})

//nhận tín hiệu saveBG
ipcMain.addListener('SaveNewBG',function(event,arg){
  if(!CheckExist(arg))
  {
    mainWindow.webContents.send('XacnhanSaveBG',arg)
    CheckExist(arg+'\\Lý thuyết');
    CheckExist(arg+'\\Video');
    CheckExist(arg+'\\Mô hình');

  }
  else {
  dialog.showErrorBox("Lỗi","Bài giảng đã tồn tại!");
  mainWindow.webContents.send('XacnhanSaveBG',0);

  }
})

////////////////////////// Thêm File////////////////
ipcMain.addListener('YeucauAddFile',function(event,arg){
  /// Mở Folder
    const files = dialog.showOpenDialog(mainWindow,{
      properties: ['openFile'],
      title:"Chọn tệp tin thêm vào CanonApp",
      filters: [
        { name: 'All Files', extensions: ['pdf','doc','docx','ppt','pptx','avi', 'mp4','html','glb'] },
        { name: 'Lythuyet', extensions: ['pdf','doc','docx','ppt','pptx'] },
        { name: 'Video', extensions: ['avi', 'mp4'] },
        { name: 'Mohinh', extensions: ['html','glb'] }
      ]
    }).then(function(response){
      if (!response.canceled) {
        // thêm ngay vào đường dẫn arg
        var des = arg +'\\'+ path.parse(response.filePaths[0]).name + path.parse(response.filePaths[0]).ext;
        var ind = 1;
        while(fs.existsSync(des)){
          des =arg +'\\'+ path.parse(response.filePaths[0]).name +'('+ind+')'+ path.parse(response.filePaths[0]).ext;
          ind++;
        }
        //nếu tên file như này
        var et = path.parse(response.filePaths[0]).ext.toLowerCase();
        if(et =='.doc'||et =='.docx'||et =='.ppt'||et =='.pptx')
        {
          ConvertOffice(response.filePaths[0], arg +'\\'+ path.parse(des).name + '.pdf');
          return;
        }
        fs.copyFile(response.filePaths[0],des, (err) => {
          if (err){ throw err;return;}
          mainWindow.webContents.send('XacNhanThemFile',des);
        });

      }
      else{

      }
    })
    
})

var ConvertOffice = function(input,output){
  var wordBuffer = fs.readFileSync(input);

  toPdf(wordBuffer).then(
    (pdfBuffer) => {
      fs.writeFileSync(output, pdfBuffer)
      return true;
    }, (err) => {
      console.log('khong thanh cong')
    }
  )

}


/////////////////////////////////Thêm File/////////

//hàm xác định xem một thư mục đã tồn tại hay chưa
function CheckExist(dirPath){
  try {
    if (fs.existsSync(dirPath)) {
      //đường dẫn này đã tồn tại
      return true;
    } else {
      //đương dẫn này chưa tồn tại
      fs.mkdir(dirPath, function(err) {
        if (err) {
          console.log('khong the tao')
        } else {
        }
      })
    }
  } catch(e) {
  }
  return false;
}

////////////////Xoa file hoac thu muc
ipcMain.addListener('XoaFileHoacThuMuc',function(event,arg){
  //kiem tra duong dan la file hay thu muc
  if(fs.statSync(arg).isDirectory())
  {
    try {
      exports.rmdirs(arg);
      //xoa thanh cong thi gui goi tin ve la xoa thanh cong
      mainWindow.webContents.send('XacNhanXoa',arg)

    } catch (error) {
      //gui goi tin ve thong bao xoa khogn thanh cong
      mainWindow.webContents.send('XacNhanXoa',0)

    }
  }
  else {//neu kkhong thi tien hanh xoa file
    try {
    fs.unlinkSync(arg)
    mainWindow.webContents.send('XacNhanXoa',arg)
      
    } catch (error) {
      mainWindow.webContents.send('XacNhanXoa',0)
      
    }
  }


})




exports.rmdirs = async function rmdirs(dir) {
  let entries = await readdir(dir, { withFileTypes: true });
  let results = await Promise.all(entries.map(entry => {
    let fullPath = path.join(dir, entry.name);
    let task = entry.isDirectory() ? rmdirs(fullPath) : unlink(fullPath);
    return task.catch(error => ({ error }));
  }));
  results.forEach(result => {
    // Ignore missing files/directories; bail on other errors
    if (result && result.error.code !== 'ENOENT') throw result.error;
  });
  await rmdir(dir);
};
/////END- Xoa file hoac thu muc

//////////////////// Xử lí thông tin tài khoản cấp quyền //////////////////

ipcMain.addListener('GuiThongTinCapQuyen',function(event,arg){
  var user = [
    {username: 'nguyenvannam', password: 'namnguyen123'},
    {username: 'namnguyenvan', password: 'namnguyen123'},
    {username: 'phhungv1', password: 'phamhoanghung'},
    {username: 'nguyenvannam3', password: 'namnguyen123'},
    {username: 'nguyenvannam4', password: 'namnguyen123'},
    {username: 'nguyenvannam5', password: 'namnguyen123'}
  ]
  user.forEach(element => {
    if(element.username == arg.username && element.password == arg.password)
    {
      //nếu được thì ta chuyển trang
      mainWindow.loadFile(path.join(__dirname, 'ChooseType.html'));
      //lưu thông tin mac vào file
      var localAppDataFolder = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
      var pathFileLog = localAppDataFolder + "\\Canon\\log.canon";
      var mac ;

      try {
        mac = getmac.default();
      } catch (error) {
        mac = "Khongnhanradiachimac";
        dialog.showErrorBox("Không nhận dạng thiết bị này","Kết nối vào một mạng để lưu lần đăng nhập tiếp theo");
        
      }
      var today = new Date();
      var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

      //LƯU THÔNG TIN FILE
      var hash = crypto.createHash('md5').update(mac).digest('hex');
      fs.writeFile(pathFileLog, hash, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("File này đã được lưu!");
    }); 

      return;
    }
  });
  
  mainWindow.webContents.send('KetQuaCapQuyen',0);
})

//check thông tin để hiển thị
var checkFileLog = function(){

  var localAppDataFolder = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
  var pathFileLog = localAppDataFolder + "\\Canon\\log.canon";
  if (!fs.existsSync(pathFileLog)) {
    mainWindow.loadFile(path.join(__dirname, 'Sercurity.html'));
    return ;
  }

  var mac ;
  try {
    mac = getmac.default();
  } catch (error) {
    mac = "NODEFINE";
  }
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

  //LƯU THÔNG TIN FILE
  var hash = crypto.createHash('md5').update(mac).digest('hex');
  console.log(hash);
  fs.readFile(pathFileLog, 'utf8', function(err, data) {
    console.log(data);
      if(data.toString() == hash.toString()){
        mainWindow.loadFile(path.join(__dirname, 'ChooseType.html'));
        return ;
      }
      console.log('false');
    if (err) {
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'Sercurity.html'));

}


////////////// Thong tin type và hiển thị/////////////

ipcMain.addListener('ThongTinType',function(event,arg){
  type = arg;
  //
  console.log(path.join(__dirname, 'index.html'))
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
})


ipcMain.addListener('CheckThongTinType',function(event,arg){
  mainWindow.webContents.send('CheckType',type);
})

////////////// Thong tin type /////////////


//////// xac nhan doi ten ////////////////



ipcMain.addListener('XacNhanDoiTen',function(event,arg1,arg2){
  fs.rename(arg1, arg2, function(err) {
    if (err) {
      console.log(err)
      mainWindow.webContents.send('KetQuaDoiTen',arg1)
    } else {
      console.log("Successfully renamed the directory.")
      mainWindow.webContents.send('KetQuaDoiTen',1)
    }
  })
})

ipcMain.addListener('Vetrangchon',function(){
  mainWindow.loadFile(path.join(__dirname, 'ChooseType.html'));

})