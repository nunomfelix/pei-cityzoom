
const server = require('http').createServer();
const io = require('socket.io')(server);
const PORT = 3000
io.on('connection', client => {
    console.log('Server is running on localhost:'+PORT)
  client.on('event', data => { /* … */ });
  client.on('disconnect', () => { /* … */ });
});
server.listen(PORT);