"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { useAuth } from "@/lib/auth/context";
import { getErrorMessage } from "@/lib/http/errors";
import { hasErrors, validateLogin, type LoginValues } from "@/lib/validators/auth";

const EMPTY: LoginValues = { email: "", password: "" };

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [values, setValues] = useState<LoginValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginValues, string>>>({});
  const [remember, setRemember] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof LoginValues>(key: K, value: LoginValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    setFormError(null);
    try {
      const user = await login(
        { email: values.email.trim(), password: values.password },
        { remember }
      );
      toast.success(`欢迎回来，${user.name}`);
      router.replace("/dashboard");
    } catch (error) {
      setFormError(getErrorMessage(error, "登录失败，请稍后重试"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </div>
      )}

      <Field data-invalid={Boolean(errors.email)}>
        <FieldLabel htmlFor="email">邮箱</FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="h-10"
          value={values.email}
          aria-invalid={Boolean(errors.email)}
          onChange={(event) => update("email", event.target.value)}
        />
        <FieldError>{errors.email}</FieldError>
      </Field>

      <Field data-invalid={Boolean(errors.password)}>
        <FieldLabel htmlFor="password">密码</FieldLabel>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder="请输入密码"
          value={values.password}
          aria-invalid={Boolean(errors.password)}
          onChange={(event) => update("password", event.target.value)}
        />
        <FieldError>{errors.password}</FieldError>
      </Field>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={remember}
            onCheckedChange={(checked) => setRemember(checked === true)}
          />
          <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
            记住我
          </Label>
        </div>
        <button
          type="button"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={() => toast.info("找回密码功能还没接，先找管理员重置吧")}
        >
          忘记密码？
        </button>
      </div>

      <Button type="submit" className="h-10 w-full" disabled={submitting}>
        {submitting && <LoaderCircle className="size-4 animate-spin" />}
        {submitting ? "登录中…" : "登录"}
      </Button>
    </form>
  );
}
