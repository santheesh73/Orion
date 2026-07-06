"use client";

import { useForm, type FieldErrors, type FieldValues, type Resolver, type UseFormProps } from "react-hook-form";
import type { z } from "zod";

export function zodResolver<TSchema extends z.ZodTypeAny>(schema: TSchema): Resolver<z.infer<TSchema>> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors = result.error.issues.reduce<Record<string, { type: string; message: string }>>((fieldErrors, issue) => {
        const path = issue.path.join(".");
        if (path) {
          fieldErrors[path] = { type: issue.code, message: issue.message };
        }
        return fieldErrors;
      }, {});

    return {
      values: {},
      errors: errors as FieldErrors<z.infer<TSchema>>
    };
  };
}

export function useZodForm<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, "resolver">
) {
  return useForm<z.infer<TSchema>>({
    ...options,
    resolver: zodResolver(schema)
  });
}

export type FormValues = FieldValues;
