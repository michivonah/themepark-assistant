import { attractionSubscriptions } from '../db/schema';

export type AttractionSubscription = typeof attractionSubscriptions.$inferSelect;