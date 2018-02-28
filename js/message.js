var socket_pass = getParameterByName('key');
var initCallback;
var socket_connected = false;
function socketInit(callback){
  micro.conn = new WebSocket(getParameterByName('socket'));
  micro.conn.onmessage = function(e){
    processMessage(e);
  }
  micro.conn.onopen = function(e){
    callback();
    socket_connected = true;
  }
  //micro.conn.onclose = micro.initFileSystem(callback);
  micro.conn.onclse = function(e){
    socket_connected = false;
  }
  micro.conn.onerror = function(e){
    console.error(e.data);
  }
  initCallback = callback;
}

/* Get File Tree */
var getFileTreeCallback;
function socketGetFileTree(callback){
  getFileTreeCallback = callback;
  socketSend(['ls'],'processFileTree');
}

function processFileTree(msg){
  files = [];
  for(let i = 0; i < msg.data.length; i++){
    files.push({path:msg.data[i], type:"file", size:1024});
  }
  getFileTreeCallback(files);
}

// TODO: Remove the use of the text callback strings. Go to id instead.

/* Load File */
var loadFileCallback;
function socketLoadFile(file, callback){
  loadFileCallback = callback;
  socketSend(['load',file],'processLoadFile');
}

function processLoadFile(msg){
  // Replace new lines with '<br/>'
  let html_file = msg.data.data.replace(/(?:\r\n|\r|\n)/g, '<br />');
  loadFileCallback({name:msg.data.name, data:html_file, type:msg.data.type, size:msg.data.length});
}

var socket_key;
function processMessage(e){
  let msg = JSON.parse(e.data);
  /* Codes:
   * 0: Refused connection
   * 1: Sucessful process
   * 2: Unknown command
   * 3: Malformed message
   * 4: Invalid key
   * 5: Error
   * 6: Key set
   */
  if(msg.code === 1){
    var callback = msg.callback;
    if(callback !== "0"){
      window[callback](msg);
    }
  }else if(msg.code === 6){
    socket_key = msg.data[0];
  }else{
    switch(msg.code){
      case 0:
        console.error('Refused connection');
        break;
      case 2:
        console.error('Unknown command: ' + msg.cmd);
        break;
      case 3:
        console.error('Malformed message: ');
        console.log(msg);
        break;
      case 4:
        console.error('Invalid key');
        break;
      case 5:
        console.error('Error');
        break;
      default:
        console.error('Unknown return code: ' + msg.code);
        break;
    }
  }

}

function socketSend(rqst, call){
  // If the socket is not connected, send it later
  if(!socket_connected){
    setTimeout(function(){socketSend(rqst,call)}, 500);
  }else{
    let to_send = {
      key: socket_key + '-' + socket_pass,
      request: rqst,
      callback: call
    };
    micro.conn.send(JSON.stringify(to_send));
  }
}
