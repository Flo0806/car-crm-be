import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";

/**
 * @desc Create a new user
 * @route POST /users
 */
export const createUser = async (req: Request, res: Response): Promise<any> => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const newUser = new User({
      firstName,
      lastName,
      email,
      passwordHash: await bcrypt.hash(password, 10),
    });

    const user = await newUser.save();
    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

/**
 * @desc Update an existing user
 * @route PUT /users/:id
 */
export const updateUser = async (req: Request, res: Response): Promise<any> => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        email,
        passwordHash: await bcrypt.hash(password, 10),
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(updatedUser);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

/**
 * @desc Delete a user
 * @route DELETE /users/:id
 */
export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ msg: "User deleted" });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
