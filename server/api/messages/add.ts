import fs from 'fs/promises';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) 
    const filePath = './db/messages.json'
    const data = await fs.readFile(filePath, 'utf8')

    let messages = JSON.parse(data)
    messages.push(body)
    await fs.writeFile(filePath, JSON.stringify(messages, null, 2), 'utf8')

    return {
      status: 'success',
      message: 'Message added',
    }
  } 
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Messages adding error: ' + error,
    })
  }
})
