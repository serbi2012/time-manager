import { useContext } from "react";

import {
    InputCapabilityContext,
    type InputCapability,
} from "./input_capability_context";

export function useInputCapability(): InputCapability {
    return useContext(InputCapabilityContext);
}
