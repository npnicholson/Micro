
/* Micro Framework
 * Returns a new micro object, ready to be assigned to a div and configured
 */

// System variables
var dragging = 'none';
var micro_count = 0;
var numTabs = 0;

function Micro(workspace_div){
  if(micro_count > 0){
    console.error("To many Micro's have been created: 1 Max");
    return;
  }

  numTabs = 0;

  var addTab = function(name, id, path) {

    // Set all current tabs to inactive
    $('#micro_editorTabBar .active').removeClass('active');

    console.log("Entered ID: " + id);
    // See if a tab with the given ID already exists.
    if ($('#micro_editorTabBar *[data_id="'+id+'"]').length !== 0) {

      // If it does exist, set it to active instead of making a new one
      let tab = $('#micro_editorTabBar *[data_id="'+id+'"]');
      tab.addClass('active');
      //TODO Activate an editor as well
    } else {
      // If the tab does not already exist, make one.
      // Add the new tab to the start. Go ahead and set it to active
      let iconClass = getIconType(path);
      let tab = $("<li class='active' data_id=" + id + "><div class='header "+iconClass+"'><span class='tab_name'>"
        + name + "</span></div><div class='tab_close'></div></li>");
      let tab_close = tab.children('.tab_close');

      // Add the created tab to the list
      $('#micro_editorTabBar').prepend(tab);

      // Set up the tab's callback functions
      tab.mouseup(function() {
        $('#micro_editorTabBar .active').removeClass('active');
        tab.addClass('active');
        //TODO Activate the correct editor as well
      });
      tab_close.mouseup(function() {
        removeTab(id);
      });

      // Add to the number of tabs
      numTabs++;
      //TODO Create an editor as well
    }
  }

  var removeTab = function(id) {
    // Get the tab with the associated ID
    let tab = $('#micro_editorTabBar *[data_id="'+id+'"]');
    let tab_close = tab.children('.tab_close');

    // If there is no tab with that ID, it doesnt need to be removed
    if (tab.length === 0) {
      return;
    } else {
      // Remove all of the tab's callback functions
      tab.unbind('mouseup');
      tab_close.unbind('mouseup');

      // Remove the tab itself
      tab.remove();

      //TODO Remove the editor as well
      numTabs--;
      // If there is no longer an active tab, set a new one to be active
      if (numTabs > 0 && $('#micro_editorTabBar .active').length == 0) {
        $('#micro_editorTabBar').children(':first').addClass('active');
        //TODO Activate an editor as well
      }
    }
  }

  // addTab('N=Best', "ID1", "test.txt");
  // addTab('K=Worstfdsfsagafa', "ID3", "test.txt");
  // addTab('Testing', "ID2", "test.txt");

  this.workspace = workspace_div;

  // Get system information
  this.system = getSystemInformation();

  /**************** Personal Functions ****************/

  /* UpdateSize
   * Call to update the window size.
   */
  this.updateSize = function(){
    console.log("Window size change");
  }

  /* SetGetFileTree - Public
   * Sets the function that will be called when Micro needs a file tree.
   * Expected to return a nested Object Tree. Use '/' as file sep.
   * :: function()
   * TODO: Make this defination more explicate.
   */
  this.setGetFileTree = function(handle){
    this.getFileTree = handle;
    // Refresh the files after a handle has been set
    this.updateFileTreeSidebar();
  }

  /* SetLoadFile - Public
   * Sets the function that will be called when Micro needs a file.
   * Expected to return an Object.
   * :: function(fileName)
   * TODO: Make this defination more explicate.
   */
  this.setLoadFile = function(handle){
    this.loadFile = handle;
  }

  /* SetSaveFile  - Public
   * Sets the function that will be called when Micro needs a file tree.
   * Expected to return a nested JSON.
   * TODO: Make this defination more explicate.
   */
  this.setSaveFile = function(handle){
    this.saveFile = handle;
  }

  /* ReportError  - Public
   * Reports an error to Micro to be displayed to the user
   * TODO: Make this actually do something.
   */
  this.reportError = function(error){
    console.error(error);
  }

  /* OpenFile  - Public
   * Opens a file in the editor. Accepts a file path.
   */
  var openFile = function(filename){
    let fileArr = filename.split('/');
    let name = fileArr[fileArr.length-1];
    addTab(name, encodeURIComponent(filename), filename);
    console.log("OpenFile: " + filename);
  }

  this.openFile = openFile;

  /* UpdateFileTreeSidebar  - Private
   * Updates the sidebar to include the current files and directories
   */
  this.updateFileTreeSidebar = function(){
    // Get the tree from the wrapper
    var tree = this.getFileTree();

    // Init the resulting file tree
    this.file_tree = {};

    // Loop through each file and split the path into an array of dirs and the end file
    tree.forEach(function(element) {
      element.pathArr = element.path.split('/');
    });

    // Init some variables
    let depth = 0;
    let progress = false;

    // Loop through every file until we have reached full depth
    while(progress === false){
      // Assume this is the last depth
      progress = true;
      // Loop through all files
      for(let i = 0; i < tree.length; i++){
        // Init the current file
        let ele = tree[i];
        // If this depth is past the file's depth, skip it (already done)
        if(depth > ele.pathArr.length - 1)
          continue;
        // If not, we have more work to do. Set to loop again.
        progress = false;
        // Get the file name
        let name = ele.pathArr[depth];
        // Calculate the dependant path: "/dir1/dir2" -> /file.txt
        let dependant_path = ele.path.split('/');
        dependant_path.splice(depth,1);
        // Check to see if we are at the concluding file
        if(depth === ele.pathArr.length - 1){
          // Set the main directory as the top level dir
          var cur = this.file_tree;
          // Loop through all dependant directories
          for(let j = 0; j < dependant_path.length; j++){
            // If the directory does not exist, create it as an empty object
            if(cur[dependant_path[j]] === undefined){
              cur[dependant_path[j]] = {};
            }
            // Set the current directory inside the current directory
            cur = cur[dependant_path[j]];
          }
          // Add the file to the directory that holds the file
          cur[name] = ele;
        }
      }
      // Increase the depth
      depth ++;
    }

    // Create the DOM in the side bar //

    // Remove the elements that are there now
    // This line removes the resize handle as well.
    let top_level = $('#micro_leftBarContent');
    top_level.html('');

    // Add the unordered list that will contain the top level files and folders.
    // Temp recursive function that will dig into the file tree and create nested list elements
    var fileDelve = function(current, parent){
      // Init an empty array for layers
      var layers = [];
      // Loop through every object in our current layer of the file tree
      Object.entries(current).forEach(([key, val]) => {
        // Create a list item for the current layer
        let current_layer = $('<li class="micro_file_element"></li>');
        // Create a title header for the current layer and append it
        $('<div class="micro_file_head" data_path="'+val.path+'"><span class="micro_file_head_text">'+key+'</span></div>').appendTo(current_layer);
        // Push the current layer to the layer array, with some added information for ease
        layers.push({html:current_layer, type:val.type, name:key, path:val.path});
        // If the current layer is a directory, create an unordered list and add it
        if(val.type !== "file")
          fileDelve(val, $('<ul></ul>').appendTo(current_layer));
      });
      // Initialize some arrays to hold directories and files
      let dirs = []
      let files = [];
      // Add a children div to hold children elements. Make hiding easier.
      let base = $('<div class="micro_file_children"></div>');
      parent.append(base);
      // Loop through the layer and find all directories and add them to the dir array

      for(let i = 0; i < layers.length; i++)
        if(layers[i].type !== "file")
          dirs.push(layers[i]);
      // Loop through the layer and find all files and add them to the UpdateFileTreeSidebar array
      for(let i = 0; i < layers.length; i++)
        if(layers[i].type === "file")
          files.push(layers[i]);
      // Generate a sort function that will alphabeticaly sort the files and dirs
      let sFunct = function(a,b){
        return a.name.localeCompare(b.name);
      }

      // Sort the files and dirs
      files.sort(sFunct);
      dirs.sort(sFunct);
      // Loop through all directories and add them to the DOM
      for(let i = 0; i < dirs.length; i++){
        // Add the directory class and folder icon. TODO: Link the icon to the helper function somehow
        dirs[i].html.addClass('octicon file_handle')
        dirs[i].html.children('.micro_file_head').addClass('octicon octicon-file-directory');
        base.append(dirs[i].html);
      }
      // Loop through all files and add them to the DOM
      for(let i = 0; i < files.length; i++){
        files[i].html.children('.micro_file_head').addClass(getIconType(files[i].path));
        base.append(files[i].html);
      }
    }
    // Enter the recursive function and add all files to the DOM
    fileDelve(this.file_tree, $('<ul class="micro_file_tree"></ul>').appendTo(top_level));
  }

  /****************** initialization ******************/

  // ********** Resize Handle System ********** //
  // Resize Handle - Left and Right Panes
  $('#micro_dragBarVertical').mousedown(function(e){
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


      // Limit further scaling after one of the edges has reached its min value
      // (note the left bar has to factor in the width of the resize handle)
      let minWidthLeft = parseFloat($('#micro_leftBar').css('min-width')) + parseFloat($('#micro_dragBarVertical').css('width'));
      let minWidthRight = parseFloat($('#micro_rightBar').css('min-width')) + parseFloat($('#micro_dragBarVertical').css('width'));

      if (percentage / 100 * window.innerWidth < minWidthLeft) {
        percentage = minWidthLeft / window.innerWidth * 100;
        var mainPercentage = 100-percentage;
      } else if (mainPercentage / 100 * window.innerWidth < minWidthRight) {
        mainPercentage = minWidthRight / window.innerWidth * 100;
        var percentage = 100-mainPercentage;
      }


      $('#micro_leftBar').css("width",percentage + "%");
      $('#micro_rightBar').css("width",mainPercentage + "%");
    });
  });

  // Resize Handle - Right top and bottom Panes
  $('#micro_dragBarHorizontal').mousedown(function(e){
    e.preventDefault();
    dragging = 'horizontal';
    $(document).unbind('mousemove');
    $(document).mousemove(function(e){
      // ghostbar.css("left",e.pageX+2);
      let top = $('#micro_rightBar')[0].offsetTop;
      var percentage = (e.pageY - top) / ($('#micro_rightBar')[0].offsetHeight + top) * 100;

      // Ensure we didnt drag way too far
      if (percentage > 100)
      percentage = 100;
      else if (percentage < 0)
      percentage = 0
      var mainPercentage = 100-percentage;

      // Stop the bottom from growing to 100% (and sticking out the bottom)
      // when the top has hit its minimum size
      let minHeightTop = parseFloat($('#micro_rightTop').css('min-height')) // undefined only when called from micro.js
      let minHeightBottom = parseFloat($('#micro_rightBottom').css('min-height')) + parseFloat($('#micro_dragBarHorizontal').css('height'));
      let clientHeight = $('#micro_rightBar')[0].clientHeight;
      if (percentage/100 * clientHeight < minHeightTop) {
        percentage = minHeightTop / clientHeight*100;
        var mainPercentage = 100-percentage;
      } else if (mainPercentage/100 * clientHeight < minHeightBottom) {
        mainPercentage = minHeightBottom / clientHeight*100;
        var percentage = 100-mainPercentage;
      }

      // Calculate the compliment percentage
      var mainPercentage = 100-percentage;

      $('#micro_rightTop').css("height",percentage + "%");
      $('#micro_rightBottom').css("height",mainPercentage + "%");
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

      // Limit further scaling after one of the edges has reached its min value
      // (note the left bar has to factor in the width of the resize handle)
      let minWidthLeft = parseFloat($('#micro_leftBar').css('min-width')) + parseFloat($('#micro_dragBarVertical').css('width'));
      let minWidthRight = parseFloat($('#micro_rightBar').css('min-width')) + parseFloat($('#micro_dragBarVertical').css('width'));

      if (percentage / 100 * window.innerWidth < minWidthLeft) {
        percentage = minWidthLeft / window.innerWidth * 100;
        var mainPercentage = 100-percentage;
      } else if (mainPercentage / 100 * window.innerWidth < minWidthRight) {
        mainPercentage = minWidthRight / window.innerWidth * 100;
        var percentage = 100-mainPercentage;
      }

      $('#micro_leftBar').css("width",percentage + "%");
      $('#micro_rightBar').css("width",mainPercentage + "%");
      dragging = 'none';
    } else if (dragging === 'horizontal') {
      $(document).unbind('mousemove');
      let top = $('#micro_rightBar')[0].offsetTop;
      // Ensure we didnt drag way too far
      if (percentage > 100)
      percentage = 100;
      else if (percentage < 0)
      percentage = 0

      // Stop the bottom from growing to 100% (and sticking out the bottom)
      // when the top has hit its minimum size
      let minHeightTop = parseFloat($('#micro_rightTop').css('min-height')) // undefined only when called from micro.js
      let minHeightBottom = parseFloat($('#micro_rightBottom').css('min-height')) + parseFloat($('#micro_dragBarHorizontal').css('height'));
      let clientHeight = $('#micro_rightBar')[0].clientHeight;
      if (percentage/100 * clientHeight < minHeightTop) {
        percentage = minHeightTop / clientHeight*100;
        var mainPercentage = 100-percentage;
      } else if (mainPercentage/100 * clientHeight < minHeightBottom) {
        mainPercentage = minHeightBottom / clientHeight*100;
        var percentage = 100-mainPercentage;
      }

      // Calculate the compliment percentage
      var mainPercentage = 100-percentage;
      $('#micro_rightTop').css("height",percentage + "%");
      $('#micro_rightBottom').css("height",mainPercentage + "%");
      dragging = 'none';
    }
  });
  // ********** Resize Handle System End ********** //

  micro_count ++;
  return this;
}
