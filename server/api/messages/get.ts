import fs from 'fs/promises'

export default defineEventHandler(async () => {
  try {
    const data = await fs.readFile('./db/messages.json', 'utf8')
    return JSON.parse(data) 
  } 
  catch (error) {
    console.error('Error getting messages:', error)
    return { status: 500, message: 'Error getting messages' }
  }
})
