import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";

export const attraction = sqliteTable('attraction', {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    apiCode: text().notNull().unique(),
    themeparkId: integer().notNull().references(() => themepark.id)
})

export const attractionNotification = sqliteTable('attraction_notification', {
    id: integer().primaryKey({ autoIncrement: true}),
    userId: integer().notNull().references(() => user.id),
    attractionId: integer().notNull().references(() => attraction.id),
    notificationMethodId: integer().notNull().references(() => notificationMethod.id)
})

export const logbook = sqliteTable('logbook', {
    id: integer().primaryKey({ autoIncrement: true }),
    userId: integer().notNull().references(() => user.id),
    attractionId: integer().notNull().references(() => attraction.id),
    timestamp: integer().notNull(), // unix timecode
    expectedWaittime: integer(),
    realWaittime: integer()
})

export const notificationMethod = sqliteTable('notification', {
    id: integer().primaryKey({ autoIncrement: true }),
    webhookUrl: text().notNull(),
    shownName: text().notNull(),
    userId: integer().notNull().references(() => user.id)
})

export const themepark = sqliteTable('themepark', {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    countrycode: text().notNull(),
    website: text(),
    apiName: text().notNull().unique()
})

export const user = sqliteTable('user', {
    id: integer().primaryKey({ autoIncrement: true }),
    username: text().notNull(),
    isActive: integer({ mode: 'boolean' }).default(false)
})