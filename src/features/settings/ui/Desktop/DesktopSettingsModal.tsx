/**
 * Desktop 전용 설정 모달 컴포넌트
 *
 * Desktop 특화 UI:
 * - Modal width: 1200px
 * - Tabs: tabPosition="left" (왼쪽 사이드바)
 * - 기본 사이즈
 */

import { Modal, Tabs } from "antd";
import {
    BgColorsOutlined,
    ThunderboltOutlined,
    DatabaseOutlined,
    UnorderedListOutlined,
    KeyOutlined,
} from "@ant-design/icons";
import {
    ThemeTab,
    AnimationTab,
    DataTab,
    AutoCompleteTab,
    ShortcutsTab,
} from "../tabs";
import {
    SETTINGS_MODAL_TITLE,
    SETTINGS_TAB_THEME,
    SETTINGS_TAB_ANIMATION,
    SETTINGS_TAB_DATA,
    SETTINGS_TAB_AUTOCOMPLETE,
    SETTINGS_TAB_SHORTCUTS,
} from "../../constants";
import {
    SETTINGS_LAYOUT,
    SETTINGS_TAB_BAR_STYLE,
    SETTINGS_TABS_CONTAINER_STYLE,
    SETTINGS_MODAL_BODY_DESKTOP,
} from "../../constants";

export interface DesktopSettingsModalProps {
    open: boolean;
    onClose: () => void;
    onExport: () => void;
    onImport: () => void;
    isAuthenticated: boolean;
}

const TAB_KEY_THEME = "theme";
const TAB_KEY_ANIMATION = "animation";
const TAB_KEY_DATA = "data";
const TAB_KEY_AUTOCOMPLETE = "autocomplete";
const TAB_KEY_SHORTCUTS = "shortcuts";

export function DesktopSettingsModal({
    open,
    onClose,
    onExport,
    onImport,
    isAuthenticated,
}: DesktopSettingsModalProps) {
    const tab_items = [
        {
            key: TAB_KEY_THEME,
            label: (
                <span>
                    <BgColorsOutlined /> {SETTINGS_TAB_THEME}
                </span>
            ),
            children: <ThemeTab />,
        },
        {
            key: TAB_KEY_ANIMATION,
            label: (
                <span>
                    <ThunderboltOutlined /> {SETTINGS_TAB_ANIMATION}
                </span>
            ),
            children: <AnimationTab is_mobile={false} />,
        },
        {
            key: TAB_KEY_DATA,
            label: (
                <span>
                    <DatabaseOutlined /> {SETTINGS_TAB_DATA}
                </span>
            ),
            children: (
                <DataTab
                    onExport={onExport}
                    onImport={onImport}
                    isAuthenticated={isAuthenticated}
                    is_mobile={false}
                />
            ),
        },
        {
            key: TAB_KEY_AUTOCOMPLETE,
            label: (
                <span>
                    <UnorderedListOutlined /> {SETTINGS_TAB_AUTOCOMPLETE}
                </span>
            ),
            children: <AutoCompleteTab />,
        },
        {
            key: TAB_KEY_SHORTCUTS,
            label: (
                <span>
                    <KeyOutlined /> {SETTINGS_TAB_SHORTCUTS}
                </span>
            ),
            children: <ShortcutsTab is_mobile={false} />,
        },
    ];

    const scrollable_tab_items = tab_items.map((item) => ({
        ...item,
        children: (
            <div className="h-[calc(70vh-120px)] max-h-[500px] min-h-[300px] overflow-y-auto pr-sm">
                {item.children}
            </div>
        ),
    }));

    return (
        <Modal
            title={SETTINGS_MODAL_TITLE}
            open={open}
            onCancel={onClose}
            footer={null}
            width={SETTINGS_LAYOUT.MODAL_WIDTH}
            centered
            styles={{
                body: SETTINGS_MODAL_BODY_DESKTOP,
            }}
        >
            <Tabs
                defaultActiveKey={TAB_KEY_THEME}
                items={scrollable_tab_items}
                tabPosition="left"
                tabBarStyle={SETTINGS_TAB_BAR_STYLE}
                style={SETTINGS_TABS_CONTAINER_STYLE}
            />
        </Modal>
    );
}
