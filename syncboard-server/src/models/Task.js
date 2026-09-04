import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    columnId: { type: mongoose.Schema.Types.ObjectId },
    title: { type: String, required: true, trim: true, minlength: 3 },
    description: { type: String, default: '' },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['todo', 'doing', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
    dueDate: { type: Date, default: null },
    position: { type: Number, default: 0 },
    version: { type: Number, default: 0 }, // Concurrency control
  },
  { timestamps: true }
);

// Compound indexes for query performance (Step 3)
taskSchema.index({ boardId: 1, status: 1, position: 1 }); // Board view query
taskSchema.index({ boardId: 1, dueDate: 1 });             // Overdue tasks query
taskSchema.index({ assigneeId: 1, status: 1 });           // "My tasks" query

export const Task = mongoose.model('Task', taskSchema);