import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { logbook } from '../db/schema';

export type Logbook = InferInsertModel<typeof logbook>
export type LogbookSelect = InferSelectModel<typeof logbook>