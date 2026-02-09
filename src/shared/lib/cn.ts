import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with conflict resolution.
 * Combines clsx (conditional classes) with tailwind-merge (dedup).
 *
 * @example
 * cn("px-4 py-2", is_active && "bg-primary text-white")
 * cn("text-sm", className) // allows override from props
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}
