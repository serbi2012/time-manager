/**
 * Vitest 커스텀 매처
 * 도메인 특화 검증 함수
 */
import { expect } from "vitest";
import type { WorkRecord, WorkSession } from "@/shared/types/domain";

// ============================================================================
// 타입 정의
// ============================================================================

interface CustomMatchers<R = unknown> {
    /** HH:mm 형식의 시간인지 확인 */
    toBeValidTimeFormat(): R;

    /** YYYY-MM-DD 형식의 날짜인지 확인 */
    toBeValidDateFormat(): R;

    /** 유효한 WorkRecord인지 확인 */
    toBeValidWorkRecord(): R;

    /** 유효한 WorkSession인지 확인 */
    toBeValidWorkSession(): R;

    /** 시간이 범위 내에 있는지 확인 */
    toBeWithinTimeRange(start: string, end: string): R;

    /** 두 레코드가 시간 충돌인지 확인 */
    toConflictWith(other: WorkRecord): R;

    /** 요소가 애니메이션 완료 상태인지 확인 */
    toHaveCompletedAnimation(): R;

    /** 요소가 특정 CSS 변수를 가지는지 확인 */
    toHaveCSSVariable(variable: string, value?: string): R;
}

declare module "vitest" {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface Assertion<T = any> extends CustomMatchers<T> {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
}

// ============================================================================
// 매처 구현
// ============================================================================

expect.extend({
    /**
     * HH:mm 형식의 시간인지 확인
     * @example expect("09:30").toBeValidTimeFormat()
     */
    toBeValidTimeFormat(received: unknown) {
        const pass =
            typeof received === "string" &&
            /^([01]\d|2[0-3]):([0-5]\d)$/.test(received);

        return {
            pass,
            message: () =>
                pass
                    ? `expected ${received} not to be valid time format (HH:mm)`
                    : `expected ${received} to be valid time format (HH:mm)`,
        };
    },

    /**
     * YYYY-MM-DD 형식의 날짜인지 확인
     * @example expect("2024-01-15").toBeValidDateFormat()
     */
    toBeValidDateFormat(received: unknown) {
        const pass =
            typeof received === "string" &&
            /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(received);

        return {
            pass,
            message: () =>
                pass
                    ? `expected ${received} not to be valid date format (YYYY-MM-DD)`
                    : `expected ${received} to be valid date format (YYYY-MM-DD)`,
        };
    },

    /**
     * 유효한 WorkRecord인지 확인
     */
    toBeValidWorkRecord(received: unknown) {
        const record = received as WorkRecord;
        const checks = [
            typeof record?.id === "string",
            typeof record?.work_name === "string",
            typeof record?.date === "string",
            Array.isArray(record?.sessions),
            typeof record?.duration_minutes === "number",
        ];

        const pass = checks.every(Boolean);

        return {
            pass,
            message: () =>
                pass
                    ? `expected value not to be a valid WorkRecord`
                    : `expected value to be a valid WorkRecord, missing required fields`,
        };
    },

    /**
     * 유효한 WorkSession인지 확인
     */
    toBeValidWorkSession(received: unknown) {
        const session = received as WorkSession;
        const checks = [
            typeof session?.id === "string",
            typeof session?.date === "string",
            typeof session?.start_time === "string",
            typeof session?.end_time === "string",
            typeof session?.duration_minutes === "number",
        ];

        const pass = checks.every(Boolean);

        return {
            pass,
            message: () =>
                pass
                    ? `expected value not to be a valid WorkSession`
                    : `expected value to be a valid WorkSession, missing required fields`,
        };
    },

    /**
     * 시간이 범위 내에 있는지 확인
     * @example expect("09:30").toBeWithinTimeRange("09:00", "10:00")
     */
    toBeWithinTimeRange(received: string, start: string, end: string) {
        const toMinutes = (time: string) => {
            const [h, m] = time.split(":").map(Number);
            return h * 60 + m;
        };

        const receivedMinutes = toMinutes(received);
        const startMinutes = toMinutes(start);
        const endMinutes = toMinutes(end);

        const pass =
            receivedMinutes >= startMinutes && receivedMinutes <= endMinutes;

        return {
            pass,
            message: () =>
                pass
                    ? `expected ${received} not to be within time range ${start} - ${end}`
                    : `expected ${received} to be within time range ${start} - ${end}`,
        };
    },

    /**
     * 두 레코드가 시간 충돌인지 확인
     */
    toConflictWith(received: WorkRecord, other: WorkRecord) {
        const toMinutes = (time: string) => {
            const [h, m] = time.split(":").map(Number);
            return h * 60 + m;
        };

        const hasConflict = received.sessions.some((session1: WorkSession) =>
            other.sessions.some((session2: WorkSession) => {
                if (session1.date !== session2.date) return false;

                const start1 = toMinutes(session1.start_time);
                const end1 = toMinutes(session1.end_time);
                const start2 = toMinutes(session2.start_time);
                const end2 = toMinutes(session2.end_time);

                return start1 < end2 && end1 > start2;
            })
        );

        return {
            pass: hasConflict,
            message: () =>
                hasConflict
                    ? `expected records not to have time conflict`
                    : `expected records to have time conflict`,
        };
    },

    /**
     * 요소가 애니메이션 완료 상태인지 확인
     */
    toHaveCompletedAnimation(received: HTMLElement) {
        const style = window.getComputedStyle(received);
        const opacity = parseFloat(style.opacity);
        const transform = style.transform;

        const pass =
            opacity === 1 &&
            (transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)");

        return {
            pass,
            message: () =>
                pass
                    ? `expected element not to have completed animation`
                    : `expected element to have completed animation (opacity: ${opacity}, transform: ${transform})`,
        };
    },

    /**
     * 요소가 특정 CSS 변수를 가지는지 확인
     */
    toHaveCSSVariable(
        received: HTMLElement,
        variable: string,
        expectedValue?: string
    ) {
        const style = window.getComputedStyle(received);
        const value = style.getPropertyValue(variable).trim();

        const pass = expectedValue ? value === expectedValue : value !== "";

        return {
            pass,
            message: () => {
                if (expectedValue) {
                    return pass
                        ? `expected element not to have CSS variable ${variable} with value ${expectedValue}`
                        : `expected element to have CSS variable ${variable} with value ${expectedValue}, but got ${
                              value || "(empty)"
                          }`;
                }
                return pass
                    ? `expected element not to have CSS variable ${variable}`
                    : `expected element to have CSS variable ${variable}`;
            },
        };
    },
});

// 타입 추론을 위한 더미 export
export {};
