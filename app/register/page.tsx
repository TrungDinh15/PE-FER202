"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Errors {
  email?: string;
  password?: string;
  confirm?: string;
  auth?: string;
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate(e: string, p: string, c: string): Errors {
    const errs: Errors = {};
    if (!e.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()))
      errs.email = "Please enter a valid email address";
    if (!p) errs.password = "Password is required";
    else if (p.length < 6) errs.password = "Password must be at least 6 characters";
    if (!c) errs.confirm = "Confirm password is required";
    else if (p && c !== p) errs.confirm = "Passwords do not match";
    return errs;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setSuccess(false);
    setErrors((prev) => ({ ...prev, auth: undefined }));

    const errs = validate(email, password, confirm);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrors({ auth: error.message });
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const handleChange = (field: "email" | "password" | "confirm", value: string) => {
    if (field === "email") setEmail(value);
    else if (field === "password") setPassword(value);
    else setConfirm(value);

    if (submitted) {
      const newE = field === "email" ? value : email;
      const newP = field === "password" ? value : password;
      const newC = field === "confirm" ? value : confirm;
      const errs = validate(newE, newP, newC);
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
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Start tracking your books today</CardDescription>
        </CardHeader>
        <CardContent>
          <form data-testid="register-form" onSubmit={handleSubmit} noValidate className="space-y-4">
            {success && (
              <p data-testid="form-success" className="text-sm text-green-600 text-center font-medium">
                Registration successful
              </p>
            )}

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
                data-testid="register-email"
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
                data-testid="register-password"
                placeholder="Min. 6 characters"
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

            <div className="space-y-1">
              <label htmlFor="confirm" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirm"
                type="password"
                data-testid="register-confirm-password"
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => handleChange("confirm", e.target.value)}
                aria-invalid={!!errors.confirm}
              />
              {errors.confirm && (
                <p data-testid="error-confirm-password" className="text-sm text-destructive">
                  {errors.confirm}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              data-testid="register-submit"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
