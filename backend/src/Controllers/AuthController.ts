import { Request, Response } from 'express';
import User, { IUser } from '../Models/User';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("dfg");
    
    const {name, email, password, role } = req.body;
    const existingUser: IUser | null = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const newUser = new User({name, email, password, role });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }
    res.json({  role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
