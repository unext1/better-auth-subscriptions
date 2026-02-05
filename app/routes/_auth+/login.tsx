import { EnvelopeSimpleIcon } from '@phosphor-icons/react';
import { Form, href, redirect, useNavigation } from 'react-router';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '~/components/ui/input-otp';
import { auth } from '~/services/auth.server';
import type { Route } from './+types/login';

const emailSchema = z.object({
  email: z.email('Invalid email'),
  step: z.literal('email'),
});

const otpSchema = z.object({
  email: z.email('Invalid email'),
  otp: z.string().length(6, 'Please enter a 6-digit code'),
  step: z.literal('otp'),
});

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session) {
    return redirect(href('/onboarding'));
  }
  return {};
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const step = formData.get('step')?.toString();

  if (step === 'email') {
    const result = emailSchema.safeParse({
      email: formData.get('email'),
      step: 'email',
    });

    if (!result.success) {
      return {
        step: 'email' as const,
        email: '',
        error: null,
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    try {
      await auth.api.sendVerificationOTP({
        body: {
          email: result.data.email,
          type: 'sign-in',
        },
      });

      return { step: 'otp' as const, email: result.data.email, error: null, fieldErrors: null };
    } catch {
      return {
        step: 'email' as const,
        email: result.data.email,
        error: 'Failed to send verification code. Please try again.',
        fieldErrors: null,
      };
    }
  }

  if (step === 'otp') {
    const result = otpSchema.safeParse({
      email: formData.get('email'),
      otp: formData.get('otp'),
      step: 'otp',
    });

    if (!result.success) {
      return {
        step: 'otp' as const,
        email: formData.get('email')?.toString() || '',
        error: null,
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    try {
      const signInResult = await auth.api.signInEmailOTP({
        returnHeaders: true,
        body: {
          email: result.data.email,
          otp: result.data.otp,
        },
      });

      return redirect(href('/onboarding'), { headers: signInResult.headers });
    } catch {
      return {
        step: 'otp' as const,
        email: result.data.email,
        error: 'Invalid verification code. Please try again.',
        fieldErrors: null,
      };
    }
  }

  return { step: 'email' as const, email: '', error: 'Invalid request', fieldErrors: null };
};

const AuthPage = ({ actionData }: Route.ComponentProps) => {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const currentStep = actionData?.step || 'email';
  const generalError = actionData?.error;

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
            <span className="text-white mr-1"> Lorem ipsum dolor sit amet consectetur adipisicing elit.</span>
            Provident sint dolorem eveniet magnam sunt! Facilis aspernatur harum, libero molestiae eos earum eius.
            Aperiam, natus minus? Reiciendis, optio. Doloremque, nesciunt tempore!
          </div>
        </div>
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="font-semibold text-2xl tracking-tight">Welcome to Better Org</h1>
            <p className="text-muted-foreground text-sm">
              {currentStep === 'otp' ? 'Enter the verification code' : 'Sign in or create an account'}
            </p>
          </div>
          <div>
            {generalError && (
              <div className="border border-destructive/50 bg-destructive/10 p-3 text-center text-sm text-destructive">
                {generalError}
              </div>
            )}
          </div>

          <div>
            {currentStep === 'email' ? (
              <div className="space-y-4">
                <Form method="post" className="space-y-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="email" className="sr-only">
                        Email
                      </FieldLabel>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        autoComplete="email"
                      />
                      {currentStep === 'email' && actionData?.step === 'email' && actionData.fieldErrors?.email && (
                        <FieldError>{actionData.fieldErrors.email[0]}</FieldError>
                      )}
                    </Field>
                  </FieldGroup>
                  <input type="hidden" name="step" value="email" />
                  <Button className="w-full" type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="inline-block size-4 border-2 border-current border-t-transparent rounded-full" />
                        Sending...
                      </span>
                    ) : (
                      <>
                        <EnvelopeSimpleIcon className="size-4" data-icon="inline-start" />
                        Continue with Email
                      </>
                    )}
                  </Button>
                </Form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <p className="text-sm text-muted-foreground">
                    We sent a code to <span className="text-foreground font-medium">{actionData?.email}</span>
                  </p>
                </div>

                <Form method="post" className="space-y-6">
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} name="otp" autoFocus>
                      <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-12">
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-12">
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {currentStep === 'otp' && actionData?.step === 'otp' && actionData.fieldErrors?.otp && (
                    <p className="text-center text-sm text-destructive">{actionData.fieldErrors.otp[0]}</p>
                  )}
                  <input type="hidden" name="email" value={actionData?.email} />
                  <input type="hidden" name="step" value="otp" />
                  <Button className="w-full" type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="inline-block size-4 border-2 border-current border-t-transparent rounded-full" />
                        Verifying...
                      </span>
                    ) : (
                      'Verify Code'
                    )}
                  </Button>
                </Form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
