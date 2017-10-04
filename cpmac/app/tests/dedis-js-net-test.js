const Net = require("~/shared/lib/dedis-js/src/net");

QUnit.test("WebSocket Test", (assert) => {
  const socket = new Net.StandardSocket();

  socket.send("HI FROM GOD!").then((message) => assert.equal("HI FROM GOD!", message));
});
