/* meta-node-server.js
 * Revision: Alpha 0.0.1
 * Description: Prototype, proof of concept.
 * Author: Darren Decker, deckerd@guruassist.com 
 */

var express = require('express');
var eventsource = require('express-eventsource'); 
var mcsocket = require('metactrl-socket');
var inspect = require('util').inspect;

// Node server-to-metactrl socket
mcsocket.server.connect();

// Foreground server
var app1 = new express();
app1.use(express.static('./Scenes/Default'));
app1.listen(8080);
console.log("> Foreground server is listening on http://127.0.0.1:8080");

// Background server
var app2 = new express(); 
app2.use(express.static('./Scenes/Default'));
var sse = eventsource({connections: 2});
var broadcast = sse.sender('/sse');
app2.use(sse.middleware());
setInterval(function() {broadcast({ bar: 'baz' })}, 2000);
app2.listen(8081);
console.log("> Background server is listening on http://127.0.0.1:8081");

// Push SSE data to client window
app1.get('/logo_clicked', function (req, res) {
  sse.send('logo_clicked');
});

app1.get('/logo_set_z_bottom', function (req, res) {
  mcsocket.server.send("<MNSCRQ>Set-Window-Z-Order:" + mcsocket.server.windowHandles['0'] + 
                      ":bottom</MNSCRQ>");
});

app1.get('/logo_set_z_topmost', function (req, res) {
  mcsocket.server.send("<MNSCRQ>Set-Window-Z-Order:" + mcsocket.server.windowHandles['0'] + 
                      ":topmost</MNSCRQ>");
});