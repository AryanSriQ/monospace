import User from '../../../models/user';
import crypto from 'crypto';
import validator from 'validator';
import { Response } from 'express';
import { IRequest } from './resendVerificationEmail';
import sendEmail from '../../../services/sendEmail';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../../constants';

const resendVerificationEmail = async (req: IRequest, res: Response) => {
  // Extract email from request body
  const { email } = req.body;

  // Validate email
  if (!email) {
    return res.status(400).json({ message: ERROR_MESSAGES.EMAIL_IS_REQUIRED });
  }

  // Check if email is valid
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: ERROR_MESSAGES.INVALID_EMAIL });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // If user not found, return 404 error
    if (!user) {
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    // If user is already verified, return 400 error
    if (user.verified) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.USER_ALREADY_VERIFIED });
    }

    // another mail sent time should be more that 1 minute than the user createdAt
    if (Date.now() - user.verificationTokenSentAt < 60 * 1000) {
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.WAIT_FOR_A_MINUTE });
    }

    // update token
    const token = crypto.randomBytes(20).toString('hex');
    user.verificationToken = token;

    // update token expiry
    user.verificationTokenExpires = Date.now() + 30 * 60 * 1000;

    // update token sent time
    user.verificationTokenSentAt = Date.now();

    user.save();

    const mailArgs = {
      email: user.email,
      verificationToken: token,
    };

    // send mail
    sendEmail(mailArgs);

    // Return 200 status with success message
    return res.status(200).json({
      message: SUCCESS_MESSAGES.VERIFICATION_EMAIL_SENT_SUCCESSUL,
      token: token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: ERROR_MESSAGES.UNABLE_TO_SEND_VERIFICATION_EMAIL });
  }
};

export default resendVerificationEmail;
