import mongoose, { model } from "mongoose";
import { UserType } from "../enums/UserType";

interface UserAttrs {
  email: string;
  email_verified: boolean;
  verification_token: string;
  verification_token_time: Date;
  reset_password_token: string;
  reset_password_token_time: Date;
  phone: string;
  password: string;
  name: string;
  type: UserType;
  status: string;
}

export interface UserDoc extends mongoose.Document {
  email: string;
  email_verified: boolean;
  verification_token: string;
  verification_token_time: Date;
  reset_password_token: string;
  reset_password_token_time: Date;
  phone: string;
  password: string;
  name: string;
  type: UserType;
  status: string;
  created_at: Date;
  updated_at: Date;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    email_verified: { type: Boolean, required: true, default: false },
    verification_token: { type: String, required: true },
    verification_token_time: { type: Date, required: true },
    reset_password_token: { type: String, required: false },
    reset_password_token_time: { type: Date, required: false },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: UserType,
      default: UserType.user,
    },
    status: { type: String, required: true },
    created_at: { type: Date, required: true, default: new Date() },
    updated_at: { type: Date, required: true, default: new Date() },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

const User = model<UserDoc, UserModel>("users", userSchema);

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

export default User;
