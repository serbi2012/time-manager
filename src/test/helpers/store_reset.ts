import { useWorkStore } from "@/store/useWorkStore";
import type { WorkStore } from "@/store/types";

export function resetWorkStore(overrides: Partial<WorkStore> = {}): void {
    useWorkStore.setState({ ...useWorkStore.getInitialState(), ...overrides });
}
