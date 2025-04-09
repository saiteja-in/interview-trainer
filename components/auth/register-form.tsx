"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTheme } from "next-themes";
import Link from "next/link";
import { FaSpinner } from "react-icons/fa";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { RegisterSchema } from "@/schemas";
import { register } from "@/actions/register";
import {
  PasswordInput,
  PasswordInputInput,
  PasswordInputAdornmentToggle,
} from "@/components/ui/password-input";
import { Social } from "@/components/auth/social";

export const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const { theme } = useTheme();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      register(values).then((data) => {
        setError(data.error);
        setSuccess(data.success);
      });
    });
  };

  return (
    <main className="w-full flex flex-col flex-1 items-center justify-center pb-6">
      <div className="flex flex-col max-w-96 gap-4">
        <header className="mb-6 flex w-full flex-col items-center gap-6">
          {/* You can replace with your actual logo */}
          <div className="rounded-xl border-4 dark:border dark:border-neutral-600 border-neutral-300 shadow-md p-4 bg-white dark:bg-neutral-800">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h1 className="text-neutral-950 dark:text-neutral-50 font-bold text-xl">
            Create An Account
          </h1>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-600 dark:text-neutral-400">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="text-neutral-900 dark:text-neutral-50"
                      {...field}
                      disabled={isPending}
                      placeholder="John Doe"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-600 dark:text-neutral-400">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="text-neutral-900 dark:text-neutral-50"
                      {...field}
                      disabled={isPending}
                      placeholder="john@example.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-600 dark:text-neutral-400">
                    Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput>
                      <PasswordInputInput
                        {...field}
                        disabled={isPending}
                        placeholder="********"
                        className="text-neutral-900 dark:text-neutral-50"
                      />
                      <PasswordInputAdornmentToggle />
                    </PasswordInput>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button
              type="submit"
              disabled={isPending}
              className="w-full font-medium border-2 hover:border-neutral-500 dark:hover:border-neutral-400 hover:bg-neutral-800 dark:hover:bg-neutral-300"
              variant={theme === "dark" ? "default" : "secondary"}
            >
              {isPending ? (
                <>
                  <FaSpinner className="h-5 w-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </Form>

        <div className="flex flex-row items-center justify-between">
          <div className="w-full h-[1px] bg-neutral-200 dark:bg-neutral-800" />
          <span className="text-sm px-4 text-neutral-400 dark:text-neutral-700">
            OR
          </span>
          <div className="w-full h-[1px] bg-neutral-200 dark:bg-neutral-800" />
        </div>

        <div className="w-full">
          <Social />
        </div>

        <Button
          className="w-full font-medium border-2 text-neutral-950 dark:text-neutral-50 mt-2"
          variant="outline"
          type="button"
          asChild
        >
          <Link href="/auth/login">Already have an account?</Link>
        </Button>

        {/* <p className="mt-2 text-balance text-center text-neutral-600 dark:text-neutral-400 text-xs">
          {'By signing up, you agree to our '}
          <Link
            className="underline underline-offset-2 transition-colors hover:text-neutral-950 dark:hover:text-neutral-50"
            href="/terms"
          >
            Terms of Service
          </Link>
          {' and '}
          <Link
            className="underline underline-offset-2 transition-colors hover:text-neutral-950 dark:hover:text-neutral-50"
            href="/privacy"
          >
            Privacy Policy
          </Link>
          .
        </p> */}
      </div>
    </main>
  );
};