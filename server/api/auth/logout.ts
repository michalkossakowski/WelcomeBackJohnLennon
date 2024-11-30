export default defineEventHandler(async (event) => {
  try {
    setCookie(event, 'session', '', {
      maxAge: -1, // -1 instant wygaśnięcie cookie
    });

    return {
      statusCode: 200,
      message: 'Logout successful',
    };
  } 
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error with logout',
    });
  }
});
