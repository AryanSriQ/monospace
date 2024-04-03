import { Request, Response } from 'express';
// import User from '../../../models/user';

const logout = async (req: Request, res: Response) => {
  //   const { _id } = req.user;
  //   const user = await User.findById(_id);
  //   user.accessToken = '';
  //   user.refreshToken = '';
  //   user.save();
  res.status(200).json({ message: 'Logout successfull' });
};
