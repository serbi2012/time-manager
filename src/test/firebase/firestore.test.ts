/* eslint-disable @typescript-eslint/no-explicit-any -- Firebase SDK 모킹 */
/**
 * firestore 유틸리티 테스트
 *
 * Firestore 데이터 서비스 테스트 (Firebase SDK 모킹)
 */
import { describe, it, expect, vi } from "vitest";
import type { WorkRecord } from "@/types";

// Firebase Firestore 모킹
const mockSetDoc = vi.fn().mockResolvedValue(undefined);
const mockGetDoc = vi.fn();
const mockDoc = vi.fn().mockReturnValue({ id: "mock-doc-ref" });

vi.mock("firebase/firestore", () => ({
    doc: (...args: any[]) => mockDoc(...args),
    setDoc: (...args: any[]) => mockSetDoc(...args),
    getDoc: (...args: any[]) => mockGetDoc(...args),
}));

const mockDbInstance = { type: "mock-firestore" };

vi.mock("@/firebase/config", async () => ({
    getDbInstance: () => Promise.resolve(mockDbInstance),
}));

// 모킹 후 import
import {
    loadUserData,
    saveRecord,
} from "@/firebase/firestore";

describe("firestore 서비스", () => {

    // =====================================================
    // loadUserData 테스트
    // =====================================================
    describe("loadUserData", () => {
        it("존재하는 사용자 데이터 로드", async () => {
            const user_id = "test-user-123";
            const mock_data = {
                records: [{ id: "r1" }],
                templates: [{ id: "t1" }],
                custom_task_options: ["업무1"],
                custom_category_options: ["카테고리1"],
                updated_at: "2026-01-19T00:00:00.000Z",
            };

            mockGetDoc.mockResolvedValueOnce({
                exists: () => true,
                data: () => mock_data,
            });

            const result = await loadUserData(user_id);

            expect(mockDoc).toHaveBeenCalledWith(
                expect.anything(),
                "users",
                user_id
            );
            expect(result).toEqual(mock_data);
        });

        it("존재하지 않는 사용자는 null 반환", async () => {
            const user_id = "non-existent-user";

            mockGetDoc.mockResolvedValueOnce({
                exists: () => false,
                data: () => null,
            });

            const result = await loadUserData(user_id);

            expect(result).toBeNull();
        });
    });

    // =====================================================
    // saveRecord: nested undefined 제거 테스트
    // =====================================================
    describe("saveRecord - nested undefined 제거", () => {
        it("세션 내 is_overnight: undefined가 Firestore 저장 데이터에서 제거된다", async () => {
            const record: WorkRecord = {
                id: "r1",
                project_code: "A00_00000",
                work_name: "작업",
                task_name: "개발",
                deal_name: "거래",
                category_name: "개발",
                duration_minutes: 60,
                note: "",
                start_time: "09:00",
                end_time: "10:00",
                date: "2026-03-18",
                sessions: [
                    {
                        id: "s1",
                        date: "2026-03-18",
                        start_time: "09:00",
                        end_time: "10:00",
                        duration_minutes: 60,
                        is_overnight: undefined,
                    },
                ],
                is_completed: false,
            };

            await saveRecord("test-user", record);

            expect(mockSetDoc).toHaveBeenCalled();
            const saved_data = mockSetDoc.mock.calls[0][1];
            const saved_session = saved_data.sessions[0];
            expect(saved_session).not.toHaveProperty("is_overnight");
            expect(saved_session.start_time).toBe("09:00");
            expect(saved_session.end_time).toBe("10:00");
        });

        it("세션 내 is_overnight: true는 유지된다", async () => {
            const record: WorkRecord = {
                id: "r2",
                project_code: "A00_00000",
                work_name: "야간 작업",
                task_name: "개발",
                deal_name: "거래",
                category_name: "개발",
                duration_minutes: 264,
                note: "",
                start_time: "22:00",
                end_time: "02:24",
                date: "2026-03-18",
                sessions: [
                    {
                        id: "s1",
                        date: "2026-03-18",
                        start_time: "22:00",
                        end_time: "02:24",
                        duration_minutes: 264,
                        is_overnight: true,
                    },
                ],
                is_completed: false,
            };

            await saveRecord("test-user", record);

            const saved_data = mockSetDoc.mock.calls[0][1];
            const saved_session = saved_data.sessions[0];
            expect(saved_session.is_overnight).toBe(true);
        });

        it("레코드 최상위 undefined 필드도 제거된다", async () => {
            const record = {
                id: "r3",
                project_code: "A00_00000",
                work_name: "작업",
                task_name: "개발",
                deal_name: "거래",
                category_name: "개발",
                duration_minutes: 60,
                note: "",
                start_time: "09:00",
                end_time: "10:00",
                date: "2026-03-18",
                sessions: [],
                is_completed: false,
                completed_at: undefined,
                deleted_at: undefined,
            } as unknown as WorkRecord;

            await saveRecord("test-user", record);

            const saved_data = mockSetDoc.mock.calls[0][1];
            expect(saved_data).not.toHaveProperty("completed_at");
            expect(saved_data).not.toHaveProperty("deleted_at");
        });
    });
});
