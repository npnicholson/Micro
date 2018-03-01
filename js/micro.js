
/* Micro Framework
 * Returns a new micro object, ready to be assigned to a div and configured
 */

 var h;

// System variables
var dragging = 'none';
var micro_count = 0;
var numTabs = 0;

// var divider = $('<li class="divider"><div></div></li>');

function Micro(workspace_div){
  if(micro_count > 0){
    console.error("To many Micro's have been created: 1 Max");
    return;
  }

  numTabs = 0;


  var updateTab(id, file) {
    let editor = $('#micro_editorContent *[data_id="'+id+'"]');
    editor.text(file.data);
  }

  var activateTab = function(id) {
    $('#micro_editorTabBar .active').removeClass('active');
    $('#micro_editorContent .active').removeClass('active');
    let tab = $('#micro_editorTabBar *[data_id="'+id+'"]');
    let editor = $('#micro_editorContent *[data_id="'+id+'"]');
    tab.addClass('active');
    editor.addClass('active');
  }

  var divider = $('#micro_editorTabBar .divider');
  var addTab = function(file, id, head) {

    // Get information about the file

    // Set all current tabs to inactive
    $('#micro_editorTabBar .active').removeClass('active');
    $('#micro_editorContent .active').removeClass('active');

    // See if a tab with the given ID already exists.
    if ($('#micro_editorTabBar *[data_id="'+id+'"]').length !== 0) {

      // If it does exist, set it to active instead of making a new one
      let tab = $('#micro_editorTabBar *[data_id="'+id+'"]');
      let editor = $('#micro_editorContent *[data_id="'+id+'"]');

      tab.addClass('active');
      editor.addClass('active');

    } else {
      // If the tab does not already exist, make one.
      // Add the new tab to the start. Go ahead and set it to active
      let iconClass = getIconType(file.name);
      let tab = $("<li class='active' draggable='true' data_id='"+id+"'><div class='header "+iconClass+"'><span class='tab_name'>"
        + file.name + "</span></div><div class='tab_close'></div></li>");
      let tab_close = tab.children('.tab_close');

      // Build the editor
      let editor = $("<div class='active' data_id='"+id+"'>" + file.data + "</div>");

      // Add the created tab to the list
      $('#micro_editorTabBar').prepend(tab);

      // Add the created editor
      $('#micro_editorContent').prepend(editor);

      // Set the tab's press callback (activates this tab)
      tab.mouseup(function() {

        // Disable the transition for the close tab.
        tab_close.addClass('notransition');

        // Set all tabs and editors to inactive, then set this one to active
        $('#micro_editorTabBar .active').removeClass('active');
        $('#micro_editorContent .active').removeClass('active');
        tab.addClass('active');
        editor.addClass('active');

        // Re-enable the transition. OffsetHeight used to flush the CSS changes
        tab_close[0].offsetHeight;
        tab_close.removeClass('notransition');

        // Tell the sidebar what we clicked
        setHighlight(head);
        removeBrightHighlight();
      });

      tab[0].addEventListener('dragstart', function(e) {
        this.style.opacity = '0.4';
      }, false);

      tab[0].addEventListener('dragover', function(e) {
        if (e.preventDefault){
          e.preventDefault(); // Necessary. Allows us to drop.
        }
        e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

        if ((e.pageX - $(this).offset().left)/$(this).width() >= 0.5) {
          // Right side
          this.classList.remove('over-left');
          this.classList.add('over-right');
          divider.insertAfter(this);
          divider.removeClass('hidden');

        } else {
          // left side
          this.classList.remove('over-right');
          this.classList.add('over-left');
          divider.insertBefore(this);
          divider.removeClass('hidden');
        }
        return false;
      }, false);

      tab[0].addEventListener('dragleave', function(e) {
        this.classList.remove('over-right');
        this.classList.remove('over-left');
      }, false);

      tab[0].addEventListener('dragend', function(e){
        this.style.opacity = '1';
        let tOver = $('#micro_editorTabBar').find('.over-right,.over-left');
        if (tOver.length !== 0) {
          if ((e.pageX - tOver.offset().left)/tOver.width() >= 0.5) {
            // Right side
            $(this).insertAfter(tOver);
            console.log("insert After");
          } else {
            // left side
            $(this).insertBefore(tOver);
            console.log("insert Before");
          }
          $('#micro_editorTabBar .over-right').removeClass('over-right');
          $('#micro_editorTabBar .over-left').removeClass('over-left');
        }
        divider.addClass('hidden');
        activateTab(id);
      }, false);

      // Set the tab's close callback (press on the remove button)
      tab_close.mouseup(function() {
        if (dragging === 'none')
          removeTab(id);
      });

      // Add to the number of tabs
      numTabs++;
    }

    // Since there will now be at least one tab, activate the right bar
    $(micro_editorTabBarEnd).removeClass('hidden');
  }

  var removeTab = function(id) {
    // Get the tab with the associated ID
    let tab = $('#micro_editorTabBar *[data_id="'+id+'"]');
    let editor = $('#micro_editorContent *[data_id="'+id+'"]');
    let tab_close = tab.children('.tab_close');

    // If there is no tab with that ID, it doesnt need to be removed
    if (tab.length === 0) {
      return;
    } else {
      // Remove all of the tab's callback functions
      tab.unbind();
      tab_close.unbind();

      // Remove the tab and editor
      tab.remove();
      editor.remove();

      numTabs--;
      // If there is no longer an active tab, set a new one to be active
      if (numTabs > 0 && $('#micro_editorTabBar .active').length == 0) {
        $('#micro_editorTabBar').children(':first').addClass('active');
        $('#micro_editorContent').children(':first').addClass('active');
      }

      if (numTabs === 0) {
        // If there are no more tabs, hide the tab right bar
        $(micro_editorTabBarEnd).addClass('hidden');
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
    $('#micro_file_scroll_holder').css('height',$('#micro_leftBarContent').height()-30);
  }

  /* SetInitFileSystem - Public
   * Initializes the file system
   * :: function()
   * TODO: Make this defination more explicate.
   */
  var initFileSystem;
  var getFileTree;
  this.setInitFileSystem = function(handle_filetree, handle_success){
    this.initFileSystem = handle_success;
    initFileSystem = handle_success;
    this.getFileTree = handle_filetree;
    getFileTree = handle_filetree;
    this.refreshFileTree();
  }

  /* RefreshFileTree - Public
   * Call to force a tile tree refresh request
   * TODO: Make this defination more explicate.
   */
  this.refreshFileTree = function(msg){
    let callback = function(msg){
      console.log("File System Init Complete.");
      // Refresh the files after a handle has been set
      getFileTree(updateFileTreeSidebar);
    }
    initFileSystem(callback);
    // TODO: Process this file change
  }


  /* SetLoadFile - Public
   * Sets the function that will be called when Micro needs a file.
   * Expected to return an Object.
   * :: function(fileName)
   * TODO: Make this defination more explicate.
   */
  var loadFile;
  this.setLoadFile = function(handle){
    loadFile = handle;
  }

  /* SetSaveFile - Public
   * Sets the function that will be called when Micro needs to save a file.
   * Expected to return an Object.
   * :: function(fileName, fileData, callback)
   * TODO: Make this defination more explicate.
   */
  var saveFile;
  this.setSaveFile = function(handle){
    saveFile = handle;
    this.saveFile = handle;
  }
  // Example:
  // funct = function(){micro.saveFile('file10.txt','save \'data\' here', function(e){console.log(e);})}
  // setTimeout(funct,2000);

  /* SetDeleteFile - Public
   * Sets the function that will be called when Micro needs to delete a file.
   * Expected to return an Object.
   * :: function(fileName, callback)
   * TODO: Make this defination more explicate.
   */
  var deleteFile;
  this.setDeleteFile = function(handle){
    deleteFile = handle;
    this.deleteFile = handle;
  }
  // Example:
  // funct = function(){micro.deleteFile('file10.txt', function(e){console.log(e);})}
  // setTimeout(funct,2000);

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
  var openFile = function(filepath, head){

    // Check if we already have a Tab at the filepath
    if ($('#micro_editorTabBar *[data_id="'+filepath+'"]').length !== 0) {
      $('#micro_editorTabBar .active').removeClass('active');
      $('#micro_editorContent .active').removeClass('active');

      // If it does exist, set it to active instead of making a new one
      let tab = $('#micro_editorTabBar *[data_id="'+filepath+'"]');
      let editor = $('#micro_editorContent *[data_id="'+filepath+'"]');
      tab.addClass('active');
      editor.addClass('active');
    } else {
      let callback = function(data){
        addTab(data, filepath, head);
      }
      loadFile(filepath, callback);
    }
  }

  this.openFile = openFile;

  /* UpdateFileTreeSidebar  - Private
   * Updates the sidebar to include the current files and directories
   */
  var updateFileTreeSidebar = function(tree){
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


    let top_level = $('#micro_leftBarContent');
    // Remove the elements that are there now
    // This line removes the resize handle as well.
    top_level.html('');
    // Create a container for the file tree to go to
    let container = $('<div id="micro_file_scroll_holder"></div>');
    // Adjust size to fit scroll window
    $('#micro_file_scroll_holder').css('height',$('#micro_leftBarContent').height()-30);
    // Add the container to the holder
    container.appendTo(top_level);

    // Index for refering to divs after they are placed
    var indexCounter = 0;

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
        let text = $('<span class="micro_file_head_text">'+key+'<span>');
        let icon_holder = $('<div class="micro_file_head_title"></div>');
        let head = $('<div class="micro_file_head" data_path="'+val.path+'" data_index="'+indexCounter+'"></div>');
        icon_holder.append(text);
        head.append(icon_holder)
        current_layer.append(head);
        // Add to the index counter
        indexCounter++;
        // Push the current layer to the layer array, with some added information for ease
        layers.push({html:current_layer, type:val.type, name:key, path:val.path});
        // If the current layer is a directory, create an unordered list and add it
        if(val.type !== "file")
          fileDelve(val, $('<ul class="element_holder"></ul>').appendTo(current_layer));
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
        // Get the head and save it for easy use
        let head = dirs[i].html.children('.micro_file_head');
        // Get the holder and save it for easy use
        let holder = dirs[i].html;
        // Add the directory class and folder icon. TODO: Link the icon to the helper function somehow
        head.children('.micro_file_head_title').addClass('octicon octicon-file-directory');
        // Generate file handle span
        let handle = $('<span class="file_handle"></span>');
        head.children('.micro_file_head_title').append(handle);
        // Create the mousedown callback for this menu item
        let isOpen = true;
        dirs[i].html.children('.micro_file_head').mousedown(function(){
          // Switch based on if the directory is open
          if(isOpen){
            // Set the file handle to closed
            handle.addClass('file_handle_closed');
            // Hide the elemets in this folder
            holder.children('ul:first.element_holder').css('display','none');
          }else{
            // Set the file handle to open
            handle.removeClass('file_handle_closed');
            // Restore the elemets in this folder
            holder.children('ul:first.element_holder').css('display','block');
          }
          // Toggle the open variable
          isOpen = !isOpen;
          // Set this element as selected
          setHighlight(head);
        });
        // Add this element to the base DOM
        base.append(dirs[i].html);
      }
      // Loop through all files and add them to the DOM
      for(let i = 0; i < files.length; i++){
        // Get the head and save it for easy use
        let head = files[i].html.children('.micro_file_head');
        // Add the icon to the title div
        head.children('.micro_file_head_title').addClass(getIconType(files[i].path));
        // Create the mousedown callback for this menu item
        files[i].html.children('.micro_file_head').mousedown(function(){
          openFile(files[i].path, head);
          setHighlight(head);
        });
        // Add this element to the base DOM
        base.append(files[i].html);
      }
    }
    // Enter the recursive function and add all files to the DOM
    fileDelve(this.file_tree, $('<ul class="micro_file_tree"></ul>').appendTo(container));
    top_level.prepend('<div id="project_title">Project</div>');
  }

  // Sets the element passed in as highlighted
  var setHighlight = function(element){
    //let index = calculateFileOrder(path);
    // TODO: Use filename to look up element
    $('.micro_file_head').removeClass('selected bright')
    element.addClass('selected bright');
  }

  // Reduces any file tree highlights to dull
  var removeBrightHighlight = function(){
    $('.selected.bright').removeClass('bright');
  }

  // Increases any file tree highlights to bright
  var addBrightHighlight = function(){
    $('.selected').addClass('bright');
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
    $(document).unbind('mousemove');
    if (dragging === 'vertical') {
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
    } else if(dragging === 'tab'){
      console.log("Finished dragging a tab");
    }
  });
  // ********** Resize Handle System End ********** //

  micro_count ++;
  return this;
}
