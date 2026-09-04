import { Board } from '../models/Board.js';

export async function findBoardById(id) {
  return await Board.findById(id);
}

export async function findBoardsByUserId(userId) {
  return await Board.find({
    $or: [{ ownerId: userId }, { 'members.userId': userId }],
  }).sort({ createdAt: -1 });
}

export async function createBoard(boardData) {
  return await Board.create(boardData);
}

export async function updateBoard(id, updates) {
  return await Board.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
}

export async function deleteBoard(id) {
  return await Board.findByIdAndDelete(id);
}