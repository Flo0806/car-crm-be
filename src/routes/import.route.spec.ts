import request from "supertest";
import express from "express";
import importRouter from "../routes/import.route";
import { vi, describe, it, expect, beforeEach } from "vitest";

beforeEach(() => {
  // Reset mocks and modules
  vi.resetModules();

  // Mock multer
  vi.mock("multer", () => {
    const single = vi.fn(
      (fieldname: any) => (req: any, res: any, next: any) => {
        // Set req.file based on custom headers
        req.file = {
          originalname: req.headers["mock-file-originalname"] || "test.csv",
          size: parseInt(req.headers["mock-file-size"] as string) || 600 * 1024,
          path: req.headers["mock-file-path"] || "uploads/test.csv",
        };

        // Check for errors from the headers
        const mockErrorCode = req.headers["mock-error-code"];
        const mockErrorMessage = req.headers["mock-error-message"];

        if (mockErrorCode && mockErrorMessage) {
          const error: any = new Error(mockErrorMessage);
          error.code = mockErrorCode;
          return next(error);
        }

        next();
      }
    );

    const diskStorage = vi.fn(() => ({
      destination: vi.fn((req, file, cb) => cb(null, "uploads")),
      filename: vi.fn((req, file, cb) => cb(null, file.originalname)),
    }));

    const multerMock = () => ({
      single,
      diskStorage: diskStorage(),
    });

    multerMock.diskStorage = diskStorage;

    return {
      default: multerMock,
      diskStorage,
    };
  });
});

describe("POST /import/customers", () => {
  it("should return 400 if file size exceeds limit (512KB)", async () => {
    let app = express();
    app.use(express.json());
    app.use("/import", importRouter);

    // Simulate a file size over the limit and set req.file properties via headers
    const res = await request(app)
      .post("/import/customers")
      .attach("file", Buffer.from("Some content"), "test.csv")
      .set("mock-file-originalname", "large_test.csv")
      .set("mock-file-size", "600000") // 600KB
      .set("mock-file-path", "uploads/large_test.csv")
      .set("mock-error-code", "LIMIT_FILE_SIZE")
      .set("mock-error-message", "File too large");

    expect(res.status).toBe(400);
    expect(res.body.msg).toBe("File too large. Maximum size is 512KB.");
  });

  it("should return 500 for general file upload error", async () => {
    let app = express();
    app.use(express.json());
    app.use("/import", importRouter);

    // Simulate a general error and set req.file properties via headers
    const res = await request(app)
      .post("/import/customers")
      .attach("file", Buffer.from("Some content"), "test.csv")
      .set("mock-file-originalname", "error_test.csv")
      .set("mock-file-size", "100000") // 100KB
      .set("mock-file-path", "uploads/error_test.csv")
      .set("mock-error-code", "UNKNOWN_ERROR")
      .set("mock-error-message", "Unknown error");

    expect(res.status).toBe(500);
    expect(res.body.msg).toBe("File upload error");
  });
});
