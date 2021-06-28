const ipcRenderer = require('electron').ipcRenderer;
const path = require('path');
const getmac = require('getmac');
const jquery = require('jquery');
const fs = require('fs');
var localAppDataFolder = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
var pathFileLog = localAppDataFolder + "\\Canon\\log.canon";
////////////////// Thêm sự kiện vào các button //////////////


window.onload = function(){
    document.getElementById('loginbtn').addEventListener('click',function(){
        //lấy thông tin đăng nhập từ id và pass tag
        var username = jquery('#username').val();
        var password = jquery('#password').val();
        console.log(username)
        console.log(password)

        GuiThongTinCapQuyen(username,password);
    })
}



////////////////// Thêm sự kiện vào các button //////////////

//////////

///////////////////// Sự kiện khi mở /////////////////////













///////////////////// Sự kiện khi mở /////////////////////

//////////

///////////////////// Sự kiện khi nhấn vào nút cấp quyền //////////////////////
var GuiThongTinCapQuyen = function(id,pass){
    var user = {
        username: id, //0 is no error, 4 is error with message, etc.
        password: pass, //can include error message (if any)
      };
    ipcRenderer.send('GuiThongTinCapQuyen',user);
}

ipcRenderer.on('KetQuaCapQuyen',function(event,arg){
    if(arg == 0){
        //cấp quyền không thành công
            jquery('#error').toggleClass('error');
    }
})



///////////////////// Sự kiện khi nhấn vào nút cấp quyền //////////////////////
