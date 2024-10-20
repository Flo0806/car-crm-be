import { Request, Response } from "express";
import {
  ContactPersonType,
  AddressType,
  Address,
  Customer,
} from "../models/customer.model";

//#region Helper
async function generateNextIntNr(): Promise<string> {
  const lastCustomer = await Customer.findOne().sort({ intNr: -1 }).exec();

  if (!lastCustomer || !lastCustomer.intNr) {
    return "K-0001"; // Falls es noch keinen Kunden gibt, mit "K-0001" beginnen
  }

  const lastIntNr = lastCustomer.intNr;
  const currentNumber = parseInt(lastIntNr.split("-")[1], 10);
  const nextNumber = currentNumber + 1;

  // Formatieren der neuen Nummer, z.B. "K-0002"
  return `K-${nextNumber.toString().padStart(4, "0")}`;
}
//#endregion

/**
 * @desc Get all customers
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
    // Suche alle Kunden und populiere die Adressen und Kontaktpersonen
    const customers = await Customer.find()
      .populate("addresses")
      .populate("contactPersons")
      .exec();

    // Erstelle ein flaches Array, in dem jede Adresse und die verknüpfte Kontaktperson eine eigene Zeile darstellt
    const flatCustomerList = customers.reduce((acc: any[], customer) => {
      customer.addresses.forEach((address: any) => {
        // Finde die Kontaktpersonen, die mit dieser Adresse verknüpft sind
        const linkedPersons = customer.contactPersons.filter(
          (person: any) => person.address && person.address.equals(address._id)
        );

        // Falls keine verknüpften Kontaktpersonen vorhanden sind, dennoch eine Zeile für die Adresse hinzufügen
        if (linkedPersons.length === 0) {
          acc.push({
            id: customer._id,
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
          });
        } else {
          // Jede Kontaktperson in eine eigene Zeile einfügen
          linkedPersons.forEach((person: any) => {
            acc.push({
              id: customer._id,
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
            });
          });
        }
      });
      return acc;
    }, []);

    res.status(200).json(flatCustomerList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Get all customers
 * @route GET /customers
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<any>} - List of customers or error message
 */
export const getCustomerById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { customerId } = req.params;

    // Finde den Kunden mit der angegebenen ID und populiere Adressen und Kontaktpersonen
    const customer = await Customer.findById(customerId)
      .populate("addresses") // Adressen auflösen
      .populate("contactPersons") // Kontaktpersonen auflösen
      .exec();

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Kunde zurückgeben
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @desc Create a new customer
 * @route POST /customers
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<any>} - Created customer or error message
 */
export async function createCustomer(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const {
      type,
      contactPersons,
      addresses,
    }: {
      intNr: string;
      type: "DEALER" | "COMPANY" | "PRIVATE";
      contactPersons: Omit<ContactPersonType, "address">[]; // Adresse wird später verknüpft
      addresses: Omit<AddressType, "_id">[]; // Adresse wird gespeichert, also kein _id erwartet
    } = req.body;

    const intNr = await generateNextIntNr();

    // Zuerst die Adressen erstellen und speichern
    const savedAddresses = await Promise.all(
      addresses.map(async (address) => {
        const newAddress = new Address(address);
        return await newAddress.save();
      })
    );

    // Die IDs der gespeicherten Adressen nehmen und bei den Kontaktpersonen verknüpfen
    const updatedContactPersons = contactPersons.map((person) => ({
      ...person,
      address: savedAddresses.length > 0 ? savedAddresses[0]._id : undefined, // Verknüpfe die erste Adresse
    }));

    // Jetzt den neuen Customer erstellen und die Kontaktpersonen und Adressen verknüpfen
    const newCustomer = new Customer({
      intNr,
      type,
      contactPersons: updatedContactPersons,
      addresses: savedAddresses, // Verknüpfe die gespeicherten Adressen
    });

    // Customer-Dokument speichern
    const savedCustomer = await newCustomer.save();

    res.status(201).json(savedCustomer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export const addAddressToCustomer = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params; // Die ID des Kunden aus der URL
    const newAddressData = req.body; // Die neue Adresse aus dem Request Body

    // Überprüfen, ob der Kunde existiert
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Neue Adresse erstellen
    const newAddress = new Address(newAddressData);
    const savedAddress = await newAddress.save();

    // Adresse zum Kunden hinzufügen
    customer.addresses.push(savedAddress);
    await customer.save();

    res.status(200).json({
      message: "Address successfully added to customer",
      customer,
    });
  } catch (error: any) {
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
  const { intNr, type, contactPersons, addresses } = req.body;

  try {
    // Try find the existing customer
    const existingCustomer = await Customer.findById(req.params.id);

    if (!existingCustomer) {
      return res.status(404).json({ msg: "Customer not found" });
    }

    // Update the data, but igrnore the `intNr`! We never should change this number!
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        type,
        contactPersons,
        addresses,
        // intNr will be the same like before
        intNr: existingCustomer.intNr,
      },
      { new: true }
    );

    res.json(updatedCustomer);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

export const changeAddress = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { customerId, addressId } = req.params;
  const updatedAddressData = req.body;

  try {
    // Kunden anhand der customerId suchen
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Die Adresse anhand der addressId finden
    const addressIndex = customer.addresses.findIndex(
      (address: any) => address._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Die gefundene Adresse aktualisieren
    customer.addresses[addressIndex] = {
      ...customer.addresses[addressIndex].toObject(),
      ...updatedAddressData,
    };

    // Änderungen speichern
    await customer.save();

    res.status(200).json({ message: "Address successfully updated", customer });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * @desc Delete a customer
 * @route DELETE /customers/:id
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<any>} - Success message or error message
 */
export const deleteCustomer = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({ msg: "Customer not found" });
    }

    res.json({ msg: "Customer deleted" });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
