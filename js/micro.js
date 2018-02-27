var micro_count = 0;

/* Micro Framework
 * Returns a new micro object, ready to be assigned to a div and configured
 */
function Micro(workspace_div){
  if(micro_count > 0){
    console.error("To many Micro's have been created: 1 Max");
    return;
  }

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

  /* SetGetFile - Public
   * Sets the function that will be called when Micro needs a file.
   * Expected to return an Object.
   * :: function(fileName)
   * TODO: Make this defination more explicate.
   */
  this.setGetFile = function(handle){
    this.getFile = handle;
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

    // Create the DOM in the side bar

    // Remove the elements that are there now
    // This line removes the resize handle as well.
    $('#micro_leftBar').html('');

    // Add the unordered list that will contain the top level files and folders.
    let top_level = $('#micro_leftBar');
    // Temp recursive function that will dig into the file tree and create nested list elements
    //TODO: Add sorting so dirs are at the top
    var fileDelve = function(current, parent){
      Object.entries(current).forEach(([key, val]) => {
        let current_layer = $("<li>"+key+"</li>").appendTo(parent);
        if(val.type !== "file"){
          fileDelve(val, $("<ul></ul>").appendTo(current_layer));
        }
      });
    }
    fileDelve(this.file_tree, $("<ul></ul>").appendTo(top_level));
  }

  /****************** initialization ******************/


  micro_count ++;
  return this;
}
