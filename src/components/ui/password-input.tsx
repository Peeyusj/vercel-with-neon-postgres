import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function PasswordInput({
  id,
  name,
  required,
  placeholder,
  disabled,
  className,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={`${className} pr-10`}
        {...props}
      />
      <Button
        type="button"
        tabIndex={-1}
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={() => setShowPassword(!showPassword)}
        disabled={disabled}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-zinc-500" />
        ) : (
          <Eye className="h-4 w-4 text-zinc-500" />
        )}
      </Button>
    </div>
  );
}
