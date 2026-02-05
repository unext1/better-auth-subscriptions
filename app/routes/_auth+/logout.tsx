import { href, redirect } from 'react-router';
import { auth } from '~/services/auth.server';
import type { Route } from './+types/logout';

export const action = async ({ request }: Route.ActionArgs) => {
  const result = await auth.api.signOut({
    headers: request.headers,
    returnHeaders: true,
  });
  return redirect(href('/login'), { headers: result.headers });
};
