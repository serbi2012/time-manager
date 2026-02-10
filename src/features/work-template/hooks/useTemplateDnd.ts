import { useCallback } from "react";
import {
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useWorkStore } from "@/store/useWorkStore";

/**
 * 템플릿 드래그 앤 드롭 훅
 * dnd-kit 센서 설정 및 드래그 이벤트 핸들링
 */
export function useTemplateDnd() {
    const { reorderTemplates } = useWorkStore();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (over && active.id !== over.id) {
                reorderTemplates(active.id as string, over.id as string);
            }
        },
        [reorderTemplates]
    );

    return {
        sensors,
        handleDragEnd,
    };
}
