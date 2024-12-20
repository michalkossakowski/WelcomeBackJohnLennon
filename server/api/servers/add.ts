import fs from 'fs/promises'

export default defineEventHandler(async (event) => {
    try {
        const data = await fs.readFile('./db/servers.json', 'utf8')
        return JSON.parse(data)
    }
    catch (error) {
        console.error('Error getting servers:', error)
        return { status: 500, message: 'Error getting servers' }
    }
})
