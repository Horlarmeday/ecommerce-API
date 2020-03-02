/* eslint-disable no-underscore-dangle */
import bcrypt from 'bcryptjs';
import _ from 'lodash';
import { Staff, validateStaff, validateLogin } from '../models/staff';

/**
 * @class StaffController
 */
class StaffController {
  /**
   * create a staff record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, staff data and access token
   */
  static async createStaff(req, res, next) {
    const { error } = validateStaff(req.body);
    if (error) return res.status(400).json(error.details[0].message);
    try {
      let staff = await Staff.findOne({ email: req.body.email });
      if (staff) return res.status(400).json('Staff already exists');

      staff = new Staff(_.pick(req.body, ['firstname', 'lastname', 'email', 'password']));
      const salt = await bcrypt.genSalt(10);
      staff.password = await bcrypt.hash(staff.password, salt);
      await staff.save();

      const token = staff.generateAuthToken();

      return res.header('x-auth-token', token).json({
        message: 'Successful! Staff created',
        data: _.pick(staff, ['_id', 'firstname', 'lastname', 'email']),
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * get all staffs
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with all staffs profile data
   */
  static async getAllStaff(req, res, next) {
    try {
      const staffs = await Staff.find().sort('firstname');
      return res
        .status(200)
        .json({
          message: 'Success',
          data: staffs,
        })
        .select('-password');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * update staff profile data such as name, email
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with updated staff profile data
   */
  static async updateStaff(req, res, next) {
    const { error } = validateStaff(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
      const staff = await Staff.findByIdAndUpdate(
        req.params.id,
        { firstname: req.body.firstname },
        { lastname: req.body.lastname },
        { new: true }
      );

      if (!staff) return res.status(404).send('The user with the given Id does not exists');

      return res
        .status(200)
        .json({ message: 'this works', data: staff })
        .select('-password');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * delete staff
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with deleted staff
   */
  static async deleteStaff(req, res, next) {
    try {
      const staff = await Staff.findByIdAndRemove(req.params.id);

      if (!staff) return res.status(404).send('The user with the given Id does not exists');

      return res.status(200).json({ message: 'staff deleted!', data: staff });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get a staff
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with a staff profile data
   */
  static async getOneStaff(req, res, next) {
    try {
      const staff = await Staff.findById(req.user._id);

      if (!staff) return res.status(404).send('The user with the given Id does not exists');

      return res.status(200).json({ message: 'success', data: staff });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * login a staff
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status staff token
   */
  static async staffLogin(req, res, next) {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
      const staff = await Staff.findOne({ email: req.body.email });
      if (!staff) return res.status(400).json('invalid email or password');

      const validPassword = await bcrypt.compare(req.body.password, staff.password);
      if (!validPassword) return res.status(400).json('invalid email or password');

      const token = staff.generateAuthToken();

      return res.status(200).json({ message: 'staff login', data: token });
    } catch (err) {
      return next(err);
    }
  }
}

export default StaffController;
