/* eslint-disable no-underscore-dangle */
import bcrypt from 'bcryptjs';
import _ from 'lodash';
import { Customer, validateCustomer, validateLogin } from '../models/customer';

/**
 * @class CustomerController
 */
class CustomerController {
  /**
   * create a customer record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, customer data and access token
   */
  static async createCustomer(req, res, next) {
    const { error } = validateCustomer(req.body);
    if (error) return res.status(400).json(error.details[0].message);
    try {
      let customer = await Customer.findOne({ email: req.body.email });
      if (customer) return res.status(400).json('User already exists');

      customer = new Customer(_.pick(req.body, ['firstname', 'lastname', 'email', 'password']));
      const salt = await bcrypt.genSalt(10);
      customer.password = await bcrypt.hash(customer.password, salt);
      await customer.save();

      const token = customer.generateAuthToken();

      return res.header('x-auth-token', token).json({
        message: 'Successful! Customer created',
        data: _.pick(customer, ['_id', 'firstname', 'lastname', 'email']),
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * get all customers
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with all customers profile data
   */
  static async getAllCustomers(req, res, next) {
    try {
      const customers = await Customer.find().sort('firstname');
      return res
        .status(200)
        .json({
          message: 'Success',
          data: customers,
        })
        .select('-password');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * update customer profile data such as name, email
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with updated customer profile data
   */
  static async updateCustomer(req, res, next) {
    const { error } = validateCustomer(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
      const { firstname, lastname, email } = req;

      const customer = await Customer.findByIdAndUpdate(
        req.params.id,
        { firstname, lastname, email },
        { new: true }
      );

      if (!customer) return res.status(404).send('The user with the given Id does not exists');

      return res
        .status(200)
        .json({ message: 'this works', data: customer })
        .select('-password');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * delete customer
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with deleted customer
   */
  static async deleteCustomer(req, res, next) {
    try {
      const customer = await Customer.findByIdAndRemove(req.params.id);

      if (!customer) return res.status(404).send('The user with the given Id does not exists');

      return res.status(200).json({ message: 'customer deleted!', data: customer });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get a customer
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with a customer profile data
   */
  static async getOneCustomer(req, res, next) {
    try {
      const customer = await Customer.findById(req.params.id);

      if (!customer) return res.status(404).send('The user with the given Id does not exists');

      return res.status(200).json({ message: 'success', data: customer });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * login a customer
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer token
   */
  static async customerLogin(req, res, next) {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
      const customer = await Customer.findOne({ email: req.body.email });
      if (!customer) return res.status(400).json('invalid email or password');

      const validPassword = await bcrypt.compare(req.body.password, customer.password);
      if (!validPassword) return res.status(400).json('invalid email or password');

      const token = customer.generateAuthToken();

      return res.status(200).json({ message: 'customer login', data: token });
    } catch (err) {
      return next(err);
    }
  }
}

export default CustomerController;
