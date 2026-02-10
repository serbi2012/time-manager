/**
 * Context-aware Ant Design message wrapper
 *
 * Replaces static `message` from antd with a version that
 * renders inside <StyleProvider layer>, preventing CSS
 * cascade conflicts in production builds.
 *
 * Usage: import { message } from '@/shared/lib/message';
 * (drop-in replacement for `import { message } from 'antd'`)
 */

import { message as staticMessage } from "antd";
import type { MessageInstance } from "antd/es/message/interface";

let _instance: MessageInstance | null = null;

export function registerMessageInstance(instance: MessageInstance) {
    _instance = instance;
}

function active(): MessageInstance | typeof staticMessage {
    return _instance ?? staticMessage;
}

export const message: Pick<
    MessageInstance,
    "success" | "error" | "warning" | "info" | "loading" | "open" | "destroy"
> = {
    success: (...args) => active().success(...args),
    error: (...args) => active().error(...args),
    warning: (...args) => active().warning(...args),
    info: (...args) => active().info(...args),
    loading: (...args) => active().loading(...args),
    open: (...args) => active().open(...args),
    destroy: (key) => active().destroy(key),
};
