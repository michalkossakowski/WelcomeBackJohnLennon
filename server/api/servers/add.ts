import fs from 'fs/promises';
import { Server } from '~/models/serverModel';

export default defineEventHandler(async (event) => {
    try {
        const newServerData: Omit<Server, 'createdAt'> = await readBody(event);
        const filePath = './db/servers.json';

        const newServer: Server = {
            ...newServerData,
            createdAt: new Date().toISOString()
        };

        let servers: Server[];
        try {
            const data = await fs.readFile(filePath, 'utf8');
            servers = JSON.parse(data);
        } catch (error) {
            servers = [];
        }

        servers.push(newServer);

        await fs.writeFile(filePath, JSON.stringify(servers, null, 2), 'utf8');

        return {
            status: 'success',
            message: 'Server added',
            server: newServer
        };
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `Server add error: ${error}`,
        });
    }
});