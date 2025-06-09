import { ComponentProps } from "react";

// Base props that all Material-Tailwind components share
interface BaseProps {
  placeholder?: string;
  onResize?: (event: Event) => void;
  onResizeCapture?: (event: Event) => void;
  onPointerEnterCapture?: (event: React.PointerEvent) => void;
  onPointerLeaveCapture?: (event: React.PointerEvent) => void;
}

// Typography component props
export interface TypographyProps extends BaseProps {
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "lead" | "paragraph" | "small";
  color?: string;
  textGradient?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Button component props
export interface ButtonProps extends BaseProps {
  variant?: "filled" | "outlined" | "gradient" | "text";
  size?: "sm" | "md" | "lg";
  color?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

// Card component props
export interface CardProps extends BaseProps {
  variant?: "filled" | "gradient";
  color?: string;
  shadow?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Card header props
export interface CardHeaderProps extends BaseProps {
  variant?: "filled" | "gradient";
  color?: string;
  floated?: boolean;
  shadow?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Card body props
export interface CardBodyProps extends BaseProps {
  className?: string;
  children?: React.ReactNode;
}

// Input component props
export interface InputProps extends BaseProps {
  type?: string;
  label?: string;
  error?: boolean;
  success?: boolean;
  icon?: React.ReactNode;
  shrink?: boolean;
  className?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

// Textarea component props
export interface TextareaProps extends BaseProps {
  label?: string;
  error?: boolean;
  success?: boolean;
  resize?: boolean;
  rows?: number;
  className?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

// Select component props
export interface SelectProps extends BaseProps {
  label?: string;
  error?: boolean;
  success?: boolean;
  animate?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string | undefined) => void;
  children?: React.ReactNode;
  menuProps?: ComponentProps<"div">;
}

// Error modal props
export interface ErrorModalProps extends BaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  error: Error | string | Record<string, unknown> | unknown;
}

// Form field context value type
export type FormFieldContextValue<
  TFieldValues extends Record<string, any> = Record<string, any>,
  TName extends string = string,
> = {
  name: TName;
  value?: TFieldValues[TName];
  onChange?: (value: TFieldValues[TName]) => void;
  onBlur?: () => void;
  ref?: React.Ref<any>;
};

// Form item context value type
export type FormItemContextValue = {
  id: string;
  formItemId: string;
  formDescriptionId: string;
  formMessageId: string;
};
