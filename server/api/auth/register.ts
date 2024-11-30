import fs from 'fs/promises';
import { User } from '~/models/user';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const filePath = './db/users.json';

    const data = await fs.readFile(filePath, 'utf8');
    const users: User[] = JSON.parse(data);

    const existingUser = users.find(user => user.username === body.username);
    if (existingUser) {
      return { statusCode: 400, message: 'This username already exists' };
    }

    const newUser: User = {
      id: Math.random().toString(36).slice(2, 12).toString(), 
      username: body.username,
      password: body.password,
    };
    users.push(newUser);

    await fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8');

    return { statusCode: 200, message: 'User registered successfully' };
  } 
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Registration error: ' + error,
    });
  }
});
