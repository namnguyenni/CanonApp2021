const ipcRenderer = require('electron').ipcRenderer;
const path = require('path');
const jquery = require('jquery');
////////////// Sự kiện khi nhấn vào một nút /////////////

window.onload = function(){

  document.querySelectorAll(".fancybox").forEach(i => i.addEventListener(
    "click",
    e => {
        var type = jquery(i).attr('data-type');
        ipcRenderer.send('ThongTinType',type);
    }));
}

////////////// Sự kiện khi nhấn vào một nút /////////////


/////


////////////////// Các hàm sử lí gửi thông tin type pháo /////////////






////////////////// Các hàm sử lí gửi thông tin type pháo /////////////

