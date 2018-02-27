var micro;

$( document ).ready(function(){
  console.log("JS Init");

  // Create new Micro object
  micro = new Micro($('#micro_workspace'));

  // Set resize handle
  $(window).resize(function(){
    micro.updateSize();
  });


});
