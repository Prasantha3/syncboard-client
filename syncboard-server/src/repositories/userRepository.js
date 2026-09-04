import { User } from '../models/User.js';

export async function findUserByEmail(email) {
  return await User.findOne({ email });
}

export async function findUserById(id) {
  return await User.findById(id);
}

export async function createUser(userData) {
  return await User.create(userData);
}

export async function updateUser(id, updates) {
  return await User.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
}

export async function deleteUser(id) {
  return await User.findByIdAndDelete(id);
}