/* eslint-disable import/first */
import '../config/env';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import staffRoutes from '../routes/staffRoutes';
import customerRoutes from '../routes/customerRoutes';
import error from '../middleware/error';

const server = express();
server.disable('x-powered-by');
const apiTimeout = 18000;

import './logger';
import './database';
import './validation';

server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, x-auth-token, Content-Type, Accept');
  next();
});
server.use(helmet());
server.use(compression());
server.use(express.json({ limit: '50mb' }));
server.use('/api/staff', staffRoutes);
server.use('/api/customer', customerRoutes);
server.use((req, res, next) => {
  // set the timeout for all HTTP requests
  req.setTimeout(apiTimeout, () => {
    const err = new Error('Request Timeout');
    err.status = 408;
    next(err);
  });

  // set the server response timeout for all HTTP requests
  res.setTimeout(apiTimeout, () => {
    const err = new Error('Service Unavailable');
    err.status = 503;
    next(err);
  });
  next();
});
server.use(error);

export default server;
