import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InviteDocument = Invite & Document;

@Schema({ timestamps: true })
export class Invite {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  role: 'admin' | 'member';

  @Prop({ required: true, default: 'pending' })  // Default status: pending
  status: 'pending' | 'completed';

  @Prop({ default: Date.now })
  created_at: Date;
}

export const InviteSchema = SchemaFactory.createForClass(Invite);
