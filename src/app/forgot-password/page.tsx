"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { KeyRound, ArrowLeft, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-3">
              <KeyRound className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle>Forgot Password?</CardTitle>
          <CardDescription>
            Don&apos;t worry! Here&apos;s how to regain access to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Contact an Administrator</p>
                <p className="text-sm text-muted-foreground mt-1">
                  An administrator can reset your password from the admin panel.
                  Please reach out to your platform administrator with your
                  registered email address.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">Already have access?</p>
            <p className="text-sm text-muted-foreground">
              If you can sign in, you can change your password from your
              <strong> Dashboard → Change Password</strong> section.
            </p>
          </div>

          <Link href="/sign-in">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
