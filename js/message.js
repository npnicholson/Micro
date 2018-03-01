var socket_pass = getParameterByName('key');
var socket_connected = false;
var socket_refreshFileTree;
function socketInit(callback){
  if(socket_connected){
    callback();
  }else{
    micro.conn = new WebSocket(getParameterByName('socket'));
    micro.conn.onmessage = function(e){
      processMessage(e);
    }
    micro.conn.onopen = function(e){
      callback();
      socket_connected = true;
    }
    //micro.conn.onclose = micro.initFileSystem(callback);
    micro.conn.onclose = function(e){
      socket_connected = false;
      setTimeout(function(){socketInit(callback)},500);
    }
    micro.conn.onerror = function(e){
      console.error(e);
    }

    socket_refreshFileTree = micro.refreshFileTree;
  }
}

/* SocketGetFileTree
 * Gets the file tree from the socket server. Requires a callback function to
 * run when the transfer is complete. The callback will be passed a file list.
 * :: function(callback)
 */
function socketGetFileTree(callback){
  let process = function(msg){
    files = [];
    for(let i = 0; i < msg.data.length; i++){
      files.push({path:msg.data[i], type:"file", size:1024});
    }
    callback(files);
  }
  let id = makeid();
  addCallback(process, id);
  socketSend(['ls'], id);
}

/* SocketLoadFile
 * Loads a file from the socket server. Requires a callback function to run when
 * the transfer is complete, and a file name. The callback will be passed a the
 * resulting file as well as some meta data.
 * :: function(callback)
 */
function socketLoadFile(file, callback){
  let process = function(msg){
    let html_file = msg.data.data.replace(/(?:\r\n|\r|\n)/g, '<br />');
    callback({name:msg.data.name, data:html_file, type:msg.data.type, size:msg.data.length});
  }
  let id = makeid();
  addCallback(process, id);
  socketSend(['load',file.escapeSpecialChars()], id);
}

function socketSaveFile(filename, filedata, callback){
  let process = function(msg){
    callback(msg);
  }
  let id = makeid();
  addCallback(process, id);
  socketSend(['save', 'replace', filename, filedata.escapeSpecialChars()] ,id);
}

function socketDeleteFile(filename, callback){
  let process = function(msg){
    callback(msg);
  }
  let id = makeid();
  addCallback(process, id);
  socketSend(['delete', filename], id);
}

var socket_key;
var socket_callback_queue = {};

function addCallback(callback, id){
  socket_callback_queue[id] = callback;
}

function getCallback(id){
  let c = socket_callback_queue[id];
  delete socket_callback_queue[id];
  return c;
}

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
      switch(callback){
        case "file_tree_refresh":
          let arr = msg.data[0].split('/');
          socket_refreshFileTree({
            path: msg.data[0],
            filename: arr[arr.length-1],
            data: msg.data[1],
            size: (msg.data[1]!==undefined?msg.data[1].length:0)
          });
          break;
        default:
          getCallback(callback)(msg);
          break;
      }
    }
  }else if(msg.code === 6){
    socket_key = msg.data[0];
  }else{
    switch(msg.code){
      case 0:
        console.error('Refused connection: ' + msg.msg);
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
        console.error('Error: ' + msg.msg);
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

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  for (var i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

String.prototype.escapeSpecialChars = function() {
    return this.replace(/\\n/g, "\\n")
               .replace(/\\'/g, "\\'")
               .replace(/\\"/g, '\\"')
               .replace(/\\&/g, "\\&")
               .replace(/\\r/g, "\\r")
               .replace(/\\t/g, "\\t")
               .replace(/\\b/g, "\\b")
               .replace(/\\f/g, "\\f");
};
