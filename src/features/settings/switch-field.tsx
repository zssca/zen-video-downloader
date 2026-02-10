"use client";

import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

export function SwitchField({
  id,
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Field orientation="responsive" data-disabled={disabled ? "true" : "false"}>
      <FieldLabel
        htmlFor={id}
        className="flex-1 flex-col items-start gap-1"
      >
        <span className="font-medium">{label}</span>
        {description ? <FieldDescription>{description}</FieldDescription> : null}
      </FieldLabel>
      <FieldContent className="flex items-center justify-end">
        <Switch
          id={id}
          checked={checked}
          disabled={disabled}
          onCheckedChange={onCheckedChange}
        />
      </FieldContent>
    </Field>
  );
}
