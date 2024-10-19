import { Router } from "express";
import multer from "multer";
import { importCustomers } from "../controllers/import.controller";
import * as path from "path";

const router = Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.resolve(__dirname, "..", "..", "uploads");
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 512 * 1024 }, // 512KB in Bytes
}).single("file");

/**
 * @route POST /import/customers
 * @desc Import customers from a CSV file
 */
router.post(
  "/customers",
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .json({ msg: "File too large. Maximum size is 512KB." });
        }
        return res
          .status(500)
          .json({ msg: "File upload error", error: err.message });
      }
      next(); // Go to next controller
    });
  },
  importCustomers
);

export default router;
