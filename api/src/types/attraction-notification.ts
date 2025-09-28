import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { attractionNotification } from '../db/schema';

export type AttractionNotification = InferInsertModel<typeof attractionNotification>
export type AttractionNotificationSelect = InferSelectModel<typeof attractionNotification>