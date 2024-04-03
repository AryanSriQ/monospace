import User from '../../../models/user';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Response } from 'express';
import { IRequest } from './resetPassword';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../../constants';

const resetPassword = async (req: IRequest, res: Response) => {
  // Extract password from request body and token from request parameters
  const { password, confirmPassword } = req.body;
  const { token } = req.params;

  if (!password) {
    return res
      .status(400)
      .json({ message: ERROR_MESSAGES.PASSWORD_IS_REQUIRED });
  }

  if (!confirmPassword) {
    return res
      .status(400)
      .json({ message: ERROR_MESSAGES.CONFIRMPASSWORD_IS_REQUIRED });
  }

  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ message: ERROR_MESSAGES.PASSWORDS_DONT_MATCH });
  }

  // Check if token is valid
  if (!token) {
    return res.status(400).json({ message: ERROR_MESSAGES.INVALID_TOKEN });
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY;

    // Verify the token using the secret key
    const decoded = jwt.verify(token, secretKey) as JwtPayload;

    // Find the user by the decoded user ID from the token
    const user = await User.findById(decoded.userId);

    // If user not found, return 404 with error message
    if (!user) {
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    // check if the resetTokenExpiration has expired
    if (Date.now() > user.resetTokenExpiration) {
      return res.status(400).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password with the hashed password
    user.password = hashedPassword;

    // Save the updated user information
    await user.save();

    return res
      .status(200)
      .json({ message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESSFUL });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: ERROR_MESSAGES.UNABLET_TO_RESET_PASSWORD,
        token: token,
      });
  }
};

export default resetPassword;
