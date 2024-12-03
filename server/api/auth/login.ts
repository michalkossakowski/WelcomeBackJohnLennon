import fs from 'fs/promises'
import { User, Session } from '~/models/userModel'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const filePath = './db/users.json'

    const data = await fs.readFile(filePath, 'utf8')
    const users:User[] = JSON.parse(data)

    const user = users.find(user => user.username === body.username)
    if (!user || (user.password !== body.password)) {
      return { statusCode: 401, message: 'Invalid username or password' }
    }

    const session: Session = {
      userId: user.id,
    }

    setCookie(event, 'session', JSON.stringify(session), {
      maxAge: 60 * 60 * 2, // 2 godziny
    })

    return { 
      statusCode: 200,
      message: 'Logged in successfully' 
    }
  } 
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Login error: ' + error,
    })
  }
})
