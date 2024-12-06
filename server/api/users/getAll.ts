import fs from 'fs/promises'
import { User, Session } from '~/models/userModel'

export default defineEventHandler(async (event): Promise<any> => {
  try {

    const filePath = './db/users.json'
    const data = await fs.readFile(filePath, 'utf8')
    const users: User[] = JSON.parse(data)

    const usersBasicInfo = users.map(user => ({
      id: user.id,
      username: user.username
    }));


    return { statusCode: 200, usersBasicInfo }
  } 

  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Get user error: ' + error,
    })
  }
})
