import { getDbContext, getDbEnv } from '../db/client'
import { notificationMethod } from '../db/schema';
import { NotificationMethodSelect } from '../types/notification-method'
import { DatabaseError, InvalidParameter } from '../errors'
import { eq } from 'drizzle-orm';

type NotificationMethodUser = Pick<NotificationMethodSelect, "userId">;

/**
 * Checks if a specified user is the owner of a notification method and returns the owner if valid
 * @param db DB connection (already defined as variable/const)
 * @param methodId notificationMethodId to check
 * @param userId User to check wheter it is the owner
 * @returns Object with the owners userId
 */
export async function getNotificationMethodOwner(db: ReturnType<typeof getDbContext | typeof getDbEnv>, methodId: number, userId: number): Promise<NotificationMethodUser>{
    try{
        const method = await db.select({
            userId: notificationMethod.userId
        }).from(notificationMethod)
        .where(eq(notificationMethod.id, methodId)).get();
        
        if(!method || method.userId !== userId) throw new InvalidParameter('notificationMethodId');
        else return method;
    }
    catch(e){
        if(e instanceof InvalidParameter) throw e;
        throw new DatabaseError();
    }
}