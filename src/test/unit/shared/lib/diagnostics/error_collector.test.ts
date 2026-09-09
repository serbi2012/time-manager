import { describe, it, expect, beforeEach, vi } from "vitest";
import {
    recordDiagnosticEvent,
    getDiagnosticEvents,
    getDiagnosticErrorCount,
    clearDiagnosticEvents,
    subscribeToDiagnosticEvents,
    installDiagnosticCollector,
    DIAGNOSTIC_EVENT_LIMIT,
} from "@/shared/lib/diagnostics";

describe("error_collector", () => {
    beforeEach(() => {
        clearDiagnosticEvents();
    });

    it("기록한 이벤트를 조회할 수 있다", () => {
        recordDiagnosticEvent({
            level: "error",
            source: "manual",
            message: "테스트 오류",
        });

        const events = getDiagnosticEvents();

        expect(events).toHaveLength(1);
        expect(events[0].message).toBe("테스트 오류");
        expect(events[0].id).toBeTruthy();
        expect(events[0].at).toBeTruthy();
    });

    it("error 레벨만 세어 오류 개수를 반환한다", () => {
        recordDiagnosticEvent({
            level: "error",
            source: "manual",
            message: "오류",
        });
        recordDiagnosticEvent({
            level: "warn",
            source: "manual",
            message: "경고",
        });

        expect(getDiagnosticErrorCount()).toBe(1);
    });

    it("버퍼 한도를 넘으면 오래된 이벤트를 버린다", () => {
        for (let i = 0; i < DIAGNOSTIC_EVENT_LIMIT + 10; i += 1) {
            recordDiagnosticEvent({
                level: "info",
                source: "manual",
                message: `이벤트 ${i}`,
            });
        }

        const events = getDiagnosticEvents();

        expect(events).toHaveLength(DIAGNOSTIC_EVENT_LIMIT);
        expect(events[events.length - 1].message).toBe(
            `이벤트 ${DIAGNOSTIC_EVENT_LIMIT + 9}`
        );
    });

    it("기록을 지우면 목록이 비워진다", () => {
        recordDiagnosticEvent({
            level: "error",
            source: "manual",
            message: "오류",
        });

        clearDiagnosticEvents();

        expect(getDiagnosticEvents()).toHaveLength(0);
    });

    it("구독자에게 변경을 알린다", () => {
        const listener = vi.fn();
        const unsubscribe = subscribeToDiagnosticEvents(listener);

        recordDiagnosticEvent({
            level: "error",
            source: "manual",
            message: "오류",
        });

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0][0]).toHaveLength(1);

        unsubscribe();
        recordDiagnosticEvent({
            level: "error",
            source: "manual",
            message: "두 번째",
        });

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it("window error 이벤트를 잡아 기록한다", () => {
        const uninstall = installDiagnosticCollector();

        window.dispatchEvent(
            new ErrorEvent("error", {
                message: "전역 오류",
                filename: "app.js",
                lineno: 10,
                colno: 5,
            })
        );

        const events = getDiagnosticEvents();
        expect(events).toHaveLength(1);
        expect(events[0].source).toBe("window.error");
        expect(events[0].message).toBe("전역 오류");
        expect(events[0].context).toMatchObject({
            filename: "app.js",
            line: 10,
            column: 5,
        });

        uninstall();
    });

    it("해제 후에는 더 이상 수집하지 않는다", () => {
        const uninstall = installDiagnosticCollector();
        uninstall();

        window.dispatchEvent(new ErrorEvent("error", { message: "무시됨" }));

        expect(getDiagnosticEvents()).toHaveLength(0);
    });
});
