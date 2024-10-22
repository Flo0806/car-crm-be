import { Router } from "express";
import {
  addAddressToCustomer,
  updateAddress,
  updateContactPerson,
  createCustomer,
  deleteAddress,
  deleteContactPerson,
  deleteCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  addContactPersonToCustomer,
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

router.put("/:customerId/addresses/:addressId", updateAddress);

router.delete("/:customerId/addresses/:addressId", deleteAddress);

router.put("/:customerId/contact", addContactPersonToCustomer);

router.put("/:customerId/contacts/:contactId", updateContactPerson);

router.delete("/:customerId/contacts/:contactId", deleteContactPerson);

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
