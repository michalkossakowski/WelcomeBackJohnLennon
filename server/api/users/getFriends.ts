import fs from 'fs/promises'
import { UserBasics, User } from '~/models/userModel'

export default defineEventHandler(async (): Promise<any> => {
    try {

        const filePath = './db/users.json'
        const data = await fs.readFile(filePath, 'utf8')
        const users: User[] = JSON.parse(data)

        const friends: UserBasics[] = users.map((user) => ({
            id: user.id,
            username: user.username,
        }));

        return { statusCode: 200, friends }
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Get friends error: ' + error,
        })
    }
})
