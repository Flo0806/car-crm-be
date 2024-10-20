import mongoose, { Schema, Document, Types } from "mongoose";

// Schema für Address
const AddressSchema = new Schema({
  companyName: { type: String, maxlength: 50 },
  country: { type: String, maxlength: 50, required: true },
  zip: { type: String, minlength: 5, maxlength: 5, required: true },
  city: { type: String, maxlength: 50, required: true },
  street: { type: String, maxlength: 100, required: true },
  email: {
    type: String,
    maxlength: 50,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
  },
  phone: {
    type: String,
    maxlength: 20,
    match: [/^\+?[1-9]\d{1,14}$/, "Please use a valid phone number"],
  },
  fax: {
    type: String,
    maxlength: 20,
    match: [/^\+?[1-9]\d{1,14}$/, "Please use a valid fax number"],
  },
});

// Schema für ContactPerson
const ContactPersonSchema = new Schema({
  firstName: { type: String, maxlength: 50, required: true },
  lastName: { type: String, maxlength: 50, required: true },
  email: {
    type: String,
    maxlength: 50,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
  },
  phone: {
    type: String,
    maxlength: 20,
    match: [/^\+?[1-9]\d{1,14}$/, "Please use a valid phone number"],
  },
  birthDate: {
    type: String,
    match: [/^\d{4}-\d{2}-\d{2}$/, "Please use a valid date format YYYY-MM-DD"],
  },
  address: { type: Types.ObjectId, ref: "Address" },
});

// Schema für Customer
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
  address?: Types.ObjectId; // Verknüpfung zur Adresse
}

interface CustomerType extends Document {
  intNr: string;
  type: "DEALER" | "COMPANY" | "PRIVATE";
  contactPersons: ContactPersonType[];
  addresses: AddressType[];
}

const Customer = mongoose.model<CustomerType>("Customer", CustomerSchema);
const Address = mongoose.model<AddressType>("Address", AddressSchema);

export { Customer, Address, ContactPersonType, AddressType };
