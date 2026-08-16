require('dotenv').config();
const app = require('./app');

const http = require('http');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
});
