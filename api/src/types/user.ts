import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { user } from '../db/schema';

export type User = InferInsertModel<typeof user>
export type UserSelect = InferSelectModel<typeof user>