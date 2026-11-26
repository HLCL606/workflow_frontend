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
import {
  hasErrors,
  PASSWORD_MIN_LENGTH,
  validateRegister,
  type RegisterValues,
} from "@/lib/validators/auth";

const EMPTY: RegisterValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  agree: false,
};

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [values, setValues] = useState<RegisterValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterValues, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof RegisterValues>(key: K, value: RegisterValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateRegister(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    setFormError(null);
    try {
      const user = await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      toast.success(`注册成功，欢迎你，${user.name}`);
      router.replace("/dashboard");
    } catch (error) {
      setFormError(getErrorMessage(error, "注册失败，请稍后重试"));
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

      <Field data-invalid={Boolean(errors.name)}>
        <FieldLabel htmlFor="name">昵称</FieldLabel>
        <Input
          id="name"
          name="name"
          autoComplete="nickname"
          placeholder="怎么称呼你"
          className="h-10"
          value={values.name}
          aria-invalid={Boolean(errors.name)}
          onChange={(event) => update("name", event.target.value)}
        />
        <FieldError>{errors.name}</FieldError>
      </Field>

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
          autoComplete="new-password"
          placeholder={`至少 ${PASSWORD_MIN_LENGTH} 位`}
          value={values.password}
          aria-invalid={Boolean(errors.password)}
          onChange={(event) => update("password", event.target.value)}
        />
        <FieldError>{errors.password}</FieldError>
      </Field>

      <Field data-invalid={Boolean(errors.confirmPassword)}>
        <FieldLabel htmlFor="confirmPassword">确认密码</FieldLabel>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="再输入一次密码"
          value={values.confirmPassword}
          aria-invalid={Boolean(errors.confirmPassword)}
          onChange={(event) => update("confirmPassword", event.target.value)}
        />
        <FieldError>{errors.confirmPassword}</FieldError>
      </Field>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <Checkbox
            id="agree"
            className="mt-0.5"
            checked={values.agree}
            aria-invalid={Boolean(errors.agree)}
            onCheckedChange={(checked) => update("agree", checked === true)}
          />
          <Label
            htmlFor="agree"
            className="text-sm leading-tight font-normal text-muted-foreground"
          >
            我已阅读并同意
            <span className="cursor-pointer text-foreground underline underline-offset-4">
              服务条款
            </span>
            和
            <span className="cursor-pointer text-foreground underline underline-offset-4">
              隐私政策
            </span>
          </Label>
        </div>
        <FieldError>{errors.agree}</FieldError>
      </div>

      <Button type="submit" className="h-10 w-full" disabled={submitting}>
        {submitting && <LoaderCircle className="size-4 animate-spin" />}
        {submitting ? "注册中…" : "创建账号"}
      </Button>
    </form>
  );
}
