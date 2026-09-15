/**
 * 모바일 설정 화면
 * 좁은 폭에 밀리던 탭 6개 대신 주제별 그룹 목록을 쓰고, 항목을 누르면 하위 시트가 열린다
 */

import { useState, useCallback, type ReactNode } from "react";
import { Switch } from "antd";
import { CloseOutlined, RightOutlined } from "@ant-design/icons";

import { useWorkStore } from "@/store/useWorkStore";
import { MobileBottomSheet, MobileIconButton } from "@/shared/ui";
import { BUTTON_TEXT } from "@/shared/constants";

import { ThemeTab, AnimationTab, DataTab, AutoCompleteTab } from "../tabs";
import {
    SETTINGS_MODAL_TITLE,
    SETTINGS_TAB_THEME,
    SETTINGS_TAB_ANIMATION,
    SETTINGS_TAB_DATA,
    SETTINGS_TAB_AUTOCOMPLETE,
    SETTINGS_GROUP,
    SETTINGS_ITEM,
} from "../../constants";

const SUB_SHEET_HEIGHT_RATIO = 0.9;

export interface MobileSettingsSheetProps {
    open: boolean;
    onClose: () => void;
    onExport: () => void;
    onImport: () => void;
    isAuthenticated: boolean;
}

interface SettingsGroup {
    title: string;
    items: SettingsItem[];
}

interface SettingsItem {
    key: string;
    label: string;
    content: ReactNode;
}

export function MobileSettingsSheet({
    open,
    onClose,
    onExport,
    onImport,
    isAuthenticated,
}: MobileSettingsSheetProps) {
    const haptics_enabled = useWorkStore((s) => s.haptics_enabled);
    const setHapticsEnabled = useWorkStore((s) => s.setHapticsEnabled);

    const [open_item, setOpenItem] = useState<SettingsItem | null>(null);

    const handleCloseItem = useCallback(() => {
        setOpenItem(null);
    }, []);

    const groups: SettingsGroup[] = [
        {
            title: SETTINGS_GROUP.DISPLAY,
            items: [
                {
                    key: "theme",
                    label: SETTINGS_TAB_THEME,
                    content: <ThemeTab />,
                },
                {
                    key: "animation",
                    label: SETTINGS_TAB_ANIMATION,
                    content: <AnimationTab is_mobile={true} />,
                },
            ],
        },
        {
            title: SETTINGS_GROUP.INPUT,
            items: [
                {
                    key: "autocomplete",
                    label: SETTINGS_TAB_AUTOCOMPLETE,
                    content: <AutoCompleteTab />,
                },
            ],
        },
        {
            title: SETTINGS_GROUP.DATA,
            items: [
                {
                    key: "data",
                    label: SETTINGS_TAB_DATA,
                    content: (
                        <DataTab
                            onExport={onExport}
                            onImport={onImport}
                            isAuthenticated={isAuthenticated}
                            is_mobile={true}
                        />
                    ),
                },
            ],
        },
    ];

    return (
        <>
            <MobileBottomSheet
                open={open}
                onClose={onClose}
                full_screen
                header={
                    <div className="flex items-center justify-between px-md py-sm border-b border-border-light">
                        <MobileIconButton
                            label={BUTTON_TEXT.close}
                            onClick={onClose}
                        >
                            <CloseOutlined style={{ fontSize: 17 }} />
                        </MobileIconButton>

                        <span className="text-lg font-semibold text-text-primary">
                            {SETTINGS_MODAL_TITLE}
                        </span>

                        <span className="mobile-touch-target" />
                    </div>
                }
            >
                <div className="px-lg pb-xl">
                    {groups.map((group) => (
                        <div key={group.title} className="mt-lg">
                            <div className="px-sm pb-sm text-sm text-text-disabled">
                                {group.title}
                            </div>

                            <div className="rounded-xl bg-bg-light overflow-hidden">
                                {group.items.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        className="w-full flex items-center justify-between px-lg py-lg border-0 bg-transparent cursor-pointer text-md text-text-primary"
                                        onClick={() => setOpenItem(item)}
                                    >
                                        {item.label}
                                        <RightOutlined className="text-text-disabled" />
                                    </button>
                                ))}

                                {group.title === SETTINGS_GROUP.INPUT && (
                                    <div className="flex items-center justify-between px-lg py-lg border-t border-border-light">
                                        <div className="min-w-0">
                                            <div className="text-md text-text-primary">
                                                {SETTINGS_ITEM.HAPTICS}
                                            </div>
                                            <div className="text-sm text-text-disabled mt-[2px]">
                                                {
                                                    SETTINGS_ITEM.HAPTICS_DESCRIPTION
                                                }
                                            </div>
                                        </div>
                                        <Switch
                                            checked={haptics_enabled}
                                            onChange={setHapticsEnabled}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </MobileBottomSheet>

            <MobileBottomSheet
                open={open_item !== null}
                onClose={handleCloseItem}
                title={open_item?.label}
                height_ratio={SUB_SHEET_HEIGHT_RATIO}
            >
                <div className="px-xl pb-xl">{open_item?.content}</div>
            </MobileBottomSheet>
        </>
    );
}
