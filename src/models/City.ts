import mongoose, { model } from "mongoose";

interface CityAttrs {
  name: string;
  lat: number;
  lng: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface CityDoc extends mongoose.Document {
  name: string;
  lat: number;
  lng: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

interface CityModel extends mongoose.Model<CityDoc> {
  build(attrs: CityAttrs): CityDoc;
}

const citySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: { type: String, required: true, default: "active" },
    lat: { type: Number, require: true },
    lng: { type: Number, require: true },
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

const City = model<CityDoc, CityModel>("cities", citySchema);

export default City;
