import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    // unique: true here automatically creates the unique index on email
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Transform: runs when document is serialized to JSON (Step 1)
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.passwordHash; // Strips passwordHash automatically
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);