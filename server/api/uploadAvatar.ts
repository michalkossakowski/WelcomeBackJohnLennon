import { writeFile, mkdir } from 'fs/promises';
import { defineEventHandler, readBody, createError } from 'h3';
import { randomUUID } from 'crypto';
import path from 'path';

export default defineEventHandler(async (event) => {
    try{
        const formData = await readMultipartFormData(event);
        if (!formData || !formData[0]) {
            throw new Error('No file uploaded');
        }
        const file = formData[0];
        
        const fileExt = path.extname(file.filename || '');
        const fileName = `${randomUUID()}${fileExt}`;
        const uploadDir = './public/avatars';
        const filePath = path.join(uploadDir, fileName);

        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (error) {
            // Directory already exists
        }

        await writeFile(filePath, file.data);

        

        return {
            status: 'success',
            filePath: `/avatars/${fileName}`
        };
    }
    catch (error: any) {
        return createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Internal Server Error',
        });
    }
});