import User from '../../../models/user';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { Response } from 'express';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../../constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const login = async (req: any, res: Response) => {
  // Extract email and password from the request body
  const { email, password } = req.body;
  // const redisClient = req.redis;

  // Email is required
  if (!email) {
    return res
      .status(400)
      .json({ message: ERROR_MESSAGES.EMAIL_IS_REQUIRED, success: false });
  }

  // Validate email
  if (!validator.isEmail(email)) {
    return res
      .status(400)
      .json({ message: ERROR_MESSAGES.INVALID_EMAIL, success: false });
  }

  // Password is required
  if (!password) {
    return res
      .status(400)
      .json({ message: ERROR_MESSAGES.PASSWORD_IS_REQUIRED, success: false });
  }

  try {
    // Find a user with the given email
    const user = await User.findOne({ email });

    // If no user is found, return an error response
    if (!user) {
      return res.status(404).json({
        message: ERROR_MESSAGES.NO_USER_WITH_THIS_EMAIL,
        success: false,
      });
    }

    // If the user is not verified, return an error response
    if (!user.verified) {
      return res.status(400).json({
        message: ERROR_MESSAGES.EMAIL_NOT_VERIFIED,
        success: false,
      });
    }

    const matchPassword = await bcrypt.compare(password, user.password);

    // If the password does not match, return an error response
    if (!matchPassword) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.INVALID_PASSWORD, success: false });
    }

    const accessKey = process.env.JWT_ACCESS_KEY;
    // const refreshKey = process.env.JWT_REFRESH_KEY;

    // Generate a JWT token using the user's ID and a secret key
    const accessToken = jwt.sign({ userId: user._id, flag: true }, accessKey, {
      expiresIn: '30m',
    });

    // const refreshToken = jwt.sign({ userId: user._id }, refreshKey, {
    //   expiresIn: '7d',
    // });

    // await redisClient.set('accessToken', accessToken);
    // await redisClient.set('refreshToken', refreshToken);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: process.env.JWT_TIMEOUT,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      priority: 'high',
    });

    // res.cookie('refreshToken', refreshToken, {
    //   httpOnly: true,
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   priority: 'high',
    // });

    res.status(200).json({
      message: SUCCESS_MESSAGES.LOGIN_SUCCESSFUL,
      success: true,
      accessToken,
      // refreshToken,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: ERROR_MESSAGES.LOGIN_UNSUCCESSFUL, success: false });
  }
};

export default login;
