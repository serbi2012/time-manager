/**
 * Select + 새 옵션 추가 + 숨기기 버튼 공통 컴포넌트
 *
 * DailyGanttChart, WorkRecordTable, WorkTemplateList에서 중복되던 패턴을 통합
 *
 * @example
 * <SelectWithAdd
 *   options={taskOptions}
 *   placeholder="업무 선택"
 *   onAddOption={handleAddTask}
 *   onHideOption={(value) => hideAutoCompleteOption("task_option", value)}
 *   addPlaceholder="새 업무명"
 * />
 */

import { useState, useRef, useCallback } from "react";
import { Select, Input, Button, Divider, Space, type SelectProps } from "antd";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
import type { InputRef } from "antd";

export interface SelectWithAddProps
    extends Omit<SelectProps, "dropdownRender" | "optionRender"> {
    /** 새 옵션 추가 콜백 */
    onAddOption?: (value: string) => void;
    /** 옵션 숨기기 콜백 */
    onHideOption?: (value: string) => void;
    /** 추가 입력 placeholder (기본값: "새 항목") */
    addPlaceholder?: string;
    /** 숨기기 버튼 표시 여부 (기본값: true) */
    showHideButton?: boolean;
    /** 추가 영역 표시 여부 (기본값: true) */
    showAddArea?: boolean;
    /** 추가 입력 너비 (기본값: 130) */
    addInputWidth?: number;
}

/**
 * Select + 새 옵션 추가 + 숨기기 버튼 컴포넌트
 */
export function SelectWithAdd({
    onAddOption,
    onHideOption,
    addPlaceholder = "새 항목",
    showHideButton = true,
    showAddArea = true,
    addInputWidth = 130,
    options,
    ...selectProps
}: SelectWithAddProps) {
    const [new_value, setNewValue] = useState("");
    const input_ref = useRef<InputRef>(null);

    const handleAdd = useCallback(() => {
        const trimmed = new_value.trim();
        if (trimmed && onAddOption) {
            onAddOption(trimmed);
            setNewValue("");
            // 추가 후 다시 입력에 포커스
            setTimeout(() => input_ref.current?.focus(), 0);
        }
    }, [new_value, onAddOption]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            e.stopPropagation();
            if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
            }
        },
        [handleAdd]
    );

    const stopPropagation = useCallback(
        (e: React.MouseEvent | React.FocusEvent) => {
            e.stopPropagation();
        },
        []
    );

    const focusInput = useCallback(() => {
        setTimeout(() => input_ref.current?.focus(), 0);
    }, []);

    return (
        <Select
            options={options}
            {...selectProps}
            optionRender={
                showHideButton && onHideOption
                    ? (option) => (
                          <div className="flex justify-between items-center">
                              <span>{option.label}</span>
                              <CloseOutlined
                                  className="!text-[10px] !text-[#999] cursor-pointer"
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      onHideOption(option.value as string);
                                  }}
                              />
                          </div>
                      )
                    : undefined
            }
            popupRender={
                showAddArea && onAddOption
                    ? (menu) => (
                          <>
                              {menu}
                              <Divider className="!my-sm" />
                              <Space
                                  className="!px-sm !pb-xs !pt-0 !w-full"
                                  onMouseDown={stopPropagation}
                                  onClick={(e) => {
                                      stopPropagation(e);
                                      focusInput();
                                  }}
                              >
                                  <Input
                                      ref={input_ref}
                                      placeholder={addPlaceholder}
                                      value={new_value}
                                      onChange={(e) =>
                                          setNewValue(e.target.value)
                                      }
                                      onKeyDown={handleKeyDown}
                                      onMouseDown={(e) => {
                                          stopPropagation(e);
                                          focusInput();
                                      }}
                                      onClick={(e) => {
                                          stopPropagation(e);
                                          input_ref.current?.focus();
                                      }}
                                      onFocus={stopPropagation}
                                      size="small"
                                      style={{ width: addInputWidth }}
                                  />
                                  <Button
                                      type="text"
                                      icon={<PlusOutlined />}
                                      onClick={handleAdd}
                                      onMouseDown={stopPropagation}
                                      size="small"
                                  >
                                      추가
                                  </Button>
                              </Space>
                          </>
                      )
                    : undefined
            }
        />
    );
}

export default SelectWithAdd;
