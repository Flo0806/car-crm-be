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
import { verifyAccessToken } from "../common/middlewares/verify-token.middleware";

const router = Router();

/**
 * @route GET /customers
 * @desc Get all customers
 * @access Public
 */
router.get("/", verifyAccessToken, getAllCustomers);

/**
 * @route GET /customers/:id
 * @desc Get all customers
 * @access Public
 */
router.get("/:customerId", verifyAccessToken, getCustomerById);

/**
 * @route DELETE /customers/:id
 * @desc Delete a customer
 */
router.delete("/:customerId", verifyAccessToken, deleteCustomer);

/**
 * @route POST /customers
 * @desc Create a new customer
 */
router.post("/", verifyAccessToken, createCustomer);

/**
 * @route PUT /customers/:id
 * @desc Update an existing customer
 */
router.put("/:id", updateCustomer);

router.put("/:id/address", verifyAccessToken, addAddressToCustomer);

router.put(
  "/:customerId/addresses/:addressId",
  verifyAccessToken,
  updateAddress
);

router.delete(
  "/:customerId/addresses/:addressId",
  verifyAccessToken,
  deleteAddress
);

router.put(
  "/:customerId/contact",
  verifyAccessToken,
  addContactPersonToCustomer
);

router.put(
  "/:customerId/contacts/:contactId",
  verifyAccessToken,
  updateContactPerson
);

router.delete(
  "/:customerId/contacts/:contactId",
  verifyAccessToken,
  deleteContactPerson
);

export default router;
