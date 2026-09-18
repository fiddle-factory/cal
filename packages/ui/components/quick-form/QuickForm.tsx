"use client";

import React, { useState } from "react";

import classNames from "@calcom/ui/classNames";

import { InputField } from "../form/inputs/TextField";

export interface QuickFormProps {
  /** Label for the first text input */
  firstLabel?: string;
  /** Label for the second text input */
  secondLabel?: string;
  /** Label shown on the submit button */
  submitLabel?: string;
  /** Called with both field values when the form is submitted */
  onSubmit?: (values: { first: string; second: string }) => void;
  className?: string;
}

export default function QuickForm({
  firstLabel = "Name",
  secondLabel = "Email",
  submitLabel = "Submit",
  onSubmit,
  className,
}: QuickFormProps) {
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.({ first, second });
  };

  return (
    <form
      data-config-id="QuickForm-root"
      onSubmit={handleSubmit}
      className={classNames(
        "border-subtle bg-default w-full max-w-sm space-y-4 rounded-xl border p-6",
        className
      )}>
      <InputField
        name="quick-form-first"
        label={firstLabel}
        placeholder={firstLabel}
        value={first}
        onChange={(e) => setFirst(e.target.value)}
      />
      <InputField
        name="quick-form-second"
        label={secondLabel}
        placeholder={secondLabel}
        value={second}
        onChange={(e) => setSecond(e.target.value)}
      />
      <button
        type="submit"
        data-config-id="QuickForm-submit"
        className={classNames(
          "inline-flex w-full items-center justify-center rounded-[10px] px-3 py-2.5",
          "text-sm font-medium text-white transition",
          "bg-purple-600 hover:bg-purple-700 active:bg-purple-800",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-30"
        )}>
        {submitLabel}
      </button>
    </form>
  );
}
