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

  micro.conn;
  micro.setInitFileSystem(socketInit);

  // Populate some file IO simulation functions
  micro.setGetFileTree(socketGetFileTree);

  micro.setLoadFile(function(req_name, callback){
    let f = makefile(req_name);
    callback({name:req_name, data:f, type:"file", size:f.length});
  });

  micro.setSaveFile(function(file, callback){
    console.log("File Save");
    console.log(file);
    callback(true);
  })




});

// Temp function to make random files
function makefile(name) {
  var text = name + ":\n\n";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789     \n";

  let stop = Math.floor(Math.random() * 1001)+500;

  for (var i = 0; i < stop; i++)
  text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
