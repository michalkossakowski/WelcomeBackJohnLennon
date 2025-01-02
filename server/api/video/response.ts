import fs from 'fs/promises';
import { sendCallResponse } from '../../websocket';

export default defineEventHandler(async (event) =>{
    try{
        const body = await readBody(event);
        return sendCallResponse( body.from,body.to,body.response);
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `Call response Error: ${error}`,
        });
    }
    
});