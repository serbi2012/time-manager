/**
 * AutoComplete + 숨기기 버튼 공통 컴포넌트
 *
 * DailyGanttChart, WorkRecordTable, WorkTemplateList에서 중복되던 패턴을 통합
 * 옵션에 숨기기(X) 버튼을 표시하고 하이라이트 기능을 지원
 *
 * @example
 * <AutoCompleteWithHide
 *   options={projectCodeOptions}
 *   placeholder="프로젝트 코드"
 *   onHideOption={(value) => hideAutoCompleteOption("project_code", value)}
 *   searchValue={searchText}
 * />
 */

import { useCallback, useMemo } from "react";
import { AutoComplete, type AutoCompleteProps } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { HighlightText } from "../HighlightText";

export interface AutoCompleteOption {
    value: string;
    label?: string;
}

export interface AutoCompleteWithHideProps
    extends Omit<AutoCompleteProps, "options"> {
    /** 옵션 목록 (value, label 형태) */
    options: AutoCompleteOption[];
    /** 옵션 숨기기 콜백 */
    onHideOption?: (value: string) => void;
    /** 검색어 (하이라이트용) */
    searchValue?: string;
    /** 숨기기 버튼 표시 여부 (기본값: true) */
    showHideButton?: boolean;
    /** 숨기기 시 메시지 표시 콜백 */
    onHideMessage?: (value: string) => void;
}

/**
 * AutoComplete + 숨기기 버튼 컴포넌트
 */
export function AutoCompleteWithHide({
    options,
    onHideOption,
    searchValue = "",
    showHideButton = true,
    onHideMessage,
    ...autoCompleteProps
}: AutoCompleteWithHideProps) {
    const handleHide = useCallback(
        (e: React.MouseEvent, value: string) => {
            e.stopPropagation();
            onHideOption?.(value);
            onHideMessage?.(value);
        },
        [onHideOption, onHideMessage]
    );

    // 숨기기 버튼과 하이라이트가 적용된 옵션 생성
    const enhanced_options = useMemo(() => {
        if (!showHideButton && !searchValue) {
            return options;
        }

        return options.map((opt) => ({
            value: opt.value,
            label: (
                <div className="flex justify-between items-center">
                    <span>
                        {searchValue ? (
                            <HighlightText
                                text={opt.label || opt.value}
                                search={searchValue}
                            />
                        ) : (
                            opt.label || opt.value
                        )}
                    </span>
                    {showHideButton && onHideOption && (
                        <CloseOutlined
                            className="!text-[10px] !text-[#999] cursor-pointer"
                            onClick={(e) => handleHide(e, opt.value)}
                        />
                    )}
                </div>
            ),
        }));
    }, [options, showHideButton, searchValue, onHideOption, handleHide]);

    return <AutoComplete options={enhanced_options} {...autoCompleteProps} />;
}

export default AutoCompleteWithHide;
