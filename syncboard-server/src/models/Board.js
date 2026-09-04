import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  position: { type: Number, required: true, default: 0 },
});

const memberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'editor' },
});

const boardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [memberSchema],
    columns: [columnSchema],
  },
  { timestamps: true }
);

export const Board = mongoose.model('Board', boardSchema);