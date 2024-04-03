import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import user from '../models/user';
import mongoose from 'mongoose';

interface IRequest extends Request {
  userId: mongoose.Types.ObjectId;
}

const refreshToken = [];

const verifyRefreshToken = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.body.token;

  if (!token) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }

  try {
    const secretKey = process.env.JET_REFRESH_TOKEN;

    const { userId } = jwt.verify(token, secretKey) as JwtPayload;
    req.userId = await user.findById(userId).select('_id');

    const storedRefreshToken = refreshToken.find(
      (temp) => temp.userId === userId
    );

    if (!storedRefreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export default verifyRefreshToken;
