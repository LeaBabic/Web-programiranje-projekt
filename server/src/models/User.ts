import mongoose, { Schema, InferSchemaType, HydratedDocument } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    phone: { type: String, default: '' },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: 'Hrvatska' },
    },
  },
  { timestamps: true },
);

type Timestamps = { createdAt: Date; updatedAt: Date };
export type UserDoc = HydratedDocument<InferSchemaType<typeof userSchema> & Timestamps>;

export function publicUser(user: UserDoc) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    createdAt: user.createdAt,
  };
}

export const User = mongoose.model('User', userSchema);
