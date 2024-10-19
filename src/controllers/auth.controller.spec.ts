import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import app from "../server"; // Express server
import User from "../models/user.model";
import Token from "../models/token.model";

// Mock bcryptjs, jsonwebtoken, and mongoose models
vi.mock("bcryptjs");
vi.mock("jsonwebtoken");
vi.mock("../models/user.model");
vi.mock("../models/token.model");

describe("AuthController - Login", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reset mock data between tests
  });

  it("should return 404 if user is not found", async () => {
    // Mock User.findOne: User not found
    vi.spyOn(User, "findOne").mockResolvedValueOnce(null); // User not found

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nonexistent@example.com", password: "123456" });

    expect(res.status).toBe(404);
    expect(res.body.msg).toBe("User not found");
  });

  it("should return 400 if password is incorrect", async () => {
    // Mock User.findOne: User found
    vi.spyOn(User, "findOne").mockReturnValueOnce({
      exec: vi
        .fn()
        .mockResolvedValue({ _id: "123", passwordHash: "hashedpassword" }), // Mock the exec method
    } as any);

    // Mock bcrypt.compare: Password does not match
    bcrypt.compare = vi.fn().mockResolvedValue(false);

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "user@example.com", password: "wrongpassword" });

    expect(res.status).toBe(400);
    expect(res.body.msg).toBe("Invalid credentials");
  });

  it("should return access token and refresh token on successful login", async () => {
    // Mock User.findOne: User found
    vi.spyOn(User, "findOne").mockReturnValueOnce({
      exec: vi
        .fn()
        .mockResolvedValue({ _id: "123", passwordHash: "hashedpassword" }), // Mock the exec method
    } as any);

    // Mock bcrypt.compare: Password is correct
    bcrypt.compare = vi.fn().mockResolvedValue(true);

    // Use vi.spyOn instead of vi.mock for jwt.sign
    vi.spyOn(jwt, "sign")
      .mockReturnValueOnce("access-token" as any)
      .mockReturnValueOnce("refresh-token" as any);

    // Mock Token.save: Save the token
    Token.prototype.save = vi.fn().mockResolvedValue(true);

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "user@example.com", password: "correctpassword" });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe("access-token");
    expect(res.body.refreshToken).toBe("refresh-token");
  });

  it("should return 400 if email is missing", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ password: "somepassword" });

    expect(res.status).toBe(400);
    expect(res.body.msg).toBe("Email is required");
  });

  it("should return 400 if password is missing", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "user@example.com" });

    expect(res.status).toBe(400);
    expect(res.body.msg).toBe("Password is required");
  });

  it("should return new access token on valid refresh token", async () => {
    // Mock for Token.findOne: Refresh token found
    vi.spyOn(Token, "findOne").mockResolvedValueOnce({
      token: "valid-refresh-token",
      userId: "123",
    });

    // Mock for jwt.verify: Valid refresh token
    vi.spyOn(jwt, "verify").mockReturnValueOnce({ userId: "123" } as any);

    // Mock for jwt.sign: Generate new access token
    vi.spyOn(jwt, "sign").mockReturnValueOnce("new-access-token" as any);

    const res = await request(app)
      .post("/auth/token")
      .send({ token: "valid-refresh-token" });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe("new-access-token");
  });

  it("should return 403 if refresh token is missing", async () => {
    const res = await request(app).post("/auth/token").send({ token: "" });

    expect(res.status).toBe(403);
    expect(res.body.msg).toBe("Refresh token required");
  });

  it("should return 403 if refresh token is invalid", async () => {
    // Mock for Token.findOne: Refresh token not found
    vi.spyOn(Token, "findOne").mockResolvedValueOnce(null);

    const res = await request(app)
      .post("/auth/token")
      .send({ token: "invalid-refresh-token" });

    expect(res.status).toBe(403);
    expect(res.body.msg).toBe("Invalid refresh token");
  });

  it("should logout user and delete refresh token", async () => {
    // Mock for Token.findOneAndDelete: Refresh token deleted
    vi.spyOn(Token, "findOneAndDelete").mockResolvedValueOnce(true);

    const res = await request(app)
      .post("/auth/logout")
      .send({ token: "valid-refresh-token" });

    expect(res.status).toBe(200);
    expect(res.body.msg).toBe("Logout successful");
  });

  it("should return 400 if token is missing during logout", async () => {
    const res = await request(app).post("/auth/logout").send({ token: "" });

    expect(res.status).toBe(400);
    expect(res.body.msg).toBe("Token is required for logout");
  });
});
