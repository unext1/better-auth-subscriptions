import { Form, href } from 'react-router';
import { Button } from '~/components/ui/button';

const OnboardingPage = () => {
  return (
    <div className="flex flex-1 flex-col justify-center items-center">
      <h1 className="mb-4 text-2xl">Welcome</h1>
      <Form method="post" action={href('/logout')} className="mt-4">
        <Button type="submit" name="intent" value="logout" className="w-40">
          Logout
        </Button>
      </Form>
    </div>
  );
};

export default OnboardingPage;
