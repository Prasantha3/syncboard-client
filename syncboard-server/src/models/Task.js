import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    columnId: { type: mongoose.Schema.Types.ObjectId },
    title: { type: String, required: true, trim: true, minlength: 3 },
    description: { type: String, default: '' },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: ['todo', 'doing', 'done'],
      default: 'todo',
      set: (val) => {
        if (!val) return 'todo';
        const clean = val.toLowerCase().trim().replace(/\s+/g, '-');
        
        // Map frontend status variations to database enum values
        if (clean === 'to-do' || clean === 'todo') return 'todo';
        if (clean === 'in-progress' || clean === 'doing') return 'doing';
        if (clean === 'done') return 'done';
        
        return clean;
      },
    },
    priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
    dueDate: { type: Date, default: null },
    position: { type: Number, default: 0 },
    version: { type: Number, default: 0 }, // Concurrency control
  },
  { timestamps: true }
);

// Compound indexes for query performance
taskSchema.index({ boardId: 1, status: 1, position: 1 });
taskSchema.index({ boardId: 1, dueDate: 1 });
taskSchema.index({ assigneeId: 1, status: 1 });

export const Task = mongoose.model('Task', taskSchema);