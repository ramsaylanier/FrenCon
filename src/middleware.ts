import { defineMiddleware } from 'astro:middleware';
import { getSessionUser } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  console.log('middleware');
  context.locals.user = await getSessionUser(context.cookies);
  return next();
});
