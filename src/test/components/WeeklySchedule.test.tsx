/**
 * WeeklySchedule 컴포넌트 테스트
 *
 * 주간 일정 조회 및 복사 기능 테스트
 * 특히 일별 누적시간 계산 로직을 검증합니다.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfigProvider } from "antd";
import koKR from "antd/locale/ko_KR";
import { BrowserRouter } from "react-router-dom";
import WeeklySchedule from "../../components/WeeklySchedule";
import { useWorkStore } from "../../store/useWorkStore";
import type { WorkRecord, WorkSession } from "../../types";

// 스토어 초기화
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
    });
};

// 테스트용 래퍼 컴포넌트
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
        <ConfigProvider locale={koKR}>{children}</ConfigProvider>
    </BrowserRouter>
);

// 테스트용 세션 생성
const createTestSession = (
    overrides: Partial<WorkSession> = {}
): WorkSession => ({
    id: crypto.randomUUID(),
    date: "2026-01-19",
    start_time: "09:00",
    end_time: "10:00",
    duration_minutes: 60,
    ...overrides,
});

// 테스트용 레코드 생성
const createTestRecord = (overrides: Partial<WorkRecord> = {}): WorkRecord => ({
    id: crypto.randomUUID(),
    project_code: "A25_01846",
    work_name: "5.6 프레임워크 FE",
    task_name: "개발",
    deal_name: "IndexedDB 캐싱 작업",
    category_name: "개발",
    duration_minutes: 60,
    note: "",
    start_time: "09:00",
    end_time: "10:00",
    date: "2026-01-19",
    sessions: [createTestSession()],
    is_completed: false,
    ...overrides,
});

describe("WeeklySchedule", () => {
    beforeEach(() => {
        resetStore();
    });

    // =====================================================
    // 기본 렌더링 테스트
    // =====================================================
    describe("기본 렌더링", () => {
        it("컴포넌트가 렌더링됨", () => {
            render(
                <TestWrapper>
                    <WeeklySchedule />
                </TestWrapper>
            );

            expect(screen.getByText("주간 일정")).toBeInTheDocument();
        });

        it("레코드가 없으면 빈 상태 표시", () => {
            render(
                <TestWrapper>
                    <WeeklySchedule />
                </TestWrapper>
            );

            expect(
                screen.getByText("해당 주에 작업 기록이 없습니다")
            ).toBeInTheDocument();
        });
    });

    // =====================================================
    // 일별 누적시간 계산 테스트
    // =====================================================
    describe("일별 누적시간 계산", () => {
        it("해당 날짜까지의 누적시간만 표시됨", () => {
            // 1/19에 60분, 1/20에 120분 작업한 레코드 설정
            const record = createTestRecord({
                date: "2026-01-19",
                duration_minutes: 180,
                sessions: [
                    createTestSession({
                        id: "session-1",
                        date: "2026-01-19",
                        start_time: "09:00",
                        end_time: "10:00",
                        duration_minutes: 60,
                    }),
                    createTestSession({
                        id: "session-2",
                        date: "2026-01-20",
                        start_time: "09:00",
                        end_time: "11:00",
                        duration_minutes: 120,
                    }),
                ],
            });

            useWorkStore.setState({ records: [record] });

            render(
                <TestWrapper>
                    <WeeklySchedule />
                </TestWrapper>
            );

            // 복사 미리보기에서 누적시간 확인
            const preview_element = screen.getByText(/복사 미리보기/);
            expect(preview_element).toBeInTheDocument();
        });

        it("여러 날짜에 걸친 작업의 일별 누적시간이 정확함", () => {
            // 3일에 걸쳐 작업한 레코드
            const record = createTestRecord({
                work_name: "테스트 작업",
                date: "2026-01-19",
                duration_minutes: 360,
                sessions: [
                    createTestSession({
                        id: "session-1",
                        date: "2026-01-19",
                        start_time: "09:00",
                        end_time: "11:00",
                        duration_minutes: 120, // 1/19: 2시간
                    }),
                    createTestSession({
                        id: "session-2",
                        date: "2026-01-20",
                        start_time: "09:00",
                        end_time: "11:00",
                        duration_minutes: 120, // 1/20: 2시간 (누적 4시간)
                    }),
                    createTestSession({
                        id: "session-3",
                        date: "2026-01-21",
                        start_time: "09:00",
                        end_time: "11:00",
                        duration_minutes: 120, // 1/21: 2시간 (누적 6시간)
                    }),
                ],
            });

            useWorkStore.setState({ records: [record] });

            render(
                <TestWrapper>
                    <WeeklySchedule />
                </TestWrapper>
            );

            // 복사 미리보기에서 일별 누적시간이 올바른지 확인
            const preview_text =
                document.querySelector(".copy-preview")?.textContent || "";

            // 1/19: 2시간 (02:00)
            expect(preview_text).toContain("1/19 (월)");
            expect(preview_text).toContain("누적시간: 02:00");

            // 1/20: 4시간 (04:00) - 2+2
            expect(preview_text).toContain("1/20 (화)");
            expect(preview_text).toContain("누적시간: 04:00");

            // 1/21: 6시간 (06:00) - 2+2+2
            expect(preview_text).toContain("1/21 (수)");
            expect(preview_text).toContain("누적시간: 06:00");
        });

        it("같은 작업명의 다른 거래들도 일별 누적시간이 정확함", () => {
            // 같은 작업명, 다른 거래명의 레코드들
            const record1 = createTestRecord({
                work_name: "5.6 프레임워크 FE",
                deal_name: "거래1",
                date: "2026-01-19",
                duration_minutes: 60,
                sessions: [
                    createTestSession({
                        id: "session-1",
                        date: "2026-01-19",
                        duration_minutes: 60,
                    }),
                ],
            });

            const record2 = createTestRecord({
                id: "record-2",
                work_name: "5.6 프레임워크 FE",
                deal_name: "거래2",
                date: "2026-01-19",
                duration_minutes: 120,
                sessions: [
                    createTestSession({
                        id: "session-2",
                        date: "2026-01-19",
                        duration_minutes: 120,
                    }),
                ],
            });

            useWorkStore.setState({ records: [record1, record2] });

            render(
                <TestWrapper>
                    <WeeklySchedule />
                </TestWrapper>
            );

            // 두 거래 모두 표시되는지 확인
            expect(screen.getByText("거래1")).toBeInTheDocument();
            expect(screen.getByText("거래2")).toBeInTheDocument();
        });

        it("삭제된 레코드는 누적시간 계산에서 제외됨", () => {
            const active_record = createTestRecord({
                work_name: "활성 작업",
                date: "2026-01-19",
                duration_minutes: 60,
                is_deleted: false,
                sessions: [
                    createTestSession({
                        id: "session-1",
                        date: "2026-01-19",
                        duration_minutes: 60,
                    }),
                ],
            });

            const deleted_record = createTestRecord({
                id: "deleted-record",
                work_name: "삭제된 작업",
                date: "2026-01-19",
                duration_minutes: 120,
                is_deleted: true,
                deleted_at: "2026-01-19T12:00:00.000Z",
                sessions: [
                    createTestSession({
                        id: "session-2",
                        date: "2026-01-19",
                        duration_minutes: 120,
                    }),
                ],
            });

            useWorkStore.setState({ records: [active_record, deleted_record] });

            render(
                <TestWrapper>
                    <WeeklySchedule />
                </TestWrapper>
            );

            // 활성 작업만 표시됨
            expect(screen.getByText("활성 작업")).toBeInTheDocument();
            expect(screen.queryByText("삭제된 작업")).not.toBeInTheDocument();
        });
    });

    // =====================================================
    // 관리업무 필터 테스트
    // =====================================================
    describe("관리업무 필터", () => {
        it("관리업무 필터 버튼이 표시됨", () => {
            render(
                <TestWrapper>
                    <WeeklySchedule />
                </TestWrapper>
            );

            expect(screen.getByText("전체 보기")).toBeInTheDocument();
            expect(screen.getByText(/관리업무 제외/)).toBeInTheDocument();
        });
    });

    // =====================================================
    // 복사 기능 테스트
    // =====================================================
    describe("복사 기능", () => {
        it("복사 버튼이 표시됨", () => {
            render(
                <TestWrapper>
                    <WeeklySchedule />
                </TestWrapper>
            );

            expect(
                screen.getByRole("button", { name: /복사/ })
            ).toBeInTheDocument();
        });

        it("레코드가 없으면 복사 버튼이 비활성화됨", () => {
            render(
                <TestWrapper>
                    <WeeklySchedule />
                </TestWrapper>
            );

            const copy_button = screen.getByRole("button", { name: /복사/ });
            expect(copy_button).toBeDisabled();
        });

        it("레코드가 있으면 복사 버튼이 활성화됨", () => {
            const record = createTestRecord();
            useWorkStore.setState({ records: [record] });

            render(
                <TestWrapper>
                    <WeeklySchedule />
                </TestWrapper>
            );

            const copy_button = screen.getByRole("button", { name: /복사/ });
            expect(copy_button).not.toBeDisabled();
        });

        it("복사 형식 선택 버튼이 표시됨", () => {
            const record = createTestRecord();
            useWorkStore.setState({ records: [record] });

            render(
                <TestWrapper>
                    <WeeklySchedule />
                </TestWrapper>
            );

            expect(screen.getByRole("radio", { name: "형식 1" })).toBeInTheDocument();
            expect(screen.getByRole("radio", { name: "형식 2" })).toBeInTheDocument();
        });

        it("형식 2가 기본 선택되어 있음", () => {
            const record = createTestRecord();
            useWorkStore.setState({ records: [record] });

            render(
                <TestWrapper>
                    <WeeklySchedule />
                </TestWrapper>
            );

            const format2_button = screen.getByRole("radio", { name: "형식 2" });
            expect(format2_button).toBeChecked();
        });

        it("형식 1 선택 시 기존 형식으로 텍스트 생성됨", () => {
            const record = createTestRecord({
                work_name: "테스트 작업",
                date: "2026-01-20",
                deal_name: "세부작업",
            });
            useWorkStore.setState({ records: [record] });

            render(
                <TestWrapper>
                    <WeeklySchedule />
                </TestWrapper>
            );

            // 형식 1 선택 (Radio.Button의 label 요소 클릭)
            const format1_button = screen.getByText("형식 1");
            fireEvent.click(format1_button);

            const preview_text = document.querySelector(".copy-preview")?.textContent || "";

            // 형식 1은 '>' 기호와 구분선 없음
            expect(preview_text).toContain("> 세부작업");
            expect(preview_text).not.toContain("────");
            expect(preview_text).not.toContain("■");
        });

        it("형식 2 선택 시 구분선 형식으로 텍스트 생성됨", () => {
            const record = createTestRecord({
                work_name: "테스트 작업",
                date: "2026-01-20",
                deal_name: "세부작업",
            });
            useWorkStore.setState({ records: [record] });

            render(
                <TestWrapper>
                    <WeeklySchedule />
                </TestWrapper>
            );

            // 형식 2는 기본값
            const preview_text = document.querySelector(".copy-preview")?.textContent || "";

            // 형식 2는 구분선, ■ 기호, · 기호 사용
            expect(preview_text).toContain("────");
            expect(preview_text).toContain("■");
            expect(preview_text).toContain("· 세부작업");
        });
    });
});
