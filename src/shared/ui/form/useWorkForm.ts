/**
 * 작업 폼 훅
 *
 * react-hook-form + zod 통합 폼 훅
 *
 * @example
 * const form = useWorkForm();
 * const { control, handleSubmit, reset } = form;
 *
 * const onSubmit = handleSubmit((data) => {
 *   console.log(data);
 * });
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { WorkFormData, UseWorkFormOptions } from "./WorkForm.types";
import { workFormSchema, DEFAULT_WORK_FORM_DATA } from "./WorkForm.types";

export function useWorkForm(options: UseWorkFormOptions = {}) {
    const { defaultValues = {}, mode = "onSubmit" } = options;

    return useForm<WorkFormData>({
        resolver: zodResolver(workFormSchema),
        defaultValues: {
            ...DEFAULT_WORK_FORM_DATA,
            ...defaultValues,
        },
        mode,
    });
}
