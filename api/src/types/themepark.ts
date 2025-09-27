import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { themepark } from '../db/schema';

export type Themepark = InferInsertModel<typeof themepark>
export type ThemeparkSelect = InferSelectModel<typeof themepark>