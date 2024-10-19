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
  const { intNr, type, contactPersons, addresses } = req.body;

  try {
    const newCustomer = new Customer({
      intNr,
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
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { intNr, type, contactPersons, addresses },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ msg: "Customer not found" });
    }

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
