// ========================================================== //
// keys.js :: Micro
//
// TODO: Add fule description here
// ========================================================== //

const KEY_TYPE = {EDITOR:0, TREE:1};

var configureKeyBindings = function(key_type, target){
  switch(key_type){
    case KEY_TYPE.EDITOR:
      Mousetrap.bind('meta+s', function() {
        console.log('File Save');
        return false;
      });
      break;
    case KEY_TYPE.TREE:
      Mousetrap.bind('meta+s', function() {
        console.log('File Save on Tree');
        return false;
      });
      break;
    default:
      break;
  }
}
