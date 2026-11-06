"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Errors {
  email?: string;
  password?: string;
  auth?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate(e: string, p: string): Errors {
    const errs: Errors = {};
    if (!e.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()))
      errs.email = "Please enter a valid email address";
    if (!p) errs.password = "Password is required";
    return errs;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setErrors((prev) => ({ ...prev, auth: undefined }));

    const errs = validate(email, password);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrors({ auth: error.message });
      setLoading(false);
      return;
    }

    router.push("/books");
  };

  const handleChange = (field: "email" | "password", value: string) => {
    if (field === "email") setEmail(value);
    else setPassword(value);

    if (submitted) {
      const newE = field === "email" ? value : email;
      const newP = field === "password" ? value : password;
      const errs = validate(newE, newP);
      setErrors((prev) => ({
        ...prev,
        [field]: errs[field],
      }));
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Log in to access your shelf</CardDescription>
        </CardHeader>
        <CardContent>
          <form data-testid="login-form" onSubmit={handleSubmit} noValidate className="space-y-4">
            {errors.auth && (
              <p data-testid="error-auth" className="text-sm text-destructive text-center">
                {errors.auth}
              </p>
            )}

            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                data-testid="login-email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => handleChange("email", e.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p data-testid="error-email" className="text-sm text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                data-testid="login-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => handleChange("password", e.target.value)}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p data-testid="error-password" className="text-sm text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              data-testid="login-submit"
              disabled={loading}
            >
              {loading ? "Logging in…" : "Log In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
