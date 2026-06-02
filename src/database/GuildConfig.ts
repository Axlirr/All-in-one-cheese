import mongoose, { Document, Schema } from 'mongoose';

export interface IGuildConfig extends Document {
  guildId: string;
  aiPersona: string;
}

const guildConfigSchema = new Schema<IGuildConfig>({
  guildId: { type: String, required: true, unique: true },
  aiPersona: { type: String, default: "You are a helpful Discord bot agent. You have the ability to manage the server using tools. When asked to do something, use your tools if appropriate." }
});

export const GuildConfig = mongoose.model<IGuildConfig>('GuildConfig', guildConfigSchema);
