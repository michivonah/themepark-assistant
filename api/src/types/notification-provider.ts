import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { notificationProvider } from '../db/schema';

export type NotificationProvider = InferInsertModel<typeof notificationProvider>
export type NotificationProviderSelect = InferSelectModel<typeof notificationProvider>