import winston from 'winston';
import { port } from './config/secret';
import server from './startup/server';

server.listen(port, () => winston.info(`Running on port ${port}...`));

server.get('/', (req, res) => {
  res.send('WELCOME TO ECOMMERCE API');
});
