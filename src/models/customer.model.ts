import mongoose, { Schema, Document, Types } from "mongoose";

// Schema for Address
const AddressSchema = new Schema({
  companyName: { type: String, maxlength: 50 },
  country: { type: String, maxlength: 50, required: true },
  zip: { type: String, minlength: 5, maxlength: 5, required: true },
  city: { type: String, maxlength: 50, required: true },
  street: { type: String, maxlength: 100, required: true },
  email: {
    type: String,
    maxlength: 50,
    match: [/^\S+@\S+\.\S+$/, "E-Mail hat falsches Format (xxx@xxx.xx)"],
  },
  phone: {
    type: String,
    maxlength: 20,
    match: [
      /^(\+?[1-9]\d{0,14}|\d{1,15})(\s?\d{1,13})*$/,
      "Telefonnummer hat falsches Format (+xx xxxxxxx oder 0123456)",
    ],
  },
  fax: {
    type: String,
    maxlength: 20,
    match: [
      /^(\+?[1-9]\d{0,14}|\d{1,15})(\s?\d{1,13})*$/,
      "Faxnummer hat falsches Format (+xx xxxxxxx)",
    ],
  },
});

// Schema for ContactPerson
const ContactPersonSchema = new Schema({
  firstName: { type: String, maxlength: 50, required: true },
  lastName: { type: String, maxlength: 50, required: true },
  email: {
    type: String,
    maxlength: 50,
    match: [/^\S+@\S+\.\S+$/, "E-Mail hat falsches Format (xxx@xxx.xx)"],
  },
  phone: {
    type: String,
    maxlength: 20,
    match: [
      /^(\+?[1-9]\d{0,14}|\d{1,15})(\s?\d{1,13})*$/,
      "Telefonnummer hat falsches Format (+xx xxxxxxx)",
    ],
  },
  birthDate: {
    type: String,
    match: [/^\d{4}-\d{2}-\d{2}$/, "Datum hat falsches Format (YYYY-MM-DD)"],
  },
  address: { type: Types.ObjectId, ref: "Address" },
});

// Schema for Customer
const CustomerSchema = new Schema(
  {
    intNr: { type: String, maxlength: 10, required: true, unique: true },
    type: {
      type: String,
      enum: ["DEALER", "COMPANY", "PRIVATE"],
      required: true,
    },
    contactPersons: [ContactPersonSchema],
    addresses: [AddressSchema],
  },
  { timestamps: true }
);

interface AddressType extends Document {
  companyName?: string;
  country: string;
  zip: string;
  city: string;
  street: string;
  email?: string;
  phone?: string;
  fax?: string;
}

interface ContactPersonType extends Document {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: Types.ObjectId; // Relation to address
}

interface CustomerType extends Document {
  intNr: string;
  type: "DEALER" | "COMPANY" | "PRIVATE";
  contactPersons: ContactPersonType[];
  addresses: AddressType[];
}

const Customer = mongoose.model<CustomerType>("Customer", CustomerSchema);
const Address = mongoose.model<AddressType>("Address", AddressSchema);
const ContactPerson = mongoose.model<ContactPersonType>(
  "ContactPerson",
  ContactPersonSchema
);

export { Customer, Address, ContactPerson, ContactPersonType, AddressType };
