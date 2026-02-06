import { Form, href, Link, redirect } from 'react-router';
import { Button, buttonVariants } from '~/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { db } from '~/db';
import { auth } from '~/services/auth.server';
import type { Route } from './+types';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) return redirect('/login');
  const orgs = await db.query.member.findMany({
    with: {
      organization: true,
    },
    where: (member, { eq }) => eq(member.userId, session.user.id),
  });
  return { orgs: orgs.map((m) => m.organization) };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();

  const intent = formData.get('intent')?.toString();

  if (intent === 'createOrg') {
    const orgName = formData.get('orgName')?.toString();
    const orgSlug = formData.get('orgSlug')?.toString();

    if (!orgName || !orgSlug) throw new Error('Organization name and slug are required');

    const organization = await auth.api.createOrganization({
      body: {
        name: orgName,
        slug: orgSlug,
      },
      headers: request.headers,
    });

    if (!organization) throw new Error('Failed to create organization');

    // Redirect to the new organization page or leave them on same page.

    return redirect(href('/org/:id', { id: organization.id }));
  }
  return {};
};

const OnboardingPage = ({ loaderData }: Route.ComponentProps) => {
  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-2">
      <div className="relative hidden h-full flex-col lg:flex">
        <div className="pointer-events-none absolute inset-0 overflow-hidden ">
          <img
            alt="pattern"
            title="pattern"
            className="relative z-20 w-full h-full object-cover brightness-10 grayscale"
            src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&amp;w=1887&amp;auto=format&amp;fit=crop&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          />
        </div>

        <div className="flex h-full z-50 flex-col justify-center p-20 text-center ">
          <div className="text-muted-foreground">
            <span className="text-white mr-1 text-2xl font-semibold">Onboarding</span>
          </div>
          <Form method="post" className="space-y-4 mt-6 w-lg mx-auto">
            <input type="hidden" name="intent" value="createOrg" />
            <Input type="text" name="orgName" placeholder="Organization Name" />
            <Input type="text" name="orgSlug" placeholder="Organization Slug" />
            <Button type="submit" className="w-full">
              Create Organization
            </Button>
          </Form>
          <Form>
            <Button type="submit" className="w-lg mt-4" variant="outline">
              Logout
            </Button>
          </Form>
        </div>
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <div className="mt-6">
          {loaderData.orgs.map((i) => (
            <Card key={i.slug} size="sm" className="mx-auto w-lg mt-4">
              <CardHeader>
                <CardTitle>{i.name}</CardTitle>
                <CardDescription>{i.slug}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Link
                  to={href('/org/:id', { id: i.id })}
                  className={buttonVariants({ variant: 'outline', size: 'sm', className: 'w-full' })}
                >
                  Enter Organization
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
