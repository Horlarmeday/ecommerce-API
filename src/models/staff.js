/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
import { Schema, model } from 'mongoose';
import Joi from '@hapi/joi';
import { sign } from 'jsonwebtoken';

const staffSchema = new Schema({
  firstname: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 50,
  },

  lastname: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 50,
  },

  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
    min: 5,
    max: 255,
  },

  isAdmin: Boolean,
});

staffSchema.methods.generateAuthToken = function() {
  const token = sign({ _id: this._id, isAdmin: this.isAdmin }, process.env.JWT_SECRET);
  return token;
};

export const Staff = model('Staff', staffSchema);

// function to validate
export function validateStaff(staff) {
  const schema = Joi.object({
    firstname: Joi.string()
      .min(4)
      .max(50)
      .required(),
    lastname: Joi.string()
      .min(4)
      .max(50)
      .required(),
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required(),
  });
  return schema.validate(staff);
}

export function validateLogin(req) {
  const schema = Joi.object({
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required(),
  });
  return schema.validate(req);
}
