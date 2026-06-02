import mongoose, { Document, Schema } from 'mongoose';

export interface IShopItem extends Document {
  guildId: string;
  name: string;
  description: string;
  price: number;
  type: 'role' | 'nitro' | 'other';
  roleId?: string; // If type is role
}

const shopItemSchema = new Schema<IShopItem>({
  guildId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['role', 'nitro', 'other'], required: true },
  roleId: { type: String },
});

export const ShopItem = mongoose.model<IShopItem>('ShopItem', shopItemSchema);
