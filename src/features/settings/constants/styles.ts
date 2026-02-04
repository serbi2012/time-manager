/**
 * 설정 모달 스타일 상수
 */

import type React from "react";

const SETTINGS_MODAL_WIDTH = 750;
const SETTINGS_MODAL_WIDTH_MOBILE = "calc(100% - 24px)";
const SETTINGS_MODAL_MAX_WIDTH_MOBILE = 400;
const SETTINGS_TAB_BAR_WIDTH = 120;
const SETTINGS_TAB_CONTENT_MAX_HEIGHT = "calc(70vh - 120px)";
const SETTINGS_TAB_CONTENT_MAX_HEIGHT_MOBILE = "calc(100vh - 280px)";
const SETTINGS_TAB_CONTENT_MIN_HEIGHT = 300;
const SETTINGS_TAB_CONTENT_MAX_HEIGHT_DESKTOP_PX = 500;
const SETTINGS_DESKTOP_TABS_HEIGHT = "calc(70vh - 80px)";
const SETTINGS_DESKTOP_TABS_MAX_HEIGHT = 540;
const SETTINGS_DESKTOP_TABS_MIN_HEIGHT = 340;

export const SETTINGS_LAYOUT = {
    MODAL_WIDTH: SETTINGS_MODAL_WIDTH,
    MODAL_WIDTH_MOBILE: SETTINGS_MODAL_WIDTH_MOBILE,
    MODAL_MAX_WIDTH_MOBILE: SETTINGS_MODAL_MAX_WIDTH_MOBILE,
    TAB_BAR_WIDTH: SETTINGS_TAB_BAR_WIDTH,
    TAB_CONTENT_MAX_HEIGHT: SETTINGS_TAB_CONTENT_MAX_HEIGHT,
    TAB_CONTENT_MAX_HEIGHT_MOBILE: SETTINGS_TAB_CONTENT_MAX_HEIGHT_MOBILE,
    TAB_CONTENT_MIN_HEIGHT: SETTINGS_TAB_CONTENT_MIN_HEIGHT,
    TAB_CONTENT_MAX_HEIGHT_PX: SETTINGS_TAB_CONTENT_MAX_HEIGHT_DESKTOP_PX,
    DESKTOP_TABS_HEIGHT: SETTINGS_DESKTOP_TABS_HEIGHT,
    DESKTOP_TABS_MAX_HEIGHT: SETTINGS_DESKTOP_TABS_MAX_HEIGHT,
    DESKTOP_TABS_MIN_HEIGHT: SETTINGS_DESKTOP_TABS_MIN_HEIGHT,
} as const;

export const TAB_CONTAINER_STYLE: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 24,
};

export const TAB_CONTAINER_STYLE_MOBILE: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 16,
};

export const SETTINGS_SCROLL_WRAPPER_DESKTOP: React.CSSProperties = {
    height: SETTINGS_TAB_CONTENT_MAX_HEIGHT,
    maxHeight: SETTINGS_TAB_CONTENT_MAX_HEIGHT_DESKTOP_PX,
    minHeight: SETTINGS_TAB_CONTENT_MIN_HEIGHT,
    overflowY: "auto",
    paddingRight: 8,
};

export const SETTINGS_SCROLL_WRAPPER_MOBILE: React.CSSProperties = {
    maxHeight: SETTINGS_TAB_CONTENT_MAX_HEIGHT_MOBILE,
    overflowY: "auto",
    overflowX: "hidden",
    paddingBottom: 16,
    paddingRight: 4,
};

export const SETTINGS_TAB_BAR_STYLE: React.CSSProperties = {
    width: SETTINGS_TAB_BAR_WIDTH,
    flexShrink: 0,
    borderRight: "1px solid #f0f0f0",
    marginRight: 0,
};

export const SETTINGS_TABS_CONTAINER_STYLE: React.CSSProperties = {
    height: SETTINGS_DESKTOP_TABS_HEIGHT,
    maxHeight: SETTINGS_DESKTOP_TABS_MAX_HEIGHT,
    minHeight: SETTINGS_DESKTOP_TABS_MIN_HEIGHT,
};

export const SETTINGS_MODAL_BODY_DESKTOP: React.CSSProperties = {
    padding: "12px 24px 24px",
};

export const SETTINGS_MODAL_BODY_MOBILE: React.CSSProperties = {
    padding: "0 12px 12px",
    maxHeight: "calc(100vh - 180px)",
    overflow: "hidden",
};

export const SETTINGS_MODAL_STYLE_MOBILE: React.CSSProperties = {
    maxWidth: SETTINGS_MODAL_MAX_WIDTH_MOBILE,
    margin: "0 auto",
};
