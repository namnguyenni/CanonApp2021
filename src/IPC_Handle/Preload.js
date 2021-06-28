const ipcRenderer = require('electron').ipcRenderer;
const path = require('path');
const jquery = require('jquery');
const fs = require('fs');
var folderData;// folder cuar tree hien tai
var Loaiphao = "";
window.onload=function(){
//thêm sự kiện cho 
document.getElementById('btnThemBG').addEventListener('click',function(){
  ThemBaiGiang();
})
document.getElementById('btnXoa').addEventListener('click',function(){
  
  if(ElementClick!= null && ElementClick != undefined && ElementClick.getAttribute('tag') != null && ElementClick.getAttribute('tag') !=''){
    XoaFunction(ElementClick.getAttribute('tag'));
  }
})
document.getElementById('ReturnChoose').addEventListener('click',function(event,arg){
  ipcRenderer.send('Vetrangchon');
})
document.getElementById('btnAddFile').addEventListener('click',function(){
  if(ElementClick!= null || ElementClick != undefined){
    if(ElementClick.classList.contains('btnFolder'))
      ThemFile(ElementClick.getAttribute('tag'));
    else 
    {
      ThemFile(folderData);
    }
  }

})
document.getElementById('btnRename').addEventListener('click',function(){
  ClickBtnDoiTen();
})

// thêm sự kiện để ẩn treeview
document.querySelectorAll(".btnFolder").forEach(i=>i.addEventListener("click",e=>{
  var jq = jquery(i).children('ul')[0];
  jquery(jq).toggleClass('unexpand');
}))

setTimeout(() => {
    ipcRenderer.send('CheckThongTinType');
    setTimeout(() => {
    document.getElementById('Lythuyet').click();
      }, 1000);
}, 1000);

document.querySelectorAll(".menu-item").forEach(i => i.addEventListener(
  "click",
  e => {
    var id = i.getAttribute('id');
    var type = i.getAttribute('data-path');
    let activerecent = jquery('i.active');
    activerecent.removeClass('active');
    i.firstChild.classList.add('active');

    if(id=='Lythuyet'){
      document.getElementById('texttitle').innerHTML = 'Lý thuyết';
    }
    else if(id=='Baigiang'){
      document.getElementById('texttitle').innerHTML = 'Bài giảng';

    }
    else if(id=='Mohinh'){
      document.getElementById('texttitle').innerHTML = 'Mô hình';

    }
    else if(id=='Video'){
      document.getElementById('texttitle').innerHTML = 'Video';

    }

  var localAppDataFolder = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
  folderData = localAppDataFolder + '\\Canon\\' + type + '\\' +id;

  document.getElementById('treeFile').setAttribute('data-path',folderData);
    SendRequire_GetAllFile(type+'\\' + id);
  }));

  //////////////////////////////sự kiện mở file dữ liệu từ treeview
  document.querySelectorAll(".btnFile").forEach(i => i.addEventListener(
    "click",
    e => {
      var tag = i.getAttribute('tag');
      var ext = path.parse(tag).ext;

      if(ext==".mp4") 
      {
        document.getElementById('iframe3D').style.display = 'none';
        document.getElementById('iframeVideo').style.display = 'inherit';
        newSrc_3d(tag,2);

      }
      else{
        document.getElementById('iframeVideo').style.display = 'none';
        document.getElementById('iframe3D').style.display = 'inherit';

        newSrc_3d(tag,1);
      }
      jquery('title')[0].text = "CanonApp 2021 - " + Loaiphao + path.parse(tag).name;
    }));
}


//gọi lấy tất cả các file trong một thư mục
function SendRequire_GetAllFile(path){
  ipcRenderer.send("LoadAllFile_In_Directory",path);
}
///////////////////////Đọc tất cả thư mục và file trong thư mục cho trước
ipcRenderer.on('XuliFileName',function(event,arg){
  //xóa hết thông tin tree ban đầu
  document.getElementById('treeFile').innerHTML = '';
  var check = 0;
  //thêm hết các thư mục vào theo thứ tự
  var pathroot;
  if(arg.length>0)
  {
  pathroot= arg[0].replace('\\'+path.parse(arg[0]).name + path.parse(arg[0]).ext ,'');
  }
  else return;
  arg.forEach(function(file){
    //nếu nó là folder
    if(path.parse(file).ext =='')
    {
      //kiểm tra folder mẹ của nó có giống root ko??
      var parentfolder = file.replace('\\'+path.parse(file).name + path.parse(file).ext,'');
      //nếu giống thì thêm luôn
      if(parentfolder == pathroot)
      {
        var str = '<li class="btnFolder" tag="'+ file+'">'+
        '<a class="btnFolder expandable" style="width:100%" tag="'+file +'"><i class="fa fa-list btnFolder expandable" aria-hidden="true" style="font-size: 15px;color:white" tag="'+ file +'"></i>  '+ path.parse(file).name +'</a>'+
        '<ul>'+
        '</ul></li>'
        jquery('#treeFile').append(str);
      }
      //kiểm tra nếu folder root của nó khác thì tìm kiếm trong thẻ ul rồi thêm vào
      else{
        //tìm kiếm btnFolder có tag giống => lấy thẻ ul trong nó, append vào
        document.querySelectorAll('li.btnFolder').forEach(i=>{
          if(jquery(i).attr('tag') == parentfolder)
          {
            var str = '<li class="btnFolder" tag="'+ file+'">'+
            '<a class="btnFolder expandable" style="width:100%" tag="'+file +'"><i class="fa fa-list btnFolder expandable" aria-hidden="true" style="font-size: 15px;color:blue" tag="'+ file +'"></i>  '+ path.parse(file).name +'</a>'+
            '<ul>'+
            '</ul></li>'
            var jq = jquery(i).children('ul')[0];
            jquery(jq).append(str);
          }
        })
      }
    }

    else{
      var parentfile = file.replace('\\'+path.parse(file).name + path.parse(file).ext,'');

      if(parentfile == pathroot)
      {
        var str = '<li class="btnFile" tag="'+ file+'">'+
        '<a class="btnFile" style="width:100%" tag="'+file +'"><i class="fa fa-file-text btnFile" aria-hidden="true" style="font-size: 15px;color:green" tag="'+ file +'"></i>  '+ path.parse(file).name +'</a>'+
        '</li>'
        jquery('#treeFile').append(str);
      }
      else{

      document.querySelectorAll('li.btnFolder').forEach(i=>{
        if(jquery(i).attr('tag') == parentfile)
        {
          var str = '<li class="btnFile" tag="'+ file+'">'+
          '<a class="btnFile" style="width:100%" tag="'+file +'"><i class="fa fa-file-text btnFile" aria-hidden="true" style="font-size: 15px;color:green" tag="'+ file +'"></i>  '+ path.parse(file).name +'</a>'+
          '</li>'
          var jq = jquery(i).children('ul')[0];
          jquery(jq).append(str);
        }
      })
      }
    }
  })

  document.querySelectorAll(".expandable").forEach(i=>i.addEventListener(
    "click",
    e=>{
    //check nội dung hiện tại
    var parent = jquery(i).closest('li');
    var jq = jquery(parent).children('ul')[0];
    console.log(jq)
    console.log(parent);

    if(jq!=null){
      jquery(jq).toggleClass('unexpand');
      jquery(parent).toggleClass('check');
    }


    }))

  //kiểm tra nếu folder mẹ của nó khác
  //thêm sự kiện nhấn để mở file
  document.querySelectorAll(".btnFile").forEach(i => i.addEventListener(
    "click",
    e => {
      var tag = i.getAttribute('tag');
      var ext = path.parse(tag).ext;
      if(ext==".mp4") 
      {
        document.getElementById('iframe3D').style.display = 'none';
        document.getElementById('iframeVideo').style.display = 'inherit';

        newSrc_3d(tag,2);
      }
      else if(ext=='.pdf'|| ext=='.html'){
        document.getElementById('iframeVideo').style.display = 'none';
        document.getElementById('iframe3D').style.display = 'inherit';
        newSrc_3d(tag,1);
      }

      jquery('title')[0].text = "CanonApp 2021 - " + Loaiphao + path.parse(tag).name;
    }));

})



//thay đổi src trong frame
function newSrc_3d(src,type) {
  if(type==1)
  {
  document.getElementById("iframe3D").src=src;
    document.getElementById('iframeVideo').pause();
  }
  else
  { 
    var recentSrc = document.getElementById("srcVideo").src;
    document.getElementById("srcVideo").src =  src;

    if(path.parse(recentSrc).name != path.parse(src).name)
    {
      document.getElementById('iframeVideo').load();
    }
    document.getElementById('iframeVideo').play();
  }
 }


 /////////////////////////Thêm bài giảng///////////////////////////////
 var ThemBaiGiang = function()
 {
   if(document.getElementById('InputTenBG') != null) return;

var htmlNewFolder = '<li class="btnFolder" tag="">'+
                  '<a class="btnFolder expandable" style="width:100%" tag=""><i class="fa fa-list btnFolder expandable" aria-hidden="true" style="font-size: 15px;color:white" tag=""></i>  <input id="InputTenBG" type="text" title="Nhập tên bài giảng"/></a>'+
                  '<ul>'+
                  '<li class="btnFolder lythuyet">'+
                    '<a class="btnFolder expandable lythuyet"><i class="fa fa-list btnFolder lythuyet expandable" aria-hidden="true" style="font-size: 15px;color:blue"></i>  Lý thuyết</a>'+
                    '<ul>'+
                    '</ul>'+
                  '</li>'+
                  '<li class="btnFolder video">'+
                    '<a class="btnFolder expandable video"><i class="fa fa-list btnFolder video expandable" aria-hidden="true" style="font-size: 15px;color:blue"></i>   Video</a>'+
                    '<ul>'+
                    '</ul>'+
                  '</li>'+
                  '<li class="btnFolder mohinh">'+
                    '<a class="btnFolder expandable mohinh"><i class="fa fa-list btnFolder mohinh expandable" aria-hidden="true" style="font-size: 15px;color:blue"></i>  Mô hình</a>'+
                    '<ul>'+
                    '</ul>'+
                  '</li>'+		  
                  '</ul>'+
                  '</li>'

        jquery('#treeFile').append(htmlNewFolder);
        document.getElementById("InputTenBG").focus();
        jquery('#InputTenBG').on('change',function(){
          SaveBG();
        })
 }

//gửi thông tin saveBG
var SaveBG = function(){
  var newbg = document.getElementById('InputTenBG');
  var text = newbg.value;
  var folderPath = document.getElementById('treeFile').getAttribute('data-path') +'\\' +text
  ipcRenderer.send("SaveNewBG",folderPath);
}

//nhận tín hiệu xác nhận save
ipcRenderer.on('XacnhanSaveBG',function(event,arg){
  if(arg!=0){
    //xóa tag input thêm vào tag a
    var newbg = document.getElementById('InputTenBG');
    var pr = newbg.parentNode.parentNode;
    var text = path.parse(arg).name;
    document.getElementById('InputTenBG').parentNode.append(text);
    jquery('#InputTenBG').remove();
    //đăt các treenode lythuyet bai giang hay mô hình có thuộc tính tag là đường dẫn
    //thêm tag
    pr.querySelectorAll('.btnFolder').forEach(i=>{
      i.setAttribute('tag',arg);
    })
    pr.setAttribute('tag',arg);

    pr.querySelectorAll('.lythuyet').forEach(i=>{
      i.setAttribute('tag',arg + '\\' + 'Lý thuyết');
    })

    pr.querySelectorAll('.video').forEach(i=>{
      i.setAttribute('tag',arg + '\\' + 'Video');
    })

    pr.querySelectorAll('.mohinh').forEach(i=>{
      i.setAttribute('tag',arg + '\\' + 'Mô hình');
    })

    document.querySelectorAll(".expandable").forEach(i=>i.addEventListener(
      "click",
      e=>{
      //check nội dung hiện tại
      var parent = jquery(i).closest('li');
      var jq = jquery(parent).children('ul')[0];
  
      if(jq!=null){
        jquery(jq).toggleClass('unexpand');
        jquery(parent).toggleClass('check');
      }
  
  
      }))
  }
})
/////////////////////// HÀM THÊM BÀI GIẢNG --- END ///////////////////


/////////////////////////////////////////////////----- Thêm FIle vào tree//////////////

var ThemFile = function(tag){
  ipcRenderer.send('YeucauAddFile',tag);
}

ipcRenderer.on('XacNhanThemFile',function(event,arg){
  var parentfile = arg.replace('\\'+path.parse(arg).name + path.parse(arg).ext,'');

  if(parentfile == folderData)//nếu nó là file của folder root
  {
    var str = '<li class="btnFile" tag="'+ arg+'">'+
    '<a class="btnFile" style="width:100%;" tag="'+arg +'"><i class="fa fa-file-text btnFile" aria-hidden="true" style="font-size: 15px;color:green" tag="'+ arg +'"></i>  '+ path.parse(arg).name +'</a>'+
    '</li>'
    jquery('#treeFile').append(str);
  }
else{
  document.querySelectorAll('li.btnFolder').forEach(i=>{
    if(jquery(i).attr('tag') == parentfile)
    {
      var str = '<li class="btnFile" tag="'+ arg+'">'+
      '<a class="btnFile" style="width:100%;" tag="'+arg +'"><i class="fa fa-file-text btnFile" aria-hidden="true" style="font-size: 15px;color:green" tag="'+ arg +'"></i>  '+ path.parse(arg).name +'</a>'+
      '</li>'
      var jq = jquery(i).children('ul')[0];
      jquery(jq).append(str);
    }
  })
  }

  //thêm sự kiện click cho btn file này
  document.querySelectorAll(".btnFile").forEach(i => i.addEventListener(
    "click",
    e => {
      var tag = i.getAttribute('tag');
      var ext = path.parse(tag).ext;
      if(ext==".mp4") 
      {
        document.getElementById('iframe3D').style.display = 'none';
        document.getElementById('iframeVideo').style.display = 'inherit';

        newSrc_3d(tag,2);
      }
      else if(ext=='.pdf'|| ext=='.html'){
        document.getElementById('iframeVideo').style.display = 'none';
        document.getElementById('iframe3D').style.display = 'inherit';
        newSrc_3d(tag,1);
      }

      jquery('title')[0].text = "CanonApp 2021 - " + Loaiphao  + path.parse(tag).name;
    }));


})

///////////////////////////HÀM THÊM FILE VÀO TREE -- END  /////////////////////

/////////////// XU LI XOA FILE/////////////////
var XoaFunction = function(arg){
  ipcRenderer.send('XoaFileHoacThuMuc',arg);
}
ipcRenderer.on('XacNhanXoa',function(event,arg){

})
//xu li khi file xoa thanh cong hoac khong thanh cong
ipcRenderer.on('XacNhanXoa',function(event,arg){
  if(arg==0){
    alert('Xóa không thành công!');
  }
  else {
    //tìm kiếm thẻ li có tag như vậy
    document.querySelectorAll('li').forEach(i=>{
      if(i.getAttribute('tag') == arg)
      {
        jquery(i).remove();
        return;
      }
    })
    
  }
})

////// END XU LI XOA FILE //////////////

//////////////// Xử lí nhận type ///////////////////////////
ipcRenderer.on('CheckType',function(event,arg){
  if(arg!= null && arg != undefined){
    //thay đổi data-path
    console.log(document.getElementById('#Lythuyet'))
    document.getElementById('Lythuyet').setAttribute('data-path',arg);
    document.getElementById('Video').setAttribute('data-path',arg);
    document.getElementById('Mohinh').setAttribute('data-path',arg);
    document.getElementById('Baigiang').setAttribute('data-path',arg);
    Loaiphao = 'Pháo 85 - ';
    switch (arg) {
      case '1':
        Loaiphao = 'Pháo 85mm - ';
        break;
        case '2':
        Loaiphao = 'Pháo 152mm - ';
        break;
        case '3':
        Loaiphao = 'Cối 100mm - ';
        break;
        case '4':
        Loaiphao = 'Súng SPG9 - ';
        break;
        case '5':
        Loaiphao = 'Súng lựu 105 - ';
        break;
        case '6':
        Loaiphao = 'Pháo 130mm - ';
        break;
        case '7':
        Loaiphao = 'Xe chiến đấu BM21 - ';
        break;
        case '8':
        Loaiphao = 'Đạn , ngòi - ';
        break;
        case '9':
        Loaiphao = 'Pháo 122mm - ';
        break;
      default:
        Loaiphao = 'Pháo ko '
        break;
    }
  }
})

/////////////// hàm đổi tên một thư mục hoặc một file //////////////////////
/// sự kiện khi nhấn vào đổi tên một node

var ClickBtnDoiTen = function(){
  if(document.getElementById('inputchangename') != null) return;

  if(ElementClick!= null && ElementClick != undefined && ElementClick.getAttribute('tag') != null && ElementClick.getAttribute('tag') !=''){
    //nếu elent là thẻ a hoặc thẻ i
    var inchange;
    if(ElementClick.tagName =='A'){
      //lấy text của nó
      console.log(ElementClick.textContent)
      inchange = ElementClick;
    }
    else if(ElementClick.tagName == 'I')
    {
      inchange = ElementClick.parentNode;
    }
    var text = inchange.textContent;
    jquery(inchange).append('<input type="text" tag="'+ElementClick.getAttribute('tag')+'" id="inputchangename" value="' + text +'">');
    document.getElementById("inputchangename").focus();
    jquery('#inputchangename').on('change',function(){
      var arg1 = jquery('#inputchangename').attr('tag');

      var arg2 = path.dirname(arg1) + '\\'+ jquery('#inputchangename').val()  + path.parse(arg1).ext;
      console.log( "arg1 " + arg1)
      console.log("arg2 "+arg2)
      XacNhanDoiTen(arg1,arg2);
    })
  }
}

var XacNhanDoiTen = function(arg1,arg2){
  ipcRenderer.send('XacNhanDoiTen',arg1,arg2);
}

ipcRenderer.on('KetQuaDoiTen',function(event,arg){
  if(arg==1){
    //doi ten thanh cong
    alert('Đổi tên thành công');
    if(jquery('#texttitle').text() == 'Lý thuyết'){
      document.getElementById('Lythuyet').click();

    }
    else if(jquery('#texttitle').text() == 'Video'){
      document.getElementById('Video').click();

    }
    else if(jquery('#texttitle').text() == 'Mô hình'){
    document.getElementById('Mohinh').click();
      
    }
    else if(jquery('#texttitle').text() == 'Bài giảng'){
    document.getElementById('Baigiang').click();
      
    }
  }

  else{
    alert('Đổi tên không thành công');
    if(jquery('#texttitle').text() == 'Lý thuyết'){
      document.getElementById('Lythuyet').click();

    }
    else if(jquery('#texttitle').text() == 'Video'){
      document.getElementById('Video').click();

    }
    else if(jquery('#texttitle').text() == 'Mô hình'){
    document.getElementById('Mohinh').click();
      
    }
    else if(jquery('#texttitle').text() == 'Bài giảng'){
    document.getElementById('Baigiang').click();
      
    }
  }
})






/////////////// hàm đổi tên một thư mục hoặc một file //////////////////////

