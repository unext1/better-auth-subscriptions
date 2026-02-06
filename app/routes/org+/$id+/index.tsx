import { Form, href, Link, redirect } from 'react-router';
import { auth } from '~/services/auth.server';
import type { Route } from './+types';
import { db } from '~/db';
import { Button, buttonVariants } from '~/components/ui/button';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) return redirect('/login');

  const organizaiton = await db.query.member.findFirst({
    with: {
      organization: true,
    },
    where: (member, { eq, and }) => and(eq(member.userId, session.user.id), eq(member.organizationId, params.id)),
  });
  if (!organizaiton) return redirect('/onboarding');

  const subscription = await auth.api.listActiveSubscriptions({
    query: {
      customerType: 'organization',
      referenceId: params.id,
    },
    headers: request.headers,
  });

  return { organizaiton: organizaiton.organization, subscription };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get('intent')?.toString();

  if (intent === 'subscribe') {
    const plan = formData.get('plan')?.toString();
    if (!plan) throw new Error('Plan is required');

    const res = await auth.api.upgradeSubscription({
      body: {
        plan,
        customerType: 'organization',
        referenceId: params.id,
        successUrl: href('/org/:id', { id: params.id }),
        cancelUrl: href('/org/:id', { id: params.id }),
      },
      headers: request.headers,
    });
    return redirect(res.url || '');
  }
  if (intent === 'cancel') {
    const subscriptionId = formData.get('subscriptionId')?.toString();
    const res = await auth.api.cancelSubscription({
      body: {
        customerType: 'organization',
        referenceId: params.id,
        subscriptionId: subscriptionId,

        returnUrl: href('/org/:id', { id: params.id }),
      },
      headers: request.headers,
    });
    return redirect(res.url || '');
  }
};

const OrgPage = ({ loaderData: { organizaiton, subscription } }: Route.ComponentProps) => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center">
      <h1>hello {organizaiton.name}</h1>
      <Link to={href('/onboarding')} className={buttonVariants({ variant: 'default', size: 'sm', className: 'mt-4' })}>
        Back to onboarding
      </Link>

      {subscription.map((sub) => (
        <Card className="w-sm mt-6" key={sub.id}>
          <CardHeader>
            <CardTitle className="flex justify-between">
              Subscription Status{' '}
              {subscription.length >= 1 ? (
                <Badge variant="default">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </CardTitle>
            <CardDescription>End date: {new Date(sub.periodEnd || '').toDateString()}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Form method="post" className="w-full">
              <input type="hidden" name="intent" value="cancel" />
              <input type="hidden" name="subscriptionId" value={sub.stripeSubscriptionId} />
              <Button type="submit" variant="destructive">
                Cancle Subscription
              </Button>
            </Form>
          </CardFooter>
        </Card>
      ))}

      <Card className="relative mx-auto w-full max-w-sm pt-0 mt-6">
        <div className="absolute inset-0 z-30 h-40 bg-black/35" />
        <img
          src="https://avatar.vercel.sh/shadcn1"
          alt="Event cover"
          className="relative z-20 h-40 w-full object-cover brightness-60 grayscale dark:brightness-40"
        />
        <CardHeader>
          <CardAction>
            <Badge variant="secondary">100 SEK</Badge>
          </CardAction>
          <CardTitle>Pro Plan</CardTitle>
          <CardDescription>Subscribe to unlock all premium features.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Form method="post" className="w-full">
            <input type="hidden" name="intent" value="subscribe" />
            <input type="hidden" name="plan" value="pro" />
            <Button className="w-full" type="submit" disabled={subscription.length >= 1}>
              {subscription.length >= 1 ? 'You already have an active subscription' : 'Subscribe'}
            </Button>
          </Form>
        </CardFooter>
      </Card>
    </div>
  );
};
export default OrgPage;
