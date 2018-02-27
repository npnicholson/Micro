/* Micro Framework
 * Returns a new micro object, ready to be assigned to a div and configured
 */
function Micro(workspace_div){

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
   * Expected to return a nested Object Tree.
   * :: function()
   * TODO: Make this defination more explicate.
   */
  this.setGetFileTree = function(handle){
    this.getFileTree = handle;
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
  this.updateFileTreeSidebar(){
    
  }

  /****************** initialization ******************/



  return this;
}

/* GetSystemInformation
 * Return an object with relivant system information
 */
function getSystemInformation(){
  let output = {};
  output.userAgent = navigator.userAgent;
  let os = navigator.platform;
  switch(os){
    case "Mac68K":
    case "MacPPC":
    case "MacIntel":
    case "Macintosh":
      output.os = "MAC";
      break;
    case "Linux":
    case "Linux aarch64":
    case "Linux armv5tejl":
    case "Linux armv6l":
    case "Linux armv7l":
    case "Linux i686":
    case "Linux i686 on x86_64":
    case "Linux i686 X11":
    case "Linux MSM8960_v3.2.1.1_N_R069_Rev:18":
    case "Linux ppc64":
    case "Linux x86_64":
    case "Linux x86_64 X11":
      output.os = "LINUX";
      break;
    case "OS/2":
    case "Pocket PC":
    case "Windows":
    case "Win16":
    case "Win32":
    case "WinCE":
      output.os = "WINDOWS";
      break;
  }
  return output;

}
