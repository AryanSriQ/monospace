import { Request, Response } from 'express';
import user from '../../models/user';
import mongoose from 'mongoose';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../constants';

interface IRequest extends Request {
  userId: mongoose.Types.ObjectId;
}

export const profile = async (req: IRequest, res: Response) => {
  const { userId } = req;

  if (!userId) {
    return res.status(401).json({ message: ERROR_MESSAGES.UNAUTHORIZED });
  }

  const userFound = await user.findById(userId);

  console.log(userFound);

  return res
    .status(200)
    .json({ message: SUCCESS_MESSAGES.AUTHENTICATED_PROFILE, userId });
};
