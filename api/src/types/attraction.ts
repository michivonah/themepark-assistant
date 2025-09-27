import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { attraction } from '../db/schema';

export type Attraction = InferInsertModel<typeof attraction>
export type AttractionSelect = InferSelectModel<typeof attraction>