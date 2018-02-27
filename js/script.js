var micro;
var files;
var dragging = 'none';

$( document ).ready(function(){
  console.log("JS Init");

  // Create new Micro object
  micro = new Micro($('#micro_workspace'));

  // Set resize handle
  // $(window).resize(function(){
  //   micro.updateSize();
  // });

  // Resize Handle - Left and Right Panes
  $('#main_dragBarVertical').mousedown(function(e){
    e.preventDefault();
    dragging = 'vertical';
    $(document).unbind('mousemove');
    $(document).mousemove(function(e){
      // ghostbar.css("left",e.pageX+2);
      var percentage = (e.pageX / window.innerWidth) * 100;
      if (percentage > 100)
        percentage = 100;
      else if (percentage < 0)
        percentage = 0
      var mainPercentage = 100-percentage;
      $('#micro_leftBar').css("width",percentage + "%");
      $('#micro_rightBar').css("width",mainPercentage + "%");
    });
  });

  // Resize Handle - Right top and bottom Panes
  $('#main_dragBarHorizontal').mousedown(function(e){
    e.preventDefault();
    dragging = 'horizontal';
    $(document).unbind('mousemove');
    $(document).mousemove(function(e){
      console.log(e);
      // ghostbar.css("left",e.pageX+2);
      let top = $('#micro_rightBar')[0].offsetTop;
      var percentage = (e.pageY - top) / ($('#micro_rightBar')[0].offsetHeight + top) * 100;

      if (percentage > 100)
        percentage = 100;
      else if (percentage < 0)
        percentage = 0
      var mainPercentage = 100-percentage;
      $('#micro_rightTop').css("height",percentage + "%");
      $('#micro_rightBottom').css("height",mainPercentage + "%");
      console.log(percentage);
    });
  });

  // Draging mouse up - resize handles
  $(document).mouseup(function(e){
    if (dragging === 'vertical') {
      $(document).unbind('mousemove');
      var percentage = (e.pageX / window.innerWidth) * 100;
      if (percentage > 100)
        percentage = 100;
      else if (percentage < 0)
        percentage = 0
      var mainPercentage = 100-percentage;
      $('#micro_leftBar').css("width",percentage + "%");
      $('#micro_rightBar').css("width",mainPercentage + "%");
      dragging = 'none';
    } else if (dragging === 'horizontal') {
      $(document).unbind('mousemove');
      let top = $('#micro_rightBar')[0].offsetTop;
      var percentage = (e.pageY - top) / ($('#micro_rightBar')[0].offsetHeight + top) * 100;
      
      if (percentage > 100)
        percentage = 100;
      else if (percentage < 0)
        percentage = 0
      var mainPercentage = 100-percentage;
      $('#micro_rightTop').css("height",percentage + "%");
      $('#micro_rightBottom').css("height",mainPercentage + "%");
      dragging = 'none';
    }
  });

  // Populate some file IO simulation functions
  micro.setGetFileTree(function(){
    files = [];
    files.push({path:"file1.txt", type:"file", size:1024});
    files.push({path:"file2.txt", type:"file", size:1024});
    files.push({path:"file3.txt", type:"file", size:1024});
    files.push({path:"file4.txt", type:"file", size:1024});
    files.push({path:"dir1/file5.txt", type:"file", size:1024});
    files.push({path:"dir1/file6.txt", type:"file", size:1024});
    files.push({path:"dir2/dir3/file7.txt", type:"file", size:1024});
    files.push({path:"dir2/file8.txt", type:"file", size:1024});
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
