/**
 * 설정 모달 (슬림): 탭 컴포넌트 조합
 */

import { Modal, Tabs } from "antd";
import {
    BgColorsOutlined,
    ThunderboltOutlined,
    DatabaseOutlined,
    UnorderedListOutlined,
    KeyOutlined,
} from "@ant-design/icons";
import { useResponsive } from "@/hooks/useResponsive";
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
    SETTINGS_SCROLL_WRAPPER_DESKTOP,
    SETTINGS_SCROLL_WRAPPER_MOBILE,
    SETTINGS_TAB_BAR_STYLE,
    SETTINGS_TABS_CONTAINER_STYLE,
    SETTINGS_MODAL_BODY_DESKTOP,
    SETTINGS_MODAL_BODY_MOBILE,
    SETTINGS_MODAL_STYLE_MOBILE,
} from "../../constants";

export interface SettingsModalProps {
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

export function SettingsModal({
    open,
    onClose,
    onExport,
    onImport,
    isAuthenticated,
}: SettingsModalProps) {
    const { is_mobile } = useResponsive();

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
            children: <AnimationTab is_mobile={is_mobile} />,
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
                    is_mobile={is_mobile}
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
            children: <ShortcutsTab is_mobile={is_mobile} />,
        },
    ];

    const scroll_wrapper_style = is_mobile
        ? SETTINGS_SCROLL_WRAPPER_MOBILE
        : SETTINGS_SCROLL_WRAPPER_DESKTOP;

    const scrollable_tab_items = tab_items.map((item) => ({
        ...item,
        children: <div style={scroll_wrapper_style}>{item.children}</div>,
    }));

    if (is_mobile) {
        return (
            <Modal
                title={SETTINGS_MODAL_TITLE}
                open={open}
                onCancel={onClose}
                footer={null}
                width={SETTINGS_LAYOUT.MODAL_WIDTH_MOBILE}
                centered
                style={SETTINGS_MODAL_STYLE_MOBILE}
                styles={{
                    body: SETTINGS_MODAL_BODY_MOBILE,
                }}
                className="mobile-settings-modal"
            >
                <Tabs
                    defaultActiveKey={TAB_KEY_THEME}
                    items={scrollable_tab_items}
                    tabPosition="top"
                    centered
                    size="small"
                />
            </Modal>
        );
    }

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
