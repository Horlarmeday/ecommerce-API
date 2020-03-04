/* eslint-disable no-unused-vars */
import winston from 'winston';

export default function(error, req, res, next) {
  winston.error(error.message, error);
  res.status(500).json(error.message);
}
