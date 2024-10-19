import { Router } from "express";
import {
  createCustomer,
  deleteCustomer,
  getAllCustomers,
  updateCustomer,
} from "../controllers/customer.controller";

const router = Router();

/**
 * @route GET /customers
 * @desc Get all customers
 * @access Public
 */
router.get("/", getAllCustomers);

/**
 * @route POST /customers
 * @desc Create a new customer
 */
router.post("/", createCustomer);

/**
 * @route PUT /customers/:id
 * @desc Update an existing customer
 */
router.put("/:id", updateCustomer);

/**
 * @route DELETE /customers/:id
 * @desc Delete a customer
 */
router.delete("/:id", deleteCustomer);

export default router;
