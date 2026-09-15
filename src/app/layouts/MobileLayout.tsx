/**
 * 모바일 레이아웃
 */

import { useAuthHandlers } from "../../shared/hooks";
import { SyncStatusProvider } from "../../features/sync";
import { InputCapabilityProvider } from "../../shared/ui";
import { MobileLayoutContent } from "./MobileLayoutContent";

/**
 * 모바일 레이아웃
 */
export function MobileLayout() {
    const { user, loading: auth_loading, isAuthenticated } = useAuthHandlers();

    return (
        <InputCapabilityProvider has_keyboard={false}>
            <SyncStatusProvider user={user} is_authenticated={isAuthenticated}>
                <MobileLayoutContent
                    auth_loading={auth_loading}
                    is_authenticated={isAuthenticated}
                />
            </SyncStatusProvider>
        </InputCapabilityProvider>
    );
}

export default MobileLayout;
