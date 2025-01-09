import fs from 'fs/promises';
import { sendCallCancelation } from '../../websocket';

export default defineEventHandler(async (event) =>{
    try{
        const body = await readBody(event);
        return sendCallCancelation( body.callerId,body.calleeId);
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `Call error: ${error}`,
        });
    }
    
});