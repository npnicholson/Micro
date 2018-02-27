/* Micro Framework
 * Returns a new micro object, ready to be assigned to a div and configured
 */
function Micro(workspace_div){

  this.workspace = workspace_div;

  /* UpdateSize
   * Call to update the window size.
   */
  this.updateSize = function(){
    console.log("Window size change");
  }

  return this;
}
