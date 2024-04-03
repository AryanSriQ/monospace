import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import user from '../models/user';
import mongoose from 'mongoose';

interface IRequest extends Request {
  userId: mongoose.Types.ObjectId;
}

const jwtAuthCookie = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (authorization) {
    const token = authorization.split(' ')[1];

    const secretKey = process.env.JWT_ACCESS_KEY;

    try {
      const { userId } = jwt.verify(token, secretKey) as JwtPayload;
      req.userId = await user.findById(userId).select('_id');
      next();
    } catch (error) {
      console.log(error);
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }
};

export default jwtAuthCookie;
