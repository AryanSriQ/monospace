import User from '../../../models/user';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { IRequest } from './forgotPassword';
import sendEmail from '../../../services/sendEmail';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../../constants';

const forgotPassword = async (req: IRequest, res: Response) => {
  // Extract email from request body
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // If user not found, return 404 error
    if (!user) {
      return res
        .status(404)
        .json({ message: ERROR_MESSAGES.USER_NOT_FOUND, success: false });
    }

    // If user is not verified, return 400 error
    if (!user.verified) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.EMAIL_NOT_VERIFIED, success: false });
    }

    // If mail was sent in the last 1 hour, return 400 error
    // if (user.resetTokenExpiration && Date.now() < user.resetTokenExpiration) {
    //   return res.status(400).json({ message: 'Please try again after 1 hour' });
    // }

    // Generate secret key
    const secretKey = process.env.JWT_ACCESS_KEY;

    // Update user's reset token and reset token expiration and set it to expire after 1 hour
    user.resetTokenExpiration = Date.now() + 60 * 60 * 1000;

    // Save user
    await user.save();

    // Generate JWT token for user
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: '1h',
    });

    const mailArgs = {
      email: user.email,
      resetToken: token,
    };

    // Send a reset password email to the user
    await sendEmail(mailArgs);

    // return 200 success
    return res.status(200).json({
      message: SUCCESS_MESSAGES.RESET_EMAIL_SENT_SUCCESSFUL,
      success: true,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: ERROR_MESSAGES.UNABLE_TO_SEND_RESET_EMAIL,
      success: true,
    });
  }
};

export default forgotPassword;
