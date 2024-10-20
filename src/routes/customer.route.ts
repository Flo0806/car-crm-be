import { Router } from "express";
import {
  addAddressToCustomer,
  changeAddress,
  createCustomer,
  deleteCustomer,
  getAllCustomers,
  getCustomerById,
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
 * @route GET /customers/:id
 * @desc Get all customers
 * @access Public
 */
router.get("/:customerId", getCustomerById);

/**
 * @route POST /customers
 * @desc Create a new customer
 */
router.post("/", createCustomer);

router.put("/:id/address", addAddressToCustomer);

router.put("/:customerId/addresses/:addressId", changeAddress);

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
