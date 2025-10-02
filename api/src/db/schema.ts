import { integer, text, sqliteTable, sqliteView } from "drizzle-orm/sqlite-core";
import { eq, sql } from "drizzle-orm";

// Tables
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

export const notificationMethod = sqliteTable('notification_method', {
    id: integer().primaryKey({ autoIncrement: true }),
    webhookUrl: text().notNull(),
    shownName: text().notNull(),
    userId: integer().notNull().references(() => user.id),
    notificationProviderId: integer().notNull().references(() => notificationProvider.id),
})

export const notificationProvider = sqliteTable('notification_provider', {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull().unique()
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

// Views
export const subscribedThemeparks = sqliteView('subscribed_themeparks').as((qb) =>
    qb.selectDistinct({
        apiName: sql<string>`themepark.api_name`.as('api_name')
    }).from(attractionNotification)
    .innerJoin(attraction, eq(attractionNotification.attractionId, attraction.id))
    .innerJoin(themepark, eq(attraction.themeparkId, themepark.id))
);

export const attractionSubscriptions = sqliteView('attraction_subscriptions').as((qb) =>
    qb.selectDistinct({
        attractionApiCode: sql<string>`attraction.api_code`.as('attraction_api_code'),
        themeparkApiName: sql<string>`themepark.api_name`.as('themepark_api_name'),
        webhookUrl: sql<string>`notification_method.webhook_url`.as('webhook_url'),
        notificationProviderName: sql<string>`notification_provider.name`.as('notification_provider_name'),
    }).from(attractionNotification)
    .innerJoin(attraction, eq(attractionNotification.attractionId, attraction.id))
    .innerJoin(themepark, eq(attraction.themeparkId, themepark.id))
    .innerJoin(notificationMethod, eq(attractionNotification.notificationMethodId, notificationMethod.id))
    .innerJoin(notificationProvider, eq(notificationMethod.notificationProviderId, notificationProvider.id))
);