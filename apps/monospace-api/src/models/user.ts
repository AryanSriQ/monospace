import mongoose, { Document, Schema } from 'mongoose';
import { isEmail } from 'validator';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  verified: boolean;
  verificationToken: string | null;
  verificationTokenExpires: number | null;
  verificationTokenSentAt: number | null;
  addresses: [
    {
      name: string;
      mobileNo: string;
      houseNo: string;
      street: string;
      landmark: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    }
  ];
  orders: mongoose.Schema.Types.ObjectId[];
  resetTokenExpiration: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, 'Please send an email'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Minimum password length should be 6 characters'],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    default: null,
  },
  verificationTokenExpires: {
    type: Number,
    default: null,
  },
  verificationTokenSentAt: {
    type: Number,
    default: +Date.now(),
  },
  addresses: {
    type: [
      {
        name: String,
        mobileNo: String,
        houseNo: String,
        street: String,
        landmark: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
      },
    ],
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  ],
  resetTokenExpiration: {
    type: Number,
    default: +Date.now(),
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

export default mongoose.model<IUser>('User', UserSchema);
