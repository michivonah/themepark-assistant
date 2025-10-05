import { check, integer, text, sqliteTable, sqliteView, unique } from "drizzle-orm/sqlite-core";
import { eq, sql } from "drizzle-orm";

// Tables
export const attraction = sqliteTable('attraction', {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    apiCode: text('api_code').notNull().unique(),
    themeparkId: integer('themepark_id').notNull().references(() => themepark.id)
}, (t) => [
    unique().on(t.apiCode, t.themeparkId)
])

export const attractionNotification = sqliteTable('attraction_notification', {
    id: integer().primaryKey({ autoIncrement: true}),
    userId: integer('user_id').notNull().references(() => user.id),
    attractionId: integer('attraction_id').notNull().references(() => attraction.id),
    notificationMethodId: integer('notification_method_id').notNull().references(() => notificationMethod.id)
}, (t) => [
    unique().on(t.userId, t.attractionId, t.notificationMethodId)
])

export const logbook = sqliteTable('logbook', {
    id: integer().primaryKey({ autoIncrement: true }),
    userId: integer('user_id').notNull().references(() => user.id),
    attractionId: integer('attraction_id').notNull().references(() => attraction.id),
    timestamp: integer().notNull(), // unix timecode
    expectedWaittime: integer(),
    realWaittime: integer()
}, (t) => [
    unique().on(t.userId, t.attractionId, t.timestamp)
])

export const notificationMethod = sqliteTable('notification_method', {
    id: integer().primaryKey({ autoIncrement: true }),
    webhookUrl: text('webhook_url').notNull(),
    shownName: text().notNull(),
    userId: integer('user_id').notNull().references(() => user.id),
    notificationProviderId: integer('notification_provider_id').notNull().references(() => notificationProvider.id),
}, (t) => [
    unique().on(t.webhookUrl, t.userId, t.notificationProviderId)
])

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
    mail: text().notNull().unique(),
    isActive: integer({ mode: 'boolean' }).notNull().default(false),
    createdAt: integer().notNull(),
    lastActive: integer().notNull()
},
(table) => [
    check("mail_validation", sql`${table.mail} LIKE '%@%'`)
]
)

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