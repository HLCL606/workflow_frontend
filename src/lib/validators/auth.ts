import type { FieldErrors } from "@/lib/http/types";

/**
 * 表单校验，不依赖任何第三方库。
 * 校验规则只在这里维护一份，登录 / 注册两个表单共用同一套文案。
 */

export interface LoginValues {
  email: string;
  password: string;
}

export interface RegisterValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 6;

export function validateLogin(values: LoginValues): FieldErrors<LoginValues> {
  const errors: FieldErrors<LoginValues> = {};

  if (!values.email.trim()) {
    errors.email = "请输入邮箱";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "邮箱格式不正确";
  }

  if (!values.password) {
    errors.password = "请输入密码";
  } else if (values.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `密码至少 ${PASSWORD_MIN_LENGTH} 位`;
  }

  return errors;
}

export function validateRegister(values: RegisterValues): FieldErrors<RegisterValues> {
  const errors: FieldErrors<RegisterValues> = {};

  const name = values.name.trim();
  if (!name) {
    errors.name = "请输入昵称";
  } else if (name.length < 2 || name.length > 16) {
    errors.name = "昵称长度需在 2-16 个字符之间";
  }

  if (!values.email.trim()) {
    errors.email = "请输入邮箱";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "邮箱格式不正确";
  }

  if (!values.password) {
    errors.password = "请输入密码";
  } else if (values.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `密码至少 ${PASSWORD_MIN_LENGTH} 位`;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "请再次输入密码";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "两次输入的密码不一致";
  }

  if (!values.agree) {
    errors.agree = "请先阅读并同意服务条款";
  }

  return errors;
}

export function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}
