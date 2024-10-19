import mongoose, { Schema, Document } from "mongoose";

interface IContactPerson extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  address: mongoose.Types.ObjectId | null;
}

interface IAddress extends Document {
  _id: mongoose.Types.ObjectId;
  companyName?: string;
  country: string;
  zip: string;
  city: string;
  street: string;
  email: string;
  phone: string;
  fax?: string;
}

interface ICustomer extends Document {
  _id: mongoose.Types.ObjectId;
  intNr: string;
  type: "DEALER" | "COMPANY" | "PRIVATE";
  contactPersons: IContactPerson[];
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const contactPersonSchema: Schema = new Schema({
  firstName: { type: String, maxlength: 50, required: true },
  lastName: { type: String, maxlength: 50, required: true },
  email: { type: String, maxlength: 50, required: true, match: /.+\@.+\..+/ },
  phone: { type: String, maxlength: 20, required: true },
  birthDate: { type: String, required: true },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    default: null,
  },
});

const addressSchema: Schema = new Schema({
  companyName: { type: String, maxlength: 50, default: null },
  country: { type: String, maxlength: 50, required: true },
  zip: { type: String, maxlength: 5, required: true },
  city: { type: String, maxlength: 50, required: true },
  street: { type: String, maxlength: 100, required: true },
  email: { type: String, maxlength: 50, required: true, match: /.+\@.+\..+/ },
  phone: { type: String, maxlength: 20, required: true },
  fax: { type: String, maxlength: 20, default: null },
});

const customerSchema: Schema = new Schema({
  intNr: { type: String, maxlength: 10, unique: true, required: true },
  type: {
    type: String,
    enum: ["DEALER", "COMPANY", "PRIVATE"],
    required: true,
  },
  contactPersons: [contactPersonSchema],
  addresses: [addressSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICustomer>("Customer", customerSchema);
