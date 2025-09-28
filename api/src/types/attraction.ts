import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { attraction } from '../db/schema';

export type Attraction = InferInsertModel<typeof attraction>
export type AttractionSelect = InferSelectModel<typeof attraction>

// API Response format
export interface AttractionImport {
    code: string,
    name: string,
    waitingtime: number,
    status: "opened" | "virtualqueue" | "maintenance" | "closedice" | "closedweather" | "closed"
}

// Waittime comparison
export interface AttractionChanges {
    apiCode: string,
    name: string,
    waittime: number,
    hasChanged: boolean,
    increased: boolean
}