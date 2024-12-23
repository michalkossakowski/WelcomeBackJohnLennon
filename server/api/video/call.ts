import fs from 'fs/promises';
import { sendCallNotification } from '../../websocket';

export default defineEventHandler(async (event) =>{
    try{
        const body = await readBody(event);
        sendCallNotification( body.callerId,body.calleeId);
        return {
            status: 'success',
            message: 'Call started',
        };
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `Message add error: ${error}`,
        });
    }
    
});