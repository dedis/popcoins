const Net = require("~/shared/lib/dedis-js/src/net");

QUnit.test("WebSocket Test", (assert) => {
  const socket = new Net.StandardSocket();

    return socket.send("wss://echo.websocket.org", "SEND DIS BAK 2 MI").then((result) => {
      assert.equal(result, "SEND DIS BAK 2 MI");
    });
});
