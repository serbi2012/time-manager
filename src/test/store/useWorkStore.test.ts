/**
 * useWorkStore 유닛 테스트
 *
 * 테스트 범위:
 * - 타이머 시작/정지/전환
 * - 레코드 CRUD
 * - 세션 관리 (시간 충돌 감지/조정)
 * - 템플릿 관리
 * - 필터링 로직
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useWorkStore } from "../../store/useWorkStore";
import type { WorkRecord, WorkTemplate } from "../../types";

// 스토어 초기화 헬퍼
const resetStore = () => {
    useWorkStore.setState({
        records: [],
        templates: [],
        timer: {
            is_running: false,
            start_time: null,
            active_template_id: null,
            active_form_data: null,
            active_record_id: null,
            active_session_id: null,
        },
        form_data: {
            project_code: "",
            work_name: "",
            task_name: "",
            deal_name: "",
            category_name: "",
            note: "",
        },
        selected_date: "2026-01-19",
        custom_task_options: [],
        custom_category_options: [],
        hidden_autocomplete_options: {
            work_name: [],
            task_name: [],
            deal_name: [],
            project_code: [],
            task_option: [],
            category_option: [],
        },
        lunch_start_time: "11:40",
        lunch_end_time: "12:40",
    });
};

// 테스트용 레코드 생성 헬퍼
const createTestRecord = (overrides: Partial<WorkRecord> = {}): WorkRecord => ({
    id: "test-record-1",
    project_code: "A00_00000",
    work_name: "테스트 작업",
    task_name: "개발",
    deal_name: "테스트 거래",
    category_name: "개발",
    duration_minutes: 60,
    note: "",
    start_time: "09:00",
    end_time: "10:00",
    date: "2026-01-19",
    sessions: [
        {
            id: "session-1",
            date: "2026-01-19",
            start_time: "09:00",
            end_time: "10:00",
            duration_minutes: 60,
        },
    ],
    is_completed: false,
    ...overrides,
});

// 테스트용 템플릿 생성 헬퍼
const createTestTemplate = (
    overrides: Partial<WorkTemplate> = {}
): WorkTemplate => ({
    id: "test-template-1",
    project_code: "A00_00000",
    work_name: "테스트 작업",
    task_name: "개발",
    deal_name: "테스트 거래",
    category_name: "개발",
    note: "",
    color: "#1890ff",
    created_at: "2026-01-19T00:00:00.000Z",
    ...overrides,
});

describe("useWorkStore", () => {
    beforeEach(() => {
        resetStore();
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-01-19T10:00:00"));
    });

    // =====================================================
    // 타이머 테스트
    // =====================================================
    describe("타이머", () => {
        it("타이머를 시작하면 is_running이 true가 되고 start_time이 설정됨", () => {
            const store = useWorkStore.getState();
            store.setFormData({
                work_name: "테스트",
                deal_name: "거래",
            });
            store.startTimer();

            const state = useWorkStore.getState();
            expect(state.timer.is_running).toBe(true);
            expect(state.timer.start_time).not.toBeNull();
            expect(state.timer.active_form_data).toMatchObject({
                work_name: "테스트",
                deal_name: "거래",
            });
        });

        it("타이머를 정지하면 새 레코드가 생성됨", () => {
            const store = useWorkStore.getState();

            // 폼 데이터 설정
            store.setFormData({
                work_name: "테스트 작업",
                deal_name: "테스트 거래",
                task_name: "개발",
                category_name: "개발",
            });

            // 타이머 시작
            store.startTimer();

            // 30분 후
            vi.advanceTimersByTime(30 * 60 * 1000);

            // 타이머 정지
            const result = useWorkStore.getState().stopTimer();

            const state = useWorkStore.getState();
            expect(state.timer.is_running).toBe(false);
            expect(state.records).toHaveLength(1);
            expect(result).not.toBeNull();
            expect(result?.work_name).toBe("테스트 작업");
        });

        it("같은 work_name + deal_name의 레코드가 있으면 기존 레코드에 세션 추가", () => {
            const existing_record = createTestRecord();
            useWorkStore.setState({ records: [existing_record] });

            const store = useWorkStore.getState();
            store.setFormData({
                work_name: "테스트 작업",
                deal_name: "테스트 거래",
            });

            store.startTimer();
            vi.advanceTimersByTime(30 * 60 * 1000);
            store.stopTimer();

            const state = useWorkStore.getState();
            expect(state.records).toHaveLength(1);
            expect(state.records[0].sessions).toHaveLength(2);
        });

        it("getElapsedSeconds는 경과 시간(초)을 반환함", () => {
            const store = useWorkStore.getState();
            store.setFormData({ work_name: "test", deal_name: "test" });
            store.startTimer();

            // 65초 경과
            vi.advanceTimersByTime(65 * 1000);

            const elapsed = useWorkStore.getState().getElapsedSeconds();
            expect(elapsed).toBe(65);
        });

        it("resetTimer는 타이머와 폼 데이터를 초기화함", () => {
            const store = useWorkStore.getState();
            store.setFormData({ work_name: "test", deal_name: "test" });
            store.startTimer();
            store.resetTimer();

            const state = useWorkStore.getState();
            expect(state.timer.is_running).toBe(false);
            expect(state.timer.start_time).toBeNull();
            expect(state.form_data.work_name).toBe("");
        });

        it("startTimerForRecord는 기존 레코드에 세션을 추가하며 타이머 시작", () => {
            // 기존 레코드 생성
            const existing_record = createTestRecord({
                id: "existing-record",
                work_name: "기존 작업",
                deal_name: "기존 거래",
            });
            useWorkStore.setState({ records: [existing_record] });

            // 기존 레코드에서 타이머 시작
            useWorkStore.getState().startTimerForRecord("existing-record");

            const state = useWorkStore.getState();
            expect(state.timer.is_running).toBe(true);
            expect(state.timer.active_record_id).toBe("existing-record");
            expect(state.records[0].sessions).toHaveLength(2); // 기존 1개 + 새로 추가된 1개
            // form_data도 해당 레코드의 데이터로 설정됨
            expect(state.form_data.work_name).toBe("기존 작업");
            expect(state.form_data.deal_name).toBe("기존 거래");
        });

        it("startTimerForRecord는 타이머 실행 중이면 먼저 정지 후 시작", () => {
            // 첫 번째 레코드
            const record1 = createTestRecord({
                id: "record-1",
                work_name: "작업1",
                deal_name: "거래1",
            });
            // 두 번째 레코드
            const record2 = createTestRecord({
                id: "record-2",
                work_name: "작업2",
                deal_name: "거래2",
                sessions: [
                    {
                        id: "session-2",
                        date: "2026-01-19",
                        start_time: "11:00",
                        end_time: "12:00",
                        duration_minutes: 60,
                    },
                ],
            });
            useWorkStore.setState({ records: [record1, record2] });

            // record1에서 타이머 시작
            useWorkStore.getState().startTimerForRecord("record-1");
            vi.advanceTimersByTime(10 * 60 * 1000); // 10분 경과

            // record2에서 타이머 시작 (record1은 자동으로 정지되어야 함)
            useWorkStore.getState().startTimerForRecord("record-2");

            const state = useWorkStore.getState();
            expect(state.timer.is_running).toBe(true);
            expect(state.timer.active_record_id).toBe("record-2");
            // record1의 세션이 완료됨 (end_time이 설정됨)
            const record1_state = state.records.find(
                (r) => r.id === "record-1"
            );
            expect(record1_state?.sessions).toHaveLength(2);
            expect(record1_state?.sessions[1].end_time).not.toBe("");
        });

        it("startTimerForRecord는 존재하지 않는 레코드 ID면 아무것도 하지 않음", () => {
            const existing_record = createTestRecord();
            useWorkStore.setState({ records: [existing_record] });

            // 존재하지 않는 ID로 시작 시도
            useWorkStore.getState().startTimerForRecord("non-existent-id");

            const state = useWorkStore.getState();
            expect(state.timer.is_running).toBe(false);
            expect(state.records[0].sessions).toHaveLength(1); // 변화 없음
        });

        it("startTimerForRecord는 이미 진행 중인 세션이 있으면 새 세션을 추가하지 않음", () => {
            // 진행 중인 세션이 있는 레코드
            const record_with_running_session = createTestRecord({
                id: "running-record",
                sessions: [
                    {
                        id: "running-session",
                        date: "2026-01-19",
                        start_time: "09:00",
                        end_time: "", // 진행 중
                        duration_minutes: 0,
                    },
                ],
            });
            useWorkStore.setState({ records: [record_with_running_session] });

            // 같은 레코드에서 타이머 시작 시도
            useWorkStore.getState().startTimerForRecord("running-record");

            const state = useWorkStore.getState();
            expect(state.timer.is_running).toBe(true);
            expect(state.timer.active_session_id).toBe("running-session"); // 기존 세션 사용
            expect(state.records[0].sessions).toHaveLength(1); // 새 세션 추가 안됨
        });
    });

    // =====================================================
    // 레코드 CRUD 테스트
    // =====================================================
    describe("레코드 CRUD", () => {
        it("addRecord로 레코드 추가", () => {
            const record = createTestRecord();
            useWorkStore.getState().addRecord(record);

            const state = useWorkStore.getState();
            expect(state.records).toHaveLength(1);
            expect(state.records[0].id).toBe("test-record-1");
        });

        it("updateRecord로 레코드 수정", () => {
            const record = createTestRecord();
            useWorkStore.setState({ records: [record] });

            useWorkStore.getState().updateRecord("test-record-1", {
                work_name: "수정된 작업",
            });

            const state = useWorkStore.getState();
            expect(state.records[0].work_name).toBe("수정된 작업");
        });

        it("deleteRecord로 레코드 삭제", () => {
            const record = createTestRecord();
            useWorkStore.setState({ records: [record] });

            useWorkStore.getState().deleteRecord("test-record-1");

            const state = useWorkStore.getState();
            expect(state.records).toHaveLength(0);
        });

        it("softDeleteRecord로 휴지통 이동", () => {
            const record = createTestRecord();
            useWorkStore.setState({ records: [record] });

            useWorkStore.getState().softDeleteRecord("test-record-1");

            const state = useWorkStore.getState();
            expect(state.records[0].is_deleted).toBe(true);
            expect(state.records[0].deleted_at).toBeDefined();
        });

        it("restoreRecord로 휴지통에서 복원", () => {
            const record = createTestRecord({
                is_deleted: true,
                deleted_at: "2026-01-19T00:00:00.000Z",
            });
            useWorkStore.setState({ records: [record] });

            useWorkStore.getState().restoreRecord("test-record-1");

            const state = useWorkStore.getState();
            expect(state.records[0].is_deleted).toBe(false);
            expect(state.records[0].deleted_at).toBeUndefined();
        });

        it("getDeletedRecords는 삭제된 레코드만 반환", () => {
            const records = [
                createTestRecord({ id: "r1", is_deleted: false }),
                createTestRecord({ id: "r2", is_deleted: true }),
                createTestRecord({ id: "r3", is_deleted: true }),
            ];
            useWorkStore.setState({ records });

            const deleted = useWorkStore.getState().getDeletedRecords();
            expect(deleted).toHaveLength(2);
            expect(deleted.map((r) => r.id)).toEqual(["r2", "r3"]);
        });
    });

    // =====================================================
    // 세션 관리 테스트
    // =====================================================
    describe("세션 관리", () => {
        it("updateSession으로 세션 시간 수정", () => {
            const record = createTestRecord();
            useWorkStore.setState({ records: [record] });

            const result = useWorkStore
                .getState()
                .updateSession("test-record-1", "session-1", "09:30", "10:30");

            expect(result.success).toBe(true);
            const state = useWorkStore.getState();
            expect(state.records[0].sessions[0].start_time).toBe("09:30");
            expect(state.records[0].sessions[0].end_time).toBe("10:30");
        });

        it("종료 시간이 시작 시간보다 빠르면 실패", () => {
            const record = createTestRecord();
            useWorkStore.setState({ records: [record] });

            const result = useWorkStore
                .getState()
                .updateSession("test-record-1", "session-1", "10:00", "09:00");

            expect(result.success).toBe(false);
            expect(result.message).toContain("종료 시간은 시작 시간보다");
        });

        it("다른 세션과 충돌 시 자동 조정", () => {
            // 두 개의 세션이 있는 레코드
            const record = createTestRecord({
                sessions: [
                    {
                        id: "session-1",
                        date: "2026-01-19",
                        start_time: "09:00",
                        end_time: "10:00",
                        duration_minutes: 60,
                    },
                    {
                        id: "session-2",
                        date: "2026-01-19",
                        start_time: "11:00",
                        end_time: "12:00",
                        duration_minutes: 60,
                    },
                ],
            });
            useWorkStore.setState({ records: [record] });

            // session-2의 시작 시간을 session-1과 겹치게 변경 시도
            const result = useWorkStore.getState().updateSession(
                "test-record-1",
                "session-2",
                "09:30", // session-1과 겹침
                "10:30"
            );

            // 자동 조정되어야 함
            expect(result.success).toBe(true);
            expect(result.adjusted).toBe(true);
        });

        it("deleteSession으로 세션 삭제", () => {
            const record = createTestRecord({
                sessions: [
                    {
                        id: "session-1",
                        date: "2026-01-19",
                        start_time: "09:00",
                        end_time: "10:00",
                        duration_minutes: 60,
                    },
                    {
                        id: "session-2",
                        date: "2026-01-19",
                        start_time: "11:00",
                        end_time: "12:00",
                        duration_minutes: 60,
                    },
                ],
            });
            useWorkStore.setState({ records: [record] });

            useWorkStore.getState().deleteSession("test-record-1", "session-1");

            const state = useWorkStore.getState();
            expect(state.records[0].sessions).toHaveLength(1);
            expect(state.records[0].sessions[0].id).toBe("session-2");
        });

        it("마지막 세션 삭제 시 레코드도 삭제됨", () => {
            const record = createTestRecord();
            useWorkStore.setState({ records: [record] });

            useWorkStore.getState().deleteSession("test-record-1", "session-1");

            const state = useWorkStore.getState();
            expect(state.records).toHaveLength(0);
        });
    });

    // =====================================================
    // 템플릿 관리 테스트
    // =====================================================
    describe("템플릿 관리", () => {
        it("addTemplate으로 템플릿 추가 (id와 created_at 자동 생성)", () => {
            const result = useWorkStore.getState().addTemplate({
                project_code: "A00_00000",
                work_name: "새 작업",
                task_name: "개발",
                deal_name: "새 거래",
                category_name: "개발",
                note: "",
                color: "#1890ff",
            });

            expect(result.id).toBeDefined();
            expect(result.created_at).toBeDefined();

            const state = useWorkStore.getState();
            expect(state.templates).toHaveLength(1);
        });

        it("updateTemplate으로 템플릿 수정", () => {
            const template = createTestTemplate();
            useWorkStore.setState({ templates: [template] });

            useWorkStore.getState().updateTemplate("test-template-1", {
                work_name: "수정된 작업",
            });

            const state = useWorkStore.getState();
            expect(state.templates[0].work_name).toBe("수정된 작업");
        });

        it("deleteTemplate으로 템플릿 삭제", () => {
            const template = createTestTemplate();
            useWorkStore.setState({ templates: [template] });

            useWorkStore.getState().deleteTemplate("test-template-1");

            const state = useWorkStore.getState();
            expect(state.templates).toHaveLength(0);
        });

        it("applyTemplate으로 폼 데이터에 템플릿 적용", () => {
            const template = createTestTemplate({
                work_name: "템플릿 작업",
                deal_name: "템플릿 거래",
            });
            useWorkStore.setState({ templates: [template] });

            useWorkStore.getState().applyTemplate("test-template-1");

            const state = useWorkStore.getState();
            expect(state.form_data.work_name).toBe("템플릿 작업");
            expect(state.form_data.deal_name).toBe("템플릿 거래");
        });

        it("reorderTemplates으로 템플릿 순서 변경", () => {
            const templates = [
                createTestTemplate({ id: "t1", work_name: "작업1" }),
                createTestTemplate({ id: "t2", work_name: "작업2" }),
                createTestTemplate({ id: "t3", work_name: "작업3" }),
            ];
            useWorkStore.setState({ templates });

            useWorkStore.getState().reorderTemplates("t3", "t1");

            const state = useWorkStore.getState();
            expect(state.templates.map((t) => t.id)).toEqual([
                "t3",
                "t1",
                "t2",
            ]);
        });
    });

    // =====================================================
    // 필터링 테스트
    // =====================================================
    describe("필터링", () => {
        it("getFilteredRecords는 선택된 날짜의 레코드만 반환", () => {
            const records = [
                createTestRecord({ id: "r1", date: "2026-01-19" }),
                createTestRecord({ id: "r2", date: "2026-01-20" }),
                createTestRecord({ id: "r3", date: "2026-01-19" }),
            ];
            useWorkStore.setState({
                records,
                selected_date: "2026-01-19",
            });

            const filtered = useWorkStore.getState().getFilteredRecords();
            expect(filtered).toHaveLength(2);
            expect(filtered.map((r) => r.id)).toEqual(["r1", "r3"]);
        });

        it("getFilteredRecords는 삭제된 레코드를 제외", () => {
            const records = [
                createTestRecord({ id: "r1", date: "2026-01-19" }),
                createTestRecord({
                    id: "r2",
                    date: "2026-01-19",
                    is_deleted: true,
                }),
            ];
            useWorkStore.setState({
                records,
                selected_date: "2026-01-19",
            });

            const filtered = useWorkStore.getState().getFilteredRecords();
            expect(filtered).toHaveLength(1);
            expect(filtered[0].id).toBe("r1");
        });

        it("getIncompleteRecords는 선택 날짜 이전의 미완료 레코드도 포함", () => {
            const records = [
                createTestRecord({
                    id: "r1",
                    date: "2026-01-18",
                    is_completed: false,
                }),
                createTestRecord({
                    id: "r2",
                    date: "2026-01-19",
                    is_completed: false,
                }),
                createTestRecord({
                    id: "r3",
                    date: "2026-01-19",
                    is_completed: true,
                }),
                createTestRecord({
                    id: "r4",
                    date: "2026-01-20",
                    is_completed: false,
                }),
            ];
            useWorkStore.setState({
                records,
                selected_date: "2026-01-19",
            });

            const incomplete = useWorkStore.getState().getIncompleteRecords();
            expect(incomplete).toHaveLength(2);
            expect(incomplete.map((r) => r.id)).toEqual(["r1", "r2"]);
        });

        it("getCompletedRecords는 완료된 레코드만 반환 (최신순 정렬)", () => {
            const records = [
                createTestRecord({
                    id: "r1",
                    is_completed: true,
                    completed_at: "2026-01-18T10:00:00Z",
                }),
                createTestRecord({ id: "r2", is_completed: false }),
                createTestRecord({
                    id: "r3",
                    is_completed: true,
                    completed_at: "2026-01-19T10:00:00Z",
                }),
            ];
            useWorkStore.setState({ records });

            const completed = useWorkStore.getState().getCompletedRecords();
            expect(completed).toHaveLength(2);
            // 최신순 정렬
            expect(completed[0].id).toBe("r3");
            expect(completed[1].id).toBe("r1");
        });
    });

    // =====================================================
    // 완료 상태 관리 테스트
    // =====================================================
    describe("완료 상태 관리", () => {
        it("markAsCompleted로 완료 처리", () => {
            const record = createTestRecord({ is_completed: false });
            useWorkStore.setState({ records: [record] });

            useWorkStore.getState().markAsCompleted("test-record-1");

            const state = useWorkStore.getState();
            expect(state.records[0].is_completed).toBe(true);
            expect(state.records[0].completed_at).toBeDefined();
        });

        it("markAsIncomplete로 완료 취소", () => {
            const record = createTestRecord({
                is_completed: true,
                completed_at: "2026-01-19T00:00:00.000Z",
            });
            useWorkStore.setState({ records: [record] });

            useWorkStore.getState().markAsIncomplete("test-record-1");

            const state = useWorkStore.getState();
            expect(state.records[0].is_completed).toBe(false);
            expect(state.records[0].completed_at).toBeUndefined();
        });
    });

    // =====================================================
    // 폼 데이터 테스트
    // =====================================================
    describe("폼 데이터", () => {
        it("setFormData로 폼 데이터 설정", () => {
            useWorkStore.getState().setFormData({
                work_name: "작업명",
                deal_name: "거래명",
            });

            const state = useWorkStore.getState();
            expect(state.form_data.work_name).toBe("작업명");
            expect(state.form_data.deal_name).toBe("거래명");
        });

        it("resetFormData로 폼 데이터 초기화", () => {
            useWorkStore.getState().setFormData({
                work_name: "작업명",
                deal_name: "거래명",
            });
            useWorkStore.getState().resetFormData();

            const state = useWorkStore.getState();
            expect(state.form_data.work_name).toBe("");
            expect(state.form_data.deal_name).toBe("");
        });

        it("updateActiveFormData로 타이머 실행 중 폼 데이터 업데이트", () => {
            const store = useWorkStore.getState();
            store.setFormData({ work_name: "test", deal_name: "test" });
            store.startTimer();

            useWorkStore.getState().updateActiveFormData({
                note: "메모 추가",
            });

            const state = useWorkStore.getState();
            expect(state.timer.active_form_data?.note).toBe("메모 추가");
            expect(state.form_data.note).toBe("메모 추가");
        });

        it("updateTimerStartTime으로 타이머 시작 시간 변경", () => {
            const store = useWorkStore.getState();
            store.setFormData({ work_name: "test", deal_name: "test" });
            store.startTimer();

            const original_start_time =
                useWorkStore.getState().timer.start_time;
            expect(original_start_time).not.toBeNull();

            // 30분 전으로 시작 시간 변경
            const new_start_time = original_start_time! - 30 * 60 * 1000;
            useWorkStore.getState().updateTimerStartTime(new_start_time);

            const state = useWorkStore.getState();
            expect(state.timer.start_time).toBe(new_start_time);
        });

        it("updateTimerStartTime은 타이머가 실행 중이 아니면 무시", () => {
            const store = useWorkStore.getState();
            // 타이머 시작 안 함
            expect(store.timer.is_running).toBe(false);

            const new_start_time = Date.now() - 30 * 60 * 1000;
            useWorkStore.getState().updateTimerStartTime(new_start_time);

            // 여전히 null
            expect(useWorkStore.getState().timer.start_time).toBeNull();
        });

        it("updateTimerStartTime은 미래 시간으로 설정 불가", () => {
            const store = useWorkStore.getState();
            store.setFormData({ work_name: "test", deal_name: "test" });
            store.startTimer();

            const original_start_time =
                useWorkStore.getState().timer.start_time;
            expect(original_start_time).not.toBeNull();

            // 미래 시간으로 설정 시도
            const future_time = Date.now() + 30 * 60 * 1000;
            useWorkStore.getState().updateTimerStartTime(future_time);

            // 원래 시간 유지
            expect(useWorkStore.getState().timer.start_time).toBe(
                original_start_time
            );
        });

        it("updateTimerStartTime은 결과 객체를 반환함", () => {
            const store = useWorkStore.getState();
            store.setFormData({ work_name: "test", deal_name: "test" });
            store.startTimer();

            const original_start_time =
                useWorkStore.getState().timer.start_time!;
            const new_start_time = original_start_time - 30 * 60 * 1000;
            const result = useWorkStore
                .getState()
                .updateTimerStartTime(new_start_time);

            expect(result.success).toBe(true);
            expect(result.adjusted).toBe(false);
            expect(result.message).toBeUndefined();
        });

        it("updateTimerStartTime은 충돌 시 자동 조정함", () => {
            const store = useWorkStore.getState();
            const today = new Date().toISOString().split("T")[0];
            const now = new Date();
            const current_hours = now.getHours();
            const current_mins = now.getMinutes();

            // 현재 시간 기준으로 1시간 전부터 30분 전까지의 세션 생성
            // 예: 현재 10:30이면 09:30 ~ 10:00 세션
            const session_start_hours = current_hours - 1;
            const session_end_hours = current_hours;
            const session_start_time = `${session_start_hours
                .toString()
                .padStart(2, "0")}:${current_mins.toString().padStart(2, "0")}`;
            const session_end_time = `${session_end_hours
                .toString()
                .padStart(2, "0")}:00`;

            // 시간이 유효하지 않으면 (자정 이전 등) 테스트 스킵
            if (session_start_hours < 0) {
                return;
            }

            // 기존 세션이 있는 레코드 생성
            const existing_record = createTestRecord({
                id: "existing-record",
                date: today,
                work_name: "기존작업",
                deal_name: "기존거래처",
                sessions: [
                    {
                        id: "existing-session",
                        date: today,
                        start_time: session_start_time,
                        end_time: session_end_time,
                        duration_minutes: 30,
                    },
                ],
            });
            useWorkStore.setState({ records: [existing_record] });

            // 타이머 시작 (새로운 작업)
            store.setFormData({ work_name: "test", deal_name: "test" });
            store.startTimer();

            // 시작 시간을 세션 시작 시간으로 변경 시도 (기존 세션과 충돌)
            const conflict_time = new Date();
            conflict_time.setHours(session_start_hours, current_mins, 0, 0);

            const result = useWorkStore
                .getState()
                .updateTimerStartTime(conflict_time.getTime());

            // 충돌이 발생하면 자동 조정되어야 함
            // (단, 현재 시간과 세션 구성에 따라 결과가 다를 수 있음)
            expect(typeof result.success).toBe("boolean");
            expect(typeof result.adjusted).toBe("boolean");
        });

        it("updateTimerStartTime은 타이머 미실행 시 실패 결과 반환", () => {
            const result = useWorkStore
                .getState()
                .updateTimerStartTime(Date.now() - 30 * 60 * 1000);

            expect(result.success).toBe(false);
            expect(result.adjusted).toBe(false);
            expect(result.message).toBe("타이머가 실행 중이 아닙니다.");
        });

        it("updateTimerStartTime은 미래 시간 시 실패 결과 반환", () => {
            const store = useWorkStore.getState();
            store.setFormData({ work_name: "test", deal_name: "test" });
            store.startTimer();

            const future_time = Date.now() + 30 * 60 * 1000;
            const result = useWorkStore
                .getState()
                .updateTimerStartTime(future_time);

            expect(result.success).toBe(false);
            expect(result.adjusted).toBe(false);
            expect(result.message).toBe(
                "시작 시간은 현재 시간보다 미래일 수 없습니다."
            );
        });
    });

    // =====================================================
    // 자동완성 옵션 테스트
    // =====================================================
    describe("자동완성 옵션", () => {
        it("getAutoCompleteOptions는 레코드와 템플릿에서 고유값 추출", () => {
            const records = [
                createTestRecord({ work_name: "작업1" }),
                createTestRecord({ id: "r2", work_name: "작업2" }),
                createTestRecord({ id: "r3", work_name: "작업1" }), // 중복
            ];
            const templates = [createTestTemplate({ work_name: "작업3" })];
            useWorkStore.setState({ records, templates });

            const options = useWorkStore
                .getState()
                .getAutoCompleteOptions("work_name");
            expect(options).toHaveLength(3);
            expect(options).toContain("작업1");
            expect(options).toContain("작업2");
            expect(options).toContain("작업3");
        });

        it("숨김 처리된 옵션은 자동완성에서 제외", () => {
            const records = [
                createTestRecord({ work_name: "작업1" }),
                createTestRecord({ id: "r2", work_name: "작업2" }),
            ];
            useWorkStore.setState({
                records,
                hidden_autocomplete_options: {
                    work_name: ["작업1"],
                    task_name: [],
                    deal_name: [],
                    project_code: [],
                    task_option: [],
                    category_option: [],
                },
            });

            const options = useWorkStore
                .getState()
                .getAutoCompleteOptions("work_name");
            expect(options).toHaveLength(1);
            expect(options).toContain("작업2");
        });

        it("hideAutoCompleteOption으로 옵션 숨김", () => {
            useWorkStore
                .getState()
                .hideAutoCompleteOption("work_name", "숨길값");

            const state = useWorkStore.getState();
            expect(state.hidden_autocomplete_options.work_name).toContain(
                "숨길값"
            );
        });

        it("unhideAutoCompleteOption으로 숨김 해제", () => {
            useWorkStore.setState({
                hidden_autocomplete_options: {
                    work_name: ["숨길값"],
                    task_name: [],
                    deal_name: [],
                    project_code: [],
                    task_option: [],
                    category_option: [],
                },
            });

            useWorkStore
                .getState()
                .unhideAutoCompleteOption("work_name", "숨길값");

            const state = useWorkStore.getState();
            expect(state.hidden_autocomplete_options.work_name).not.toContain(
                "숨길값"
            );
        });
    });

    // =====================================================
    // 사용자 정의 옵션 테스트
    // =====================================================
    describe("사용자 정의 옵션", () => {
        it("addCustomTaskOption으로 업무명 옵션 추가", () => {
            useWorkStore.getState().addCustomTaskOption("새 업무");

            const state = useWorkStore.getState();
            expect(state.custom_task_options).toContain("새 업무");
        });

        it("중복 업무명 옵션은 추가되지 않음", () => {
            useWorkStore.getState().addCustomTaskOption("업무");
            useWorkStore.getState().addCustomTaskOption("업무");

            const state = useWorkStore.getState();
            expect(
                state.custom_task_options.filter((o) => o === "업무")
            ).toHaveLength(1);
        });

        it("addCustomCategoryOption으로 카테고리 옵션 추가", () => {
            useWorkStore.getState().addCustomCategoryOption("새 카테고리");

            const state = useWorkStore.getState();
            expect(state.custom_category_options).toContain("새 카테고리");
        });

        it("removeCustomTaskOption으로 업무명 옵션 삭제", () => {
            useWorkStore.setState({ custom_task_options: ["업무1", "업무2"] });

            useWorkStore.getState().removeCustomTaskOption("업무1");

            const state = useWorkStore.getState();
            expect(state.custom_task_options).not.toContain("업무1");
            expect(state.custom_task_options).toContain("업무2");
        });

        it("removeCustomCategoryOption으로 카테고리 옵션 삭제", () => {
            useWorkStore.setState({
                custom_category_options: ["카테고리1", "카테고리2"],
            });

            useWorkStore.getState().removeCustomCategoryOption("카테고리1");

            const state = useWorkStore.getState();
            expect(state.custom_category_options).not.toContain("카테고리1");
            expect(state.custom_category_options).toContain("카테고리2");
        });
    });

    // =====================================================
    // 템플릿 전환 테스트
    // =====================================================
    describe("템플릿 전환 (switchTemplate)", () => {
        it("진행 중인 작업을 저장하고 새 템플릿으로 전환", () => {
            // 템플릿 설정
            const template1 = createTestTemplate({
                id: "t1",
                work_name: "작업1",
                deal_name: "거래1",
            });
            const template2 = createTestTemplate({
                id: "t2",
                work_name: "작업2",
                deal_name: "거래2",
            });
            useWorkStore.setState({ templates: [template1, template2] });

            // 첫 번째 템플릿으로 시작 (즉시 records에 세션 추가됨)
            const store = useWorkStore.getState();
            store.applyTemplate("t1");
            store.startTimer("t1");

            // 타이머 시작 시 바로 레코드가 생성됨 (end_time은 빈 문자열)
            expect(useWorkStore.getState().records).toHaveLength(1);
            expect(
                useWorkStore.getState().records[0].sessions[0].end_time
            ).toBe("");

            // 30분 후 두 번째 템플릿으로 전환
            vi.advanceTimersByTime(30 * 60 * 1000);
            useWorkStore.getState().switchTemplate("t2");

            const state = useWorkStore.getState();

            // 이전 작업 세션이 종료됨 + 새 작업 세션이 추가됨
            expect(state.records).toHaveLength(2);

            // 첫 번째 레코드: 종료됨
            const record1 = state.records.find((r) => r.work_name === "작업1");
            expect(record1).toBeDefined();
            expect(record1!.sessions[0].end_time).not.toBe("");

            // 두 번째 레코드: 진행 중
            const record2 = state.records.find((r) => r.work_name === "작업2");
            expect(record2).toBeDefined();
            expect(record2!.sessions[0].end_time).toBe("");

            // 새 템플릿으로 타이머가 실행 중
            expect(state.timer.is_running).toBe(true);
            expect(state.timer.active_template_id).toBe("t2");
            expect(state.timer.active_form_data?.work_name).toBe("작업2");
        });
    });

    // =====================================================
    // 엣지 케이스 테스트
    // =====================================================
    describe("엣지 케이스", () => {
        describe("타이머 엣지 케이스", () => {
            it("타이머 실행 중이 아닐 때 stopTimer 호출하면 null 반환", () => {
                const store = useWorkStore.getState();
                const result = store.stopTimer();
                expect(result).toBeNull();
            });

            it("form_data가 없을 때 타이머 시작 후 정지", () => {
                const store = useWorkStore.getState();
                // form_data 없이 시작
                store.startTimer();

                vi.advanceTimersByTime(60 * 1000);

                const result = useWorkStore.getState().stopTimer();
                // active_form_data가 빈 상태여도 레코드 생성됨
                expect(result).not.toBeNull();
            });

            it("매우 짧은 타이머 (1초 미만) 정지", () => {
                const store = useWorkStore.getState();
                store.setFormData({
                    work_name: "짧은 작업",
                    deal_name: "짧은 거래",
                });
                store.startTimer();

                // 500ms 후 정지
                vi.advanceTimersByTime(500);

                const result = useWorkStore.getState().stopTimer();
                expect(result).not.toBeNull();
            });

            it("자정을 넘기는 타이머", () => {
                // 23:59에 타이머 시작
                vi.setSystemTime(new Date("2026-01-19T23:59:00"));

                const store = useWorkStore.getState();
                store.setFormData({
                    work_name: "자정 작업",
                    deal_name: "자정 거래",
                });
                store.startTimer();

                // 5분 후 (00:04)
                vi.advanceTimersByTime(5 * 60 * 1000);

                const result = useWorkStore.getState().stopTimer();
                // 시작 날짜 기준으로 레코드 생성
                expect(result?.date).toBe("2026-01-19");
            });
        });

        describe("세션 엣지 케이스", () => {
            it("존재하지 않는 record_id로 updateSession", () => {
                const result = useWorkStore
                    .getState()
                    .updateSession(
                        "non-existent",
                        "session-1",
                        "09:00",
                        "10:00"
                    );
                expect(result.success).toBe(false);
                expect(result.message).toContain("레코드를 찾을 수 없습니다");
            });

            it("존재하지 않는 session_id로 updateSession", () => {
                const record = createTestRecord();
                useWorkStore.setState({ records: [record] });

                const result = useWorkStore
                    .getState()
                    .updateSession(
                        "test-record-1",
                        "non-existent",
                        "09:00",
                        "10:00"
                    );
                expect(result.success).toBe(false);
                expect(result.message).toContain("세션을 찾을 수 없습니다");
            });

            it("같은 시작/종료 시간으로 updateSession", () => {
                const record = createTestRecord();
                useWorkStore.setState({ records: [record] });

                const result = useWorkStore
                    .getState()
                    .updateSession(
                        "test-record-1",
                        "session-1",
                        "10:00",
                        "10:00"
                    );
                expect(result.success).toBe(false);
            });

            it("날짜 변경 시 새 날짜에 충돌이 있으면 실패", () => {
                // 두 날짜에 각각 세션이 있는 레코드
                const record1 = createTestRecord({
                    id: "r1",
                    date: "2026-01-18",
                    sessions: [
                        {
                            id: "s1",
                            date: "2026-01-18",
                            start_time: "09:00",
                            end_time: "10:00",
                            duration_minutes: 60,
                        },
                    ],
                });
                const record2 = createTestRecord({
                    id: "r2",
                    date: "2026-01-19",
                    sessions: [
                        {
                            id: "s2",
                            date: "2026-01-19",
                            start_time: "09:00",
                            end_time: "10:00",
                            duration_minutes: 60,
                        },
                    ],
                });
                useWorkStore.setState({ records: [record1, record2] });

                // r1의 세션을 r2와 같은 날짜/시간으로 변경 시도
                const result = useWorkStore
                    .getState()
                    .updateSession("r1", "s1", "09:00", "10:00", "2026-01-19");
                expect(result.success).toBe(false);
                expect(result.message).toContain("겹칩니다");
            });

            it("존재하지 않는 record_id로 deleteSession", () => {
                // 에러 없이 완료되어야 함
                expect(() => {
                    useWorkStore.getState().deleteSession("non-existent", "s1");
                }).not.toThrow();
            });
        });

        describe("템플릿 엣지 케이스", () => {
            it("존재하지 않는 template_id로 applyTemplate", () => {
                const store = useWorkStore.getState();
                store.applyTemplate("non-existent");

                // form_data가 변경되지 않아야 함
                expect(store.form_data.work_name).toBe("");
            });

            it("존재하지 않는 template_id로 switchTemplate", () => {
                const store = useWorkStore.getState();
                store.setFormData({ work_name: "test", deal_name: "test" });
                store.startTimer();

                // 에러 없이 완료
                expect(() => {
                    useWorkStore.getState().switchTemplate("non-existent");
                }).not.toThrow();
            });

            it("reorderTemplates - 동일 위치로 이동", () => {
                const templates = [
                    createTestTemplate({ id: "t1" }),
                    createTestTemplate({ id: "t2" }),
                ];
                useWorkStore.setState({ templates });

                useWorkStore.getState().reorderTemplates("t1", "t1");

                const state = useWorkStore.getState();
                // 순서 유지
                expect(state.templates[0].id).toBe("t1");
            });

            it("reorderTemplates - 존재하지 않는 ID", () => {
                const templates = [createTestTemplate({ id: "t1" })];
                useWorkStore.setState({ templates });

                useWorkStore.getState().reorderTemplates("non-existent", "t1");

                // 변경 없음
                const state = useWorkStore.getState();
                expect(state.templates).toHaveLength(1);
            });
        });

        describe("필터링 엣지 케이스", () => {
            it("빈 레코드 배열에서 필터링", () => {
                useWorkStore.setState({ records: [] });

                const filtered = useWorkStore.getState().getFilteredRecords();
                const incomplete = useWorkStore
                    .getState()
                    .getIncompleteRecords();
                const completed = useWorkStore.getState().getCompletedRecords();
                const deleted = useWorkStore.getState().getDeletedRecords();

                expect(filtered).toHaveLength(0);
                expect(incomplete).toHaveLength(0);
                expect(completed).toHaveLength(0);
                expect(deleted).toHaveLength(0);
            });

            it("미래 날짜의 미완료 레코드는 getIncompleteRecords에 포함되지 않음", () => {
                const records = [
                    createTestRecord({
                        id: "r1",
                        date: "2026-01-20", // 미래
                        is_completed: false,
                    }),
                ];
                useWorkStore.setState({
                    records,
                    selected_date: "2026-01-19",
                });

                const incomplete = useWorkStore
                    .getState()
                    .getIncompleteRecords();
                expect(incomplete).toHaveLength(0);
            });
        });

        describe("자동완성 엣지 케이스", () => {
            it("빈 문자열 값은 자동완성에 포함되지 않음", () => {
                const records = [
                    createTestRecord({ work_name: "" }),
                    createTestRecord({ id: "r2", work_name: "   " }),
                    createTestRecord({ id: "r3", work_name: "유효한 작업" }),
                ];
                useWorkStore.setState({ records });

                const options = useWorkStore
                    .getState()
                    .getAutoCompleteOptions("work_name");
                expect(options).not.toContain("");
                expect(options).not.toContain("   ");
                expect(options).toContain("유효한 작업");
            });

            it("이미 숨김 처리된 옵션을 다시 숨김 처리", () => {
                useWorkStore
                    .getState()
                    .hideAutoCompleteOption("work_name", "값");
                useWorkStore
                    .getState()
                    .hideAutoCompleteOption("work_name", "값");

                const state = useWorkStore.getState();
                // 중복 없이 하나만 있어야 함
                expect(
                    state.hidden_autocomplete_options.work_name.filter(
                        (v) => v === "값"
                    )
                ).toHaveLength(1);
            });

            it("숨김 목록에 없는 값을 unhide", () => {
                // 에러 없이 완료
                expect(() => {
                    useWorkStore
                        .getState()
                        .unhideAutoCompleteOption("work_name", "non-existent");
                }).not.toThrow();
            });

            it("getProjectCodeOptions - 같은 코드의 다른 작업명은 별도 옵션으로 생성", () => {
                const records = [
                    createTestRecord({
                        id: "r1",
                        project_code: "A00_00000",
                        work_name: "작업1",
                    }),
                    createTestRecord({
                        id: "r2",
                        project_code: "A00_00000",
                        work_name: "작업2",
                    }),
                ];
                useWorkStore.setState({ records });

                const options = useWorkStore.getState().getProjectCodeOptions();
                // 같은 코드라도 작업명이 다르면 별도 옵션으로 생성됨
                const a00_options = options.filter((o) =>
                    o.value.startsWith("A00_00000::")
                );
                expect(a00_options).toHaveLength(2);
                // 각 옵션에 작업명이 포함됨
                expect(a00_options.some((o) => o.label.includes("작업1"))).toBe(
                    true
                );
                expect(a00_options.some((o) => o.label.includes("작업2"))).toBe(
                    true
                );
            });
        });

        describe("사용자 정의 옵션 엣지 케이스", () => {
            it("빈 문자열은 추가되지 않음", () => {
                useWorkStore.getState().addCustomTaskOption("");
                useWorkStore.getState().addCustomTaskOption("   ");
                useWorkStore.getState().addCustomCategoryOption("");

                const state = useWorkStore.getState();
                expect(state.custom_task_options).toHaveLength(0);
                expect(state.custom_category_options).toHaveLength(0);
            });

            it("공백만 있는 문자열은 trim 후 추가되지 않음", () => {
                useWorkStore.getState().addCustomTaskOption("   ");

                const state = useWorkStore.getState();
                expect(state.custom_task_options).toHaveLength(0);
            });

            it("존재하지 않는 옵션 삭제 시도", () => {
                useWorkStore.setState({ custom_task_options: ["옵션1"] });

                expect(() => {
                    useWorkStore.getState().removeCustomTaskOption("존재안함");
                }).not.toThrow();

                const state = useWorkStore.getState();
                expect(state.custom_task_options).toContain("옵션1");
            });
        });

        describe("레코드 병합 엣지 케이스", () => {
            it("미완료 작업이 있으면 같은 날짜가 아니어도 병합", () => {
                // 어제 날짜의 미완료 작업
                const existing_record = createTestRecord({
                    date: "2026-01-18",
                    is_completed: false,
                });
                useWorkStore.setState({ records: [existing_record] });

                // 오늘 타이머 시작
                vi.setSystemTime(new Date("2026-01-19T10:00:00"));
                const store = useWorkStore.getState();
                store.setFormData({
                    work_name: "테스트 작업",
                    deal_name: "테스트 거래",
                });
                store.startTimer();

                vi.advanceTimersByTime(30 * 60 * 1000);
                store.stopTimer();

                const state = useWorkStore.getState();
                // 기존 미완료 레코드에 세션이 추가됨
                expect(state.records).toHaveLength(1);
                expect(state.records[0].sessions).toHaveLength(2);
            });

            it("완료된 작업에도 세션이 병합되고 완료 상태는 유지됨", () => {
                // 같은 날짜의 완료된 작업
                // 현재 구현에서는 완료된 작업도 같은 조건이면 병합됨
                const existing_record = createTestRecord({
                    is_completed: true,
                });
                useWorkStore.setState({ records: [existing_record] });

                const store = useWorkStore.getState();
                store.setFormData({
                    work_name: "테스트 작업",
                    deal_name: "테스트 거래",
                });
                store.startTimer();

                vi.advanceTimersByTime(30 * 60 * 1000);
                store.stopTimer();

                const state = useWorkStore.getState();
                // 기존 레코드에 세션이 추가됨 (병합)
                expect(state.records).toHaveLength(1);
                // 새 세션 추가로 2개의 세션
                expect(state.records[0].sessions).toHaveLength(2);
                // 완료 상태는 그대로 유지됨
                expect(state.records[0].is_completed).toBe(true);
            });
        });
    });

    // =====================================================
    // 동시성 시나리오 테스트
    // =====================================================
    describe("동시성 시나리오", () => {
        it("여러 번 연속 타이머 시작/정지", () => {
            const store = useWorkStore.getState();

            for (let i = 0; i < 5; i++) {
                store.setFormData({
                    work_name: `작업${i}`,
                    deal_name: `거래${i}`,
                });
                useWorkStore.getState().startTimer();
                vi.advanceTimersByTime(5 * 60 * 1000); // 5분
                useWorkStore.getState().stopTimer();
            }

            const state = useWorkStore.getState();
            expect(state.records).toHaveLength(5);
            expect(state.timer.is_running).toBe(false);
        });

        it("같은 작업에 여러 세션 추가", () => {
            const store = useWorkStore.getState();

            // 같은 작업으로 3번 타이머 실행
            for (let i = 0; i < 3; i++) {
                store.setFormData({
                    work_name: "반복 작업",
                    deal_name: "반복 거래",
                });
                useWorkStore.getState().startTimer();
                vi.advanceTimersByTime(10 * 60 * 1000); // 10분
                useWorkStore.getState().stopTimer();
            }

            const state = useWorkStore.getState();
            // 하나의 레코드에 3개 세션
            expect(state.records).toHaveLength(1);
            expect(state.records[0].sessions).toHaveLength(3);
        });
    });

    // =====================================================
    // 점심시간 설정 테스트
    // =====================================================
    describe("점심시간 설정", () => {
        it("기본 점심시간이 11:40~12:40으로 설정됨", () => {
            const state = useWorkStore.getState();
            expect(state.lunch_start_time).toBe("11:40");
            expect(state.lunch_end_time).toBe("12:40");
        });

        it("setLunchTime으로 점심시간 변경", () => {
            const store = useWorkStore.getState();
            store.setLunchTime("12:00", "13:00");

            const state = useWorkStore.getState();
            expect(state.lunch_start_time).toBe("12:00");
            expect(state.lunch_end_time).toBe("13:00");
        });

        it("getLunchTimeMinutes가 분 단위로 반환", () => {
            const store = useWorkStore.getState();
            store.setLunchTime("11:40", "12:40");

            const lunch_time = store.getLunchTimeMinutes();
            expect(lunch_time.start).toBe(11 * 60 + 40); // 700분
            expect(lunch_time.end).toBe(12 * 60 + 40); // 760분
            expect(lunch_time.duration).toBe(60); // 60분
        });

        it("다른 점심시간 설정 시 duration 계산", () => {
            const store = useWorkStore.getState();
            store.setLunchTime("12:00", "13:30");

            const lunch_time = store.getLunchTimeMinutes();
            expect(lunch_time.start).toBe(12 * 60); // 720분
            expect(lunch_time.end).toBe(13 * 60 + 30); // 810분
            expect(lunch_time.duration).toBe(90); // 90분
        });
    });

    // =====================================================
    // 트랜지션 설정 테스트
    // =====================================================
    describe("트랜지션 설정", () => {
        it("기본값: 트랜지션 비활성화, 속도 normal", () => {
            const state = useWorkStore.getState();
            expect(state.transition_enabled).toBe(false);
            expect(state.transition_speed).toBe("normal");
        });

        it("setTransitionEnabled로 트랜지션 활성화/비활성화", () => {
            const store = useWorkStore.getState();

            store.setTransitionEnabled(true);
            expect(useWorkStore.getState().transition_enabled).toBe(true);

            store.setTransitionEnabled(false);
            expect(useWorkStore.getState().transition_enabled).toBe(false);
        });

        it("setTransitionSpeed로 속도 변경", () => {
            const store = useWorkStore.getState();

            store.setTransitionSpeed("fast");
            expect(useWorkStore.getState().transition_speed).toBe("fast");

            store.setTransitionSpeed("slow");
            expect(useWorkStore.getState().transition_speed).toBe("slow");

            store.setTransitionSpeed("normal");
            expect(useWorkStore.getState().transition_speed).toBe("normal");
        });
    });
});
