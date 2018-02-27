var micro;
var files;

$( document ).ready(function(){
  console.log("JS Init");

  // Create new Micro object
  micro = new Micro($('#micro_workspace'));

  // Set resize handle
  $(window).resize(function(){
    micro.updateSize();
  });

  // Populate some file IO simulation functions
  micro.setGetFileTree(function(){
    files = [];
    files.push({name:"file1.txt", type:"file", size:1024});
    files.push({name:"file2.txt", type:"file", size:1024});
    files.push({name:"file3.txt", type:"file", size:1024});
    files.push({name:"file4.txt", type:"file", size:1024});
    files.push({name:"dir1", type:"dir", size:NaN});
    files.push({name:"/dir1/file5.txt", type:"file", size:1024});
    files.push({name:"/dir1/file6.txt", type:"file", size:1024});
    return files;
  });

  micro.setGetFile(function(req_name){
    let f = makefile();
    return {name:req_name, data:f, type:"file", size:f.length}
  });

  micro.setSaveFile(function(file){
    console.log("File Save");
    console.log(file);
  })




});

// Temp function to make random files
function makefile() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789     ";

  let stop = Math.floor(Math.random() * 1001)+500;

  for (var i = 0; i < stop; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
