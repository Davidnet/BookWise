'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '@/services/auth-service';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: error.message || 'An error occurred during Google sign-in.',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      await signInWithEmail(values.email, values.password);
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.code === 'auth/invalid-credential' 
          ? 'Invalid email or password.'
          : 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    setLoading(true);
    try {
      await signUpWithEmail(values.email, values.password);
      router.push('/');
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.code === 'auth/email-already-in-use'
          ? 'This email is already registered.'
          : 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-3 mb-4">
          <Icons.logo className="h-12 w-12 text-primary" />
          <h1 className="text-5xl font-bold font-headline tracking-tight">BookWise</h1>
        </div>
        <Tabs defaultValue="login" className="w-full max-w-sm">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Access your book collection.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="register">
             <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Join BookWise to start managing your books.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl><Input type="password" placeholder="Must be 8+ characters" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="relative w-full max-w-sm mt-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <Button variant="outline" className="w-full max-w-sm mt-6" onClick={handleGoogleSignIn} disabled={googleLoading}>
          {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icons.google className="mr-2 h-4 w-4" />}
          Google
        </Button>
      </div>
    </div>
  );
}
