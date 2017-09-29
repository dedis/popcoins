const WebSocket = require("nativescript-websockets");

const testMyWebSocket = function (callback) {
  const socket = new WebSocket("wss://echo.websocket.org", {
    protocols: [/* 'chat', 'video' */],
    timeout: 6000,
    allowCellular: true,
    headers: {"Authorization": "Basic ..."}
  });

  socket.on("open", (socket) => {
    console.log("Hey I'm open");
    socket.send("Hello!!!!!!!!!!!!!!!! Send this back to meeeeeee!");
  });

  socket.on("message", (socket, message) => {
    console.log(`Got a message: ${message}`);
    socket.close(1, "IMA CLOSING DIS!");

    callback(message);
  });

  socket.on("close", (socket, code, reason) => {
    console.log(`Socket was closed because: ${reason}, code: ${code}`);
  });

  socket.on("error", (socket, error) => {
    console.log(`Socket had an error: ${error}`);
  });

  socket.open();
};

function Socket() {

  this.send = (request) =>
    new Promise((resolve, reject) => {
      const socket = new WebSocket("wss://echo.websocket.org", {
          protocols: [/* 'chat', 'video' */],
          timeout: 6000,
          allowCellular: true,
          headers: { "Authorization": "Basic ..." }
      });
      socket.on("open", (socket) => {
          console.log("socket opened");
          socket.send(request);
      });

      socket.on("message", (socket, message) => {
          console.log(`Got a message: ${message}`);
          socket.close();
          resolve(message);
      });

      socket.on("close", (socket, code, reason) => {
          console.log(`Socket was closed because: ${reason}, code: ${code}`);
      });

      socket.on("error", (socket, error) => {
          console.log(`Socket had an error: ${error}`);
          reject(new Error("there was an error with the socket"));
      });

      socket.open();
    });
}

exports.testMyWebSocket = testMyWebSocket;
exports.Socket = Socket;

