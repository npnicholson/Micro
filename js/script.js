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



  micro.setInitFileSystem(socketGetFileTree, socketInit);
  micro.setLoadFile(socketLoadFile);
  micro.setSaveFile(socketSaveFile);
  micro.setDeleteFile(socketDeleteFile);
  /* micro.refreshFileTree
   * Call when a file or direcory change is detected. Expects:
   * {path, filename, data, size}
   */




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
