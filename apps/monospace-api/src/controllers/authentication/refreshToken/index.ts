import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../../../models/user';

const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }

  try {
    const secretKey = process.env.JWT_REFRESH_TOKEN;

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, secretKey) as JwtPayload;

    // Find the user by the decoded user ID
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Check if the refresh token has expired
    // if (user.refreshTokenExpires < Date.now()) {
    //   return res.status(401).json({ message: 'Refresh token expired' });
    // }

    // Generate a new access token
    const accessToken = jwt.sign({ userId: user._id, flag: false }, secretKey, {
      expiresIn: '30m',
    });

    // Generate a new refresh token
    const newRefreshToken = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: '7d',
    });

    // Set the new refresh token in the database
    // user.refreshToken = newRefreshToken;
    // user.refreshTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000;

    await user.save();

    return res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export default refreshToken;
