import { auth } from '~/services/auth.server';
import type { Route } from './+types/auth.$';

export const loader = ({ request }: Route.LoaderArgs) => {
  return auth.handler(request);
};

export const action = ({ request }: Route.ActionArgs) => {
  return auth.handler(request);
};
