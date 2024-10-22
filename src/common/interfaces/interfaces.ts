export interface FlatCustomerEntry {
  id: string; // Customer Id
  intNr: string;
  type: string;
  companyName: string | null;
  country: string;
  zip: string;
  city: string;
  street: string;
  email: string | null;
  phone: string | null;
  fax: string | null;
  firstName: string | null;
  lastName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  birthDate: string | null;
  cId: string | null; // Contact Id
  aId: string | null; // Address Id
}

//#region Body
export interface AddressBody {
  _id?: string; // Optional
  companyName: string;
  country: string;
  zip: string;
  city: string;
  street: string;
  email: string;
  phone: string;
  fax: string;
}

export interface ContactPersonBody {
  _id?: string; // Optional
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
}
//#endregion
