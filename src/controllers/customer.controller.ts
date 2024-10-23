import { Request, Response } from "express";
import {
  ContactPersonType,
  AddressType,
  Address,
  Customer,
  ContactPerson,
} from "../models/customer.model";
import {
  AddressBody,
  ContactPersonBody,
  FlatCustomerEntry,
} from "../common/interfaces/interfaces";
import mongoose from "mongoose";

//#region Helper
async function generateNextIntNr(): Promise<string> {
  const lastCustomer = await Customer.findOne().sort({ intNr: -1 }).exec();

  if (!lastCustomer || !lastCustomer.intNr) {
    return "K-0001"; // If no customer exists, start with "K-0001"
  }

  const lastIntNr = lastCustomer.intNr;
  const currentNumber = parseInt(lastIntNr.split("-")[1], 10);
  const nextNumber = currentNumber + 1;

  // Format the new number, e.g., "K-0002"
  return `K-${nextNumber.toString().padStart(4, "0")}`;
}
//#endregion

/**
 * @desc Get all customers as a flat list
 * @route GET /customers
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<any>} - List of customers or error message
 */
export const getAllCustomers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Find all customers and populate addresses and contact persons
    const customers = await Customer.find()
      .populate("addresses")
      .populate("contactPersons")
      .exec();

    // Create a flat array where each address and its associated contact person is a separate entry
    const flatCustomerList = customers.reduce(
      (acc: FlatCustomerEntry[], customer) => {
        customer.addresses.forEach((address: any) => {
          // Find the contact persons linked to this address
          const linkedPersons = customer.contactPersons.filter(
            (person: any) =>
              person.address && person.address.equals(address._id)
          );

          // If no contact persons are linked, still add a row for the address
          if (linkedPersons.length === 0) {
            acc.push({
              id: customer._id as string,
              intNr: customer.intNr,
              type: customer.type,
              companyName: address.companyName || null,
              country: address.country,
              zip: address.zip,
              city: address.city,
              street: address.street,
              email: address.email || null,
              phone: address.phone || null,
              fax: address.fax || null,
              firstName: null,
              lastName: null,
              contactEmail: null,
              contactPhone: null,
              birthDate: null,
              cId: null, // No contact person
              aId: address._id, // Address exists
            });
          } else {
            // Add each contact person in its own row
            linkedPersons.forEach((person: any) => {
              acc.push({
                id: customer._id as string,
                intNr: customer.intNr,
                type: customer.type,
                companyName: address.companyName || null,
                country: address.country,
                zip: address.zip,
                city: address.city,
                street: address.street,
                email: address.email || null,
                phone: address.phone || null,
                fax: address.fax || null,
                firstName: person.firstName,
                lastName: person.lastName,
                contactEmail: person.email || null,
                contactPhone: person.phone || null,
                birthDate: person.birthDate || null,
                cId: person._id, // Contact person ID
                aId: address._id, // Address ID
              });
            });
          }
        });
        return acc;
      },
      []
    );

    res.status(200).json(flatCustomerList);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Get one customer by ID, with addresses and contacts as children
 * @route GET /customers/:customerId
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<any>} - The customer or an error message
 */
export const getCustomerById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { customerId } = req.params;

    // Find the customer by the provided ID and populate addresses and contact persons
    const customer = await Customer.findById(customerId)
      .populate("addresses")
      .populate("contactPersons")
      .exec();

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @desc Create a new customer, with address and contact
 * @route POST /customers
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<any>} - The created customer or an error message
 */
export const createCustomer = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      type,
      contactPersons,
      addresses,
    }: {
      intNr: string;
      type: "DEALER" | "COMPANY" | "PRIVATE";
      contactPersons: Omit<ContactPersonType, "address">[]; // Address will be linked later
      addresses: Omit<AddressType, "_id">[]; // Address is saved, so _id is not expected
    } = req.body;

    const intNr = await generateNextIntNr();

    // Create and save addresses first
    const savedAddresses = await Promise.all(
      addresses.map(async (address) => {
        const newAddress = new Address(address);
        return await newAddress.save();
      })
    );

    // Take the IDs of the saved addresses and link them to the contact persons
    const updatedContactPersons = contactPersons.map((person) => ({
      ...person,
      address: savedAddresses.length > 0 ? savedAddresses[0]._id : undefined, // Link the first address
    }));

    // Now create the new customer and link the contact persons and addresses
    const newCustomer = new Customer({
      intNr,
      type,
      contactPersons: updatedContactPersons,
      addresses: savedAddresses,
    });

    const savedCustomer = await newCustomer.save();

    res.status(201).json(savedCustomer);
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errorMessages = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({ errors: errorMessages });
    }
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Add an address to an existing customer
 * @route PUT /customers/:customerId/address
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<any>} - Updated customer or error message
 */
export const addAddressToCustomer = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params; // Customer ID from URL
    const newAddressData = req.body as AddressBody; // New address from the request body

    // Check if the customer exists
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Create new address
    const newAddress = new Address(newAddressData);
    const savedAddress = await newAddress.save();

    // Add the address to the customer
    customer.addresses.push(savedAddress);
    await customer.save();

    res.status(200).json({
      message: "Address successfully added to customer",
      customer,
    });
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errorMessages = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({ errors: errorMessages });
    }
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Update an existing customer
 * @route PUT /customers/:id
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<any>} - Updated customer or error message
 */
export const updateCustomer = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { type } = req.body;

  try {
    // Try to find the existing customer
    const existingCustomer = await Customer.findById(req.params.id);

    if (!existingCustomer) {
      return res.status(404).json({ msg: "Customer not found" });
    }

    // Update the data but ignore the `intNr` as we should never change this number
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        type,
        intNr: existingCustomer.intNr, // Keep the intNr unchanged
      },
      { new: true }
    );

    res.json(updatedCustomer);
  } catch (err: any) {
    if (err instanceof mongoose.Error.ValidationError) {
      const errorMessages = Object.values(err.errors).map(
        (error) => error.message
      );
      return res.status(400).json({ errors: errorMessages });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc Add a contact person to an existing customer
 * @route PUT /customers/:customerId/contact
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<any>} - Updated customer or error message
 */
export const addContactPersonToCustomer = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { customerId } = req.params; // Customer ID from URL
    const personData = req.body as ContactPersonBody; // New contact person from the request body

    // Check if the customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Create new contact person
    const newContactPersonData = {
      ...personData,
      address: null, // Address will remain null for now
    };

    // Add the contact person to the customer
    const newContactPerson = new ContactPerson(newContactPersonData);
    customer.contactPersons.push(newContactPerson);
    await customer.save();

    res.status(200).json({
      message: "Contact person successfully added to customer",
      customer,
    });
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errorMessages = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({ errors: errorMessages });
    }
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Update an existing address
 * @route PUT /customers/addresses/:addressId
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<any>} - Updated address or error message
 */
export const updateAddress = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { customerId, addressId } = req.params;
  const updatedAddressData = req.body;

  try {
    // Find customer by customerId
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Find the address by addressId
    const addressIndex = customer.addresses.findIndex(
      (address: any) => address._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Update the found address
    customer.addresses[addressIndex] = {
      ...customer.addresses[addressIndex].toObject(),
      ...updatedAddressData,
    };

    // Save the changes
    await customer.save();

    res.status(200).json({ message: "Address successfully updated", customer });
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errorMessages = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({ errors: errorMessages });
    }
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * @desc Delete an address, ensuring conditions are met:
 * - The customer must have at least one remaining address.
 * - Contact persons linked to the address must be updated.
 * @route DELETE /customers/:customerId/addresses/:addressId
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<any>} - Success message or error message
 */
export const deleteAddress = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { customerId, addressId } = req.params;

  try {
    // Find the customer by customerId
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Check if the customer has more than one address
    if (customer.addresses.length <= 1) {
      return res
        .status(400)
        .json({ message: "At least one address must exist" });
    }

    // Remove the address from the customer's address list
    customer.addresses = customer.addresses.filter(
      (address: any) => address._id.toString() !== addressId
    );

    // Update contact persons linked to the deleted address
    customer.contactPersons.forEach((contact: any) => {
      if (contact.address?.toString() === addressId) {
        contact.address = null; // Remove the address binding
      }
    });

    // Save the changes in the customer
    await customer.save();

    res.status(200).json({ message: "Address successfully deleted", customer });
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errorMessages = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({ errors: errorMessages });
    }
    res.status(500).json({ message: "Error while deleting address", error });
  }
};

/**
 * @desc Update an existing contact person
 * @route PUT /customers/contacts/:contactId
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<any>} - Updated contact person or error message
 */
export const updateContactPerson = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { customerId, contactId } = req.params;
  const updatedContactData = req.body;

  try {
    // Find customer by customerId
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Find the contact person by contactId
    const contactIndex = customer.contactPersons.findIndex(
      (contact: any) => contact._id.toString() === contactId
    );

    if (contactIndex === -1) {
      return res.status(404).json({ message: "Contact person not found" });
    }

    // Update the found contact person
    customer.contactPersons[contactIndex] = {
      ...customer.contactPersons[contactIndex].toObject(),
      ...updatedContactData,
    };

    // Save the changes
    await customer.save();

    res
      .status(200)
      .json({ message: "Contact person successfully updated", customer });
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errorMessages = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({ errors: errorMessages });
    }
    res
      .status(500)
      .json({ message: "Error while updating contact person", error });
  }
};

/**
 * @desc Delete a contact person, ensuring conditions are met:
 * - The customer must have at least one remaining contact person.
 * - If only one contact person exists, it cannot be deleted.
 * @route DELETE /customers/:customerId/contacts/:contactId
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<any>} - Success message or error message
 */
export const deleteContactPerson = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { customerId, contactId } = req.params;

  try {
    // Find customer
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Check if the customer has more than one contact person
    if (customer.contactPersons.length <= 1) {
      return res
        .status(400)
        .json({ message: "At least one contact person must exist" });
    }

    // Remove the contact person from the list of contact persons
    customer.contactPersons = customer.contactPersons.filter(
      (contact: any) => contact._id.toString() !== contactId
    );

    // Save the changes in the customer
    await customer.save();

    res
      .status(200)
      .json({ message: "Contact person successfully deleted", customer });
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errorMessages = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({ errors: errorMessages });
    }
    res
      .status(500)
      .json({ message: "Error while deleting contact person", error });
  }
};

/**
 * @desc Delete a customer including addresses and contact persons
 * @route DELETE /customers/:customerId
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<any>} - Success message or error message
 */
export const deleteCustomer = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { customerId } = req.params;
  try {
    // Find the customer by ID
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ msg: "Customer not found" });
    }

    // Delete associated addresses
    await Address.deleteMany({ _id: { $in: customer.addresses } });

    // Delete associated contact persons
    await ContactPerson.deleteMany({ _id: { $in: customer.contactPersons } });

    // Finally, delete the customer
    await Customer.findByIdAndDelete(customerId);

    res
      .status(200)
      .json({ msg: "Customer and associated data deleted successfully" });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ msg: "Server error" });
  }
};
