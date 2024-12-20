import fs from 'fs/promises';
import path from 'path';

export default defineEventHandler(async (event) => {
    try {
        const body: string[] = await readBody(event);
        const folderPath = './db/messagesByChannel';
        const filePath = path.join(folderPath, `friends_${body[0]}.json`);

        const userId = event.context.params?.id;

        try {
            await fs.access(folderPath);
        } catch (error) {
            await fs.mkdir(folderPath, { recursive: true });
        }

        let friends: string[];
        try {
            const data = await fs.readFile(filePath, 'utf8');
            friends = JSON.parse(data);
        } catch (error) {
            friends = [];
        }

        friends.push(body[1]);
        await fs.writeFile(filePath, JSON.stringify(friends, null, 2), 'utf8');


        return {
            status: 'success',
            message: 'Friend Added',
        };
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `Friend add error: ${error}`,
        });
    }
});
