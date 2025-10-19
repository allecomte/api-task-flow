const { default: mongoose } = require('mongoose');

const connectDB = async () => {
    try {
        console.log('mongodb+srv://'+process.env.DB_USER+':'+process.env.DB_PASSWORD+'@cluster0.bjlx6z4.mongodb.net/'+process.env.DB_NAME+'?retryWrites=true&w=majority&appName=Cluster0');
            await mongoose.connect('mongodb+srv://'+process.env.DB_USER+':'+process.env.DB_PASSWORD+'@cluster0.bjlx6z4.mongodb.net/'+process.env.DB_NAME+'?retryWrites=true&w=majority&appName=Cluster0',
                { useNewUrlParser: true,
                useUnifiedTopology: true }
            )
            console.log('MongoDB connected');
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

const getPort = () => normalizePort(process.env.PORT || '3000');


const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

module.exports = {connectDB, getPort, errorHandler};