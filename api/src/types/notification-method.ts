import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { notificationMethod } from '../db/schema';

export type NotificationMethod = InferInsertModel<typeof notificationMethod>
export type NotificationMethodSelect = InferSelectModel<typeof notificationMethod>