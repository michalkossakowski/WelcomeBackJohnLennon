import fs from 'fs/promises'
import { User, Session } from '~/models/userModel'

export default defineEventHandler(async (event): Promise<any> => {
    try {

        const sessionCookie = getCookie(event, 'session')
        if (!sessionCookie) {
            return { statusCode: 401, message: 'Session not found' }
        }

        const session: Session = JSON.parse(sessionCookie)
        const userId = session.userId

        const filePath = './db/users.json'
        const data = await fs.readFile(filePath, 'utf8')
        const users: User[] = JSON.parse(data)

        const user = users.find(user => user.id === userId)
        if (!user) {
            return { statusCode: 404, message: 'User not found' }
        }

        return { statusCode: 200, user }
    }

    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Get user error: ' + error,
        })
    }
})
