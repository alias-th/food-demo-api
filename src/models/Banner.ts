import mongoose, { model } from "mongoose";

interface BannerAttrs {
  banner: string;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface BannerDoc extends mongoose.Document {
  banner: string;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

interface BannerModel extends mongoose.Model<BannerDoc> {
  build(attrs: BannerAttrs): BannerDoc;
}

const bannerSchema = new mongoose.Schema(
  {
    banner: { type: String, required: true },
    status: { type: Boolean, required: true, default: true },
    created_at: { type: Date, required: true, default: new Date() },
    updated_at: { type: Date, required: true, default: new Date() },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const Banner = model<BannerDoc, BannerModel>("banners", bannerSchema);

export default Banner;
