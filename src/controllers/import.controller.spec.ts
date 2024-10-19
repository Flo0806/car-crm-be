import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import path from "path";
import fs from "fs";
import app from "../server"; // Express server
import Customer from "../models/customer.model";

// Mocking Mongoose model and csv-parser
vi.mock("../models/customer.model");
vi.mock("csv-parser");
vi.mock("fs");

describe("Customer Import", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reset mock data between tests
  });

  /**
   * Test for missing file in request
   */
  it("should return 400 if no file is uploaded", async () => {
    const res = await request(app).post("/import/customers");

    expect(res.status).toBe(400);
    expect(res.body.msg).toBe("No file uploaded");
  });

  /**
   * Test for importing customers with a valid CSV file
   */
  it("should import customers successfully", async () => {
    // Mock fs.createReadStream to simulate reading the CSV file
    const mockStream = {
      pipe: vi.fn().mockReturnThis(),
      on: vi.fn((event, callback) => {
        if (event === "data") {
          // Simulate CSV data row
          callback({
            intNr: "K-0002",
            type: "Individual",
            contactPersons: JSON.stringify([]),
            addresses: JSON.stringify([]),
          });
        }
        if (event === "end") {
          // Simulate the end of the CSV stream
          callback();
        }
        return mockStream; // Explicitly return mockStream instead of this
      }),
    };

    vi.spyOn(fs, "createReadStream").mockReturnValue(mockStream as any);

    // Mock for Customer.findOne: No duplicate found
    vi.spyOn(Customer, "findOne").mockResolvedValueOnce(null);

    // Mock for Customer.save: Simulate saving the customer
    Customer.prototype.save = vi.fn().mockResolvedValue(true);

    const csvData = `intNr,type,contactPersons,addresses
  K-0002,Individual,[],[]`;

    const res = await request(app)
      .post("/import/customers")
      .attach("file", Buffer.from(csvData), "test.csv"); // Simulate file upload using buffer

    expect(res.status).toBe(200);
    expect(res.body.msg).toBe("Customers imported successfully");
    expect(res.body.skipped).toBe(null); // No skipped customers
  });

  /**
   * Test for skipping customers with existing intNr
   */
  it("should skip customers with existing intNr", async () => {
    // Mock fs.createReadStream to simulate reading the CSV file
    const mockStream = {
      pipe: vi.fn().mockReturnThis(),
      on: vi.fn((event, callback) => {
        if (event === "data") {
          // Simulate CSV data row
          callback({
            intNr: "K-0002",
            type: "Individual",
            contactPersons: JSON.stringify([]),
            addresses: JSON.stringify([]),
          });
        }
        if (event === "end") {
          // Simulate the end of the CSV stream
          callback();
        }
        return mockStream; // Explicitly return mockStream for chaining
      }),
    };

    vi.spyOn(fs, "createReadStream").mockReturnValue(mockStream as any);

    // Mock for Customer.findOne: Duplicate found, skipping customer
    vi.spyOn(Customer, "findOne").mockResolvedValueOnce({ intNr: "K-0002" });

    // Mock for Customer.save: Should not be called since we are skipping
    const saveSpy = vi.spyOn(Customer.prototype, "save");

    const csvData = `intNr,type,contactPersons,addresses
  K-0002,Individual,[],[]`;

    const res = await request(app)
      .post("/import/customers")
      .attach("file", Buffer.from(csvData), "test.csv"); // Simulate file upload using buffer

    expect(res.status).toBe(200);
    expect(res.body.msg).toBe("Customers imported successfully");
    expect(res.body.skipped).toBe("Skipped customers with intNr: K-0002");

    // Ensure that save() was never called
    expect(saveSpy).not.toHaveBeenCalled();
  });
});
