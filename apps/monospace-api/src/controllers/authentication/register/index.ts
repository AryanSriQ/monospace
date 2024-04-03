import User from '../../../models/user';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import validator from 'validator';
import { Response } from 'express';
import { IRequest } from './register';
import sendEmail from '../../../services/sendEmail';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../../constants';

const register = async (req: IRequest, res: Response) => {
  // Get the data from the request body
  const { name, email, password, confirmPassword } = req.body;

  // All the fields are required
  const requiredFields = ['name', 'email', 'password', 'confirmPassword'];

  // Check if all the required fields are present
  const missingField = requiredFields.find((field) => !req.body[field]);

  if (missingField) {
    return res.status(404).json({
      success: false,
      message: `${missingField} is required.`,
    });
  }

  // no empty field
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.ALL_FIELDS_REQUIRED,
    });
  }

  if (name.length < 3) {
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.NAME_TOO_SHORT,
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.PASSWORD_TOO_SHORT,
    });
  }

  // Check if the email is valid
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_EMAIL,
    });
  }

  // Check if the password and confirm password match
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.PASSWORDS_DONT_MATCH,
    });
  }

  // Encrypt the password using bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Check if the email already exists in the database
    const userInDb = await User.findOne({ email });

    // Email is already in use and is not verified
    if (userInDb && !userInDb.verified) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.EMAIL_EXISTS_NOT_VERIFIED,
      });
    }

    if (userInDb && userInDb.verified) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      });
    } else {
      // Create a new user object with the provided data
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
      });

      // Generate a verification token and store it in the user object
      newUser.verificationToken = crypto.randomBytes(20).toString('hex');

      // expire verification token after 1 hour
      newUser.verificationTokenExpires = Date.now() + 60 * 60 * 1000;

      newUser.verificationTokenSentAt = Date.now();

      // Save the new user to the database
      await newUser.save();

      const mailArgs = {
        email: newUser.email,
        verificationToken: newUser.verificationToken,
      };

      // Send a verification email to the user
      await sendEmail(mailArgs);

      // Return a success response
      return res.status(201).json({
        success: true,
        message: SUCCESS_MESSAGES.REGISTER_SUCCESSFUL,
        token: newUser.verificationToken,
      });
    }
  } catch (error) {
    // Handle any errors that occur during the process
    return res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.REGISTER_UNSUCCESSFUL,
      error,
    });
  }
};

export default register;
