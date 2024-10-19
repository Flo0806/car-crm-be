import { Request, Response } from "express";
import Customer from "../models/customer.model";

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
): Promise<any> => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server error");
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
export const createCustomer = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { type, contactPersons, addresses } = req.body;

  try {
    // Find the highest intNr in the db
    const lastCustomer = await Customer.findOne().sort({ intNr: -1 });

    let newIntNr: string;

    if (lastCustomer) {
      // Extract the numeric part of intNr (e.g. "K-0002" -> 2)
      const lastIntNrNum = parseInt(lastCustomer.intNr.split("-")[1], 10);

      // Increment the number add format it back to a string (e.g. 2 -> "K-0003")
      newIntNr = `K-${String(lastIntNrNum + 1).padStart(4, "0")}`;
    } else {
      // No customer? Start with 1
      newIntNr = "K-0001";
    }

    // Generate the customer
    const newCustomer = new Customer({
      intNr: newIntNr,
      type,
      contactPersons,
      addresses,
    });

    const customer = await newCustomer.save();
    res.json(customer);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server error");
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
