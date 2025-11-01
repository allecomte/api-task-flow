const http = require('http');
const app = require('./app');
const {getPort,errorHandler} = require('./config');
const { connectDB } = require("./config");

//#region Configuration
connectDB();

const port = getPort();
app.set('port', port);

const server = http.createServer(app);

server.on('error', errorHandler);

server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});
server.listen(port);