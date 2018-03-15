// ========================================================== //
// message.js :: Micro Framework Message Handle
//
// TODO: Add fule description here
// ========================================================== //

var socket_user = 'user1';
var socket_pass = 'pass1';
var socket_connected = false;
var socket_refreshFileTree;
var hash = undefined;

function socketInit(callback) {
  hash = undefined;
  if (socket_connected) {
    callback();
  } else {
    micro.conn = new WebSocket(getParameterByName('socket'));
    micro.conn.onmessage = function(e) {
      processMessage(e);
    }
    micro.conn.onopen = function(e) {
      callback();
      socket_connected = true;
    }
    //micro.conn.onclose = micro.initFileSystem(callback);
    micro.conn.onclose = function(e) {
      socket_connected = false;
      setTimeout(function() {
        socketInit(callback)
      }, 500);
    }
    micro.conn.onerror = function(e) {
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
function socketGetFileTree(callback) {
  let process = function(msg) {
    files = [];
    for (let i = 0; i < msg.data.length; i++) {
      files.push(msg.data[i]);
    }
    console.log(files);
    callback(files);
  }
  let id = makeid();
  addCallback(process, id);
  socketSend(['tree', './'], id);
}

/* SocketLoadFile
 * Loads a file from the socket server. Requires a callback function to run when
 * the transfer is complete, and a file name. The callback will be passed a the
 * resulting file as well as some meta data.
 * :: function(callback)
 */
function socketLoadFile(file, callback) {
  let process = function(msg) {
    let html_file = msg.data.data.replace(/(?:\r\n|\r|\n)/g, '<br />');
    callback({
      name: msg.data.name,
      data: html_file,
      type: msg.data.type,
      size: msg.data.length
    });
  }
  let id = makeid();
  addCallback(process, id);
  socketSend(['load', 'utf-8', file.escapeSpecialChars()], id);
}

function socketSaveFile(filename, filedata, callback) {
  let process = function(msg) {
    callback(msg);
  }
  let id = makeid();
  addCallback(process, id);
  socketSend(['save', 'utf-8', filename, filedata.escapeSpecialChars()], id);
}

function socketDeleteFile(filename, callback) {
  let process = function(msg) {
    callback(msg);
  }
  let id = makeid();
  addCallback(process, id);
  socketSend(['delete', filename], id);
}

var socket_key;
var socket_callback_queue = {};

function addCallback(callback, id) {
  socket_callback_queue[id] = callback;
}

function getCallback(id) {
  let c = socket_callback_queue[id];
  delete socket_callback_queue[id];
  return c;
}

function processMessage(e) {
  let msg = JSON.parse(e.data);
  console.log(msg);
  /* Codes:
   * 0: Refused connection
   * 1: Sucessful process
   * 2: Unknown command
   * 3: Malformed message
   * 4: Invalid key
   * 5: Error
   * 6: Key set
   * 7: File/Direcory Update
   */
  if (msg.code === 1) {
    var callback = msg.callback;
    if (callback !== "0") {
      getCallback(callback)(msg);
    }
  } else if (msg.code === 7) {
    /*switch(msg.data[2]){
      case 'copy':
      case 'move':
        break;
      case 'update':
        break;
      case 'delete':
        break;
    }*/
    let arr = msg.data[0].split('/');
    socket_refreshFileTree({
      path: msg.data[0],
      filename: arr[arr.length - 1],
      data: msg.data[1],
      size: (msg.data[1] !== undefined ? msg.data[1].length : 0)
    });
  } else if (msg.code === 6) {
    socket_key = msg.data;
  } else {
    switch (msg.code) {
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

function socketSend(rqst, call) {
  // If the socket is not connected, send it later
  if (!socket_connected) {
    setTimeout(function() {
      socketSend(rqst, call)
    }, 500);
  } else {
    if (hash === undefined) {
      hash = MD5(socket_user + '_' + socket_pass + '_' + socket_key);
    }
    let to_send = {
      key: hash,
      request: rqst,
      callback: call
    };
    micro.conn.send(JSON.stringify(to_send));
  }
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