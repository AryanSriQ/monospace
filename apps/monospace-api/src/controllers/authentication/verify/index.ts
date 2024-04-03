import User from '../../../models/user';
import { Response } from 'express';
import { IRequest } from './verify';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../../constants';

const verify = async (req: IRequest, res: Response) => {
  try {
    // Get the verification token from the request parameters
    const token = req.params.token;

    // Find the user with the matching verification token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      // If no user is found, return an error response with a message
      return res
        .status(404)
        .json({ message: ERROR_MESSAGES.INVALID_VERIFICATION_TOKEN });
    }

    // Check if the verification token has expired
    if (user.verificationTokenExpires < Date.now()) {
      // If the token has expired, return an error response with a message
      return res
        .status(400)
        .json({ message: ERROR_MESSAGES.VERIFICATION_TOKEN_EXPIRED });
    }

    // Set the 'verified' field of the user to true after user clicks on magic link sent to email
    user.verified = true;
    // and remove the verification token
    user.verificationToken = undefined;
    // Set the 'verficationTokenExpires' field of the user to null
    user.verificationTokenExpires = undefined;
    // Set the 'verficationTokenSentAt' field of the user to null
    user.verificationTokenSentAt = undefined;

    // Save the user with the updated 'verified' field
    await user.save();

    // Return a success response with a message
    res.status(200).json({ message: SUCCESS_MESSAGES.VERIFIACTION_SUCCESSFUL });
  } catch (error) {
    // If an error occurs, return an error response with a message
    res.status(500).json({ message: ERROR_MESSAGES.UNABLE_TO_VERIFY_EMAIL });
  }
};

export default verify;
