import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../server"; // Express server
import Customer from "../models/customer.model";

// Mock mongoose models
vi.mock("../models/customer.model");

describe("CustomerController", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reset mock data between tests
  });

  /**
   * Test for GET /customers
   */
  it("should return a list of customers", async () => {
    // Mock for Customer.find: Returning a list of customers
    vi.spyOn(Customer, "find").mockResolvedValueOnce([
      {
        intNr: "K-0001",
        type: "Individual",
        contactPersons: [],
        addresses: [],
      },
      { intNr: "K-0002", type: "Company", contactPersons: [], addresses: [] },
    ]);

    const res = await request(app).get("/customers");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].intNr).toBe("K-0001");
  });

  /**
   * Test for POST /customers
   */
  it("should create a new customer", async () => {
    // Mock for Customer.findOne: Finding the highest intNr
    vi.spyOn(Customer, "findOne").mockReturnValueOnce({
      sort: vi.fn().mockResolvedValueOnce({ intNr: "K-0001" }),
    } as any);

    // Mock for Customer.save: Save the new customer
    Customer.prototype.save = vi.fn().mockResolvedValue({
      intNr: "K-0002",
      type: "Individual",
      contactPersons: [],
      addresses: [],
    });

    const res = await request(app)
      .post("/customers")
      .send({ type: "Individual", contactPersons: [], addresses: [] });

    expect(res.status).toBe(200);
    expect(res.body.intNr).toBe("K-0002");
  });

  /**
   * Test for PUT /customers/:id
   */
  it("should update an existing customer", async () => {
    // Mock for Customer.findById: Customer exists
    vi.spyOn(Customer, "findById").mockResolvedValueOnce({
      _id: "123",
      intNr: "K-0001",
      type: "Individual",
      contactPersons: [],
      addresses: [],
    });

    // Mock for Customer.findByIdAndUpdate: Updating customer
    vi.spyOn(Customer, "findByIdAndUpdate").mockResolvedValueOnce({
      _id: "123",
      intNr: "K-0001", // intNr should remain unchanged
      type: "Company",
      contactPersons: [],
      addresses: [],
    });

    const res = await request(app)
      .put("/customers/123")
      .send({ type: "Company", contactPersons: [], addresses: [] });

    expect(res.status).toBe(200);
    expect(res.body.type).toBe("Company");
    expect(res.body.intNr).toBe("K-0001"); // intNr stays the same
  });

  /**
   * Test for DELETE /customers/:id
   */
  it("should delete a customer", async () => {
    // Mock for Customer.findByIdAndDelete: Customer exists and is deleted
    vi.spyOn(Customer, "findByIdAndDelete").mockResolvedValueOnce({
      _id: "123",
      intNr: "K-0001",
      type: "Individual",
    });

    const res = await request(app).delete("/customers/123");

    expect(res.status).toBe(200);
    expect(res.body.msg).toBe("Customer deleted");
  });

  /**
   * Test for DELETE /customers/:id when customer not found
   */
  it("should return 404 if customer is not found", async () => {
    // Mock for Customer.findByIdAndDelete: Customer not found
    vi.spyOn(Customer, "findByIdAndDelete").mockResolvedValueOnce(null);

    const res = await request(app).delete("/customers/123");

    expect(res.status).toBe(404);
    expect(res.body.msg).toBe("Customer not found");
  });
});
