import { Request, Response } from "express";
import csvParser from "csv-parser";
import Customer from "../models/customer.model";
import fs from "fs";
import path from "path";

/**
 * @desc Import customers from a CSV file
 * @route POST /import/customers
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<any>} - Success or error message
 */
export const importCustomers = async (
  req: Request,
  res: Response
): Promise<any> => {
  const results: any[] = [];
  const skippedCustomers: string[] = []; // For skipped customers

  try {
    // Is a file available?
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const filePath = path.resolve(
      __dirname,
      "..",
      "..",
      "uploads",
      req.file.filename
    );

    // Parsing the CSV file
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        for (const customerData of results) {
          const { intNr, type, contactPersons, addresses } = customerData;

          // Check if `intNr` already exists in db
          const existingCustomer = await Customer.findOne({ intNr });
          if (existingCustomer) {
            // Is? Skip it!
            skippedCustomers.push(intNr);
            continue;
          }

          // Save the new customer into db
          const newCustomer = new Customer({
            intNr,
            type,
            contactPersons: JSON.parse(contactPersons),
            addresses: JSON.parse(addresses),
          });

          await newCustomer.save();
        }

        // We wanna return the result, including the skipped customers
        res.json({
          msg: "Customers imported successfully",
          skipped: skippedCustomers.length
            ? `Skipped customers with intNr: ${skippedCustomers.join(", ")}`
            : null,
        });
      });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
