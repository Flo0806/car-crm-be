import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../server"; // Express server
import User from "../models/user.model";

// Mocking Mongoose model and bcryptjs
vi.mock("../models/user.model");
vi.mock("bcryptjs");

describe("User Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reset mocks between tests
  });

  /**
   * Test for creating a new user
   */
  it("should create a new user", async () => {
    // Mock bcrypt.hash to return a fake hashed password
    bcrypt.hash = vi.fn().mockResolvedValue("hashedpassword");

    // Mock User.save to simulate saving the user
    User.prototype.save = vi.fn().mockResolvedValue({
      _id: "123",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      passwordHash: "hashedpassword",
    });

    const userData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "password123",
    };

    const res = await request(app).post("/users").send(userData);

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("John");
    expect(res.body.lastName).toBe("Doe");
    expect(res.body.email).toBe("john.doe@example.com");
    expect(res.body.passwordHash).toBe("hashedpassword");
  });

  /**
   * Test for updating an existing user
   */
  it("should update an existing user", async () => {
    // Mock bcrypt.hash to return a fake hashed password
    bcrypt.hash = vi.fn().mockResolvedValue("newhashedpassword");

    // Mock User.findByIdAndUpdate to simulate updating the user
    vi.spyOn(User, "findByIdAndUpdate").mockResolvedValueOnce({
      _id: "123",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      passwordHash: "newhashedpassword",
    });

    const updatedData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "newpassword123",
    };

    const res = await request(app).put("/users/123").send(updatedData);

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("John");
    expect(res.body.lastName).toBe("Doe");
    expect(res.body.email).toBe("john.doe@example.com");
    expect(res.body.passwordHash).toBe("newhashedpassword");
  });

  /**
   * Test for deleting a user
   */
  it("should delete a user", async () => {
    // Mock User.findByIdAndDelete to simulate deleting the user
    vi.spyOn(User, "findByIdAndDelete").mockResolvedValueOnce({
      _id: "123",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
    });

    const res = await request(app).delete("/users/123");

    expect(res.status).toBe(200);
    expect(res.body.msg).toBe("User deleted");
  });

  /**
   * Test for user not found when trying to update
   */
  it("should return 404 if user not found when updating", async () => {
    // Mock User.findByIdAndUpdate to return null (user not found)
    vi.spyOn(User, "findByIdAndUpdate").mockResolvedValueOnce(null);

    const res = await request(app).put("/users/123").send({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "newpassword123",
    });

    expect(res.status).toBe(404);
    expect(res.body.msg).toBe("User not found");
  });

  /**
   * Test for user not found when trying to delete
   */
  it("should return 404 if user not found when deleting", async () => {
    // Mock User.findByIdAndDelete to return null (user not found)
    vi.spyOn(User, "findByIdAndDelete").mockResolvedValueOnce(null);

    const res = await request(app).delete("/users/123");

    expect(res.status).toBe(404);
    expect(res.body.msg).toBe("User not found");
  });
});
