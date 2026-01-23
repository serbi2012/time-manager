/**
 * WorkTemplateList 컴포넌트 테스트
 *
 * 프리셋(템플릿) 목록 컴포넌트의 렌더링 및 상호작용 테스트
 * 
 * 주의: antd 모달은 포털을 사용하여 렌더링되므로 DOM 테스트가 복잡합니다.
 * 따라서 모달 관련 테스트는 스토어 직접 테스트로 대체합니다.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigProvider } from 'antd'
import koKR from 'antd/locale/ko_KR'
import WorkTemplateList from '../../components/WorkTemplateList'
import { useWorkStore } from '../../store/useWorkStore'
import type { WorkTemplate } from '../../types'

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
            project_code: '',
            work_name: '',
            task_name: '',
            deal_name: '',
            category_name: '',
            note: '',
        },
        selected_date: '2026-01-19',
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
    })
}

// 테스트용 래퍼 컴포넌트
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider locale={koKR}>{children}</ConfigProvider>
)

// 테스트용 템플릿 생성
const createTestTemplate = (
    overrides: Partial<WorkTemplate> = {}
): WorkTemplate => ({
    id: 'template-1',
    project_code: 'A26_TEST',
    work_name: '테스트 작업',
    task_name: '개발',
    deal_name: '테스트 거래',
    category_name: '개발',
    note: '테스트 노트',
    color: '#1890ff',
    created_at: '2026-01-19T00:00:00.000Z',
    ...overrides,
})

describe('WorkTemplateList', () => {
    beforeEach(() => {
        resetStore()
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    // =====================================================
    // 기본 렌더링 테스트
    // =====================================================
    describe('기본 렌더링', () => {
        it('컴포넌트가 렌더링됨', () => {
            render(
                <TestWrapper>
                    <WorkTemplateList />
                </TestWrapper>
            )

            expect(screen.getByText('작업 프리셋')).toBeInTheDocument()
        })

        it('템플릿이 없으면 빈 상태 표시', () => {
            render(
                <TestWrapper>
                    <WorkTemplateList />
                </TestWrapper>
            )

            expect(screen.getByText('프리셋이 없습니다')).toBeInTheDocument()
        })

        it('추가 버튼이 표시됨', () => {
            render(
                <TestWrapper>
                    <WorkTemplateList />
                </TestWrapper>
            )

            // '추가 (Alt+P)' 텍스트를 포함한 버튼 찾기
            expect(
                screen.getByRole('button', { name: /추가 \(Alt\+P\)/ })
            ).toBeInTheDocument()
        })

        it('템플릿이 있으면 목록에 표시됨', () => {
            const template = createTestTemplate()
            useWorkStore.setState({ templates: [template] })

            render(
                <TestWrapper>
                    <WorkTemplateList />
                </TestWrapper>
            )

            expect(screen.getByText('테스트 작업')).toBeInTheDocument()
            expect(screen.getByText('테스트 거래')).toBeInTheDocument()
        })

        it('여러 템플릿이 모두 표시됨', () => {
            const templates = [
                createTestTemplate({
                    id: 't1',
                    work_name: '작업1',
                    deal_name: '거래1',
                }),
                createTestTemplate({
                    id: 't2',
                    work_name: '작업2',
                    deal_name: '거래2',
                }),
                createTestTemplate({
                    id: 't3',
                    work_name: '작업3',
                    deal_name: '거래3',
                }),
            ]
            useWorkStore.setState({ templates })

            render(
                <TestWrapper>
                    <WorkTemplateList />
                </TestWrapper>
            )

            expect(screen.getByText('작업1')).toBeInTheDocument()
            expect(screen.getByText('작업2')).toBeInTheDocument()
            expect(screen.getByText('작업3')).toBeInTheDocument()
        })
    })

    // =====================================================
    // 템플릿 수정/삭제 버튼 테스트
    // =====================================================
    describe('템플릿 액션 버튼', () => {
        it('수정 버튼 클릭 시 편집 모달 열림', async () => {
            const user = userEvent.setup()
            const template = createTestTemplate()
            useWorkStore.setState({ templates: [template] })

            render(
                <TestWrapper>
                    <WorkTemplateList />
                </TestWrapper>
            )

            // 수정 버튼 클릭 (EditOutlined 아이콘)
            const edit_buttons = screen.getAllByRole('button')
            const edit_button = edit_buttons.find(
                (btn) => btn.querySelector('.anticon-edit') !== null
            )

            if (edit_button) {
                await user.click(edit_button)

                await waitFor(() => {
                    expect(screen.getByText('프리셋 수정')).toBeInTheDocument()
                })
            }
        })

        it('삭제 버튼 클릭 시 확인 팝업 표시', async () => {
            const user = userEvent.setup()
            const template = createTestTemplate()
            useWorkStore.setState({ templates: [template] })

            render(
                <TestWrapper>
                    <WorkTemplateList />
                </TestWrapper>
            )

            // 삭제 버튼 찾기
            const delete_buttons = screen.getAllByRole('button')
            const delete_button = delete_buttons.find(
                (btn) => btn.querySelector('.anticon-delete') !== null
            )

            if (delete_button) {
                await user.click(delete_button)

                await waitFor(() => {
                    expect(
                        screen.getByText('이 프리셋을 삭제하시겠습니까?')
                    ).toBeInTheDocument()
                })
            }
        })

        it('삭제 확인 시 템플릿 삭제', async () => {
            const user = userEvent.setup()
            const template = createTestTemplate()
            useWorkStore.setState({ templates: [template] })

            render(
                <TestWrapper>
                    <WorkTemplateList />
                </TestWrapper>
            )

            // 초기 상태 확인
            expect(useWorkStore.getState().templates).toHaveLength(1)

            // 삭제 버튼 클릭
            const delete_buttons = screen.getAllByRole('button')
            const delete_button = delete_buttons.find(
                (btn) => btn.querySelector('.anticon-delete') !== null
            )

            if (delete_button) {
                await user.click(delete_button)

                // 확인 팝업 대기
                await waitFor(() => {
                    expect(
                        screen.getByText('이 프리셋을 삭제하시겠습니까?')
                    ).toBeInTheDocument()
                })

                // Popconfirm 내 삭제 버튼 클릭
                const popconfirm_delete = screen.getByRole('button', {
                    name: '삭제',
                })
                await user.click(popconfirm_delete)

                await waitFor(() => {
                    const state = useWorkStore.getState()
                    expect(state.templates).toHaveLength(0)
                })
            }
        })
    })

    // =====================================================
    // UI 요소 테스트
    // =====================================================
    describe('UI 요소', () => {
        it('템플릿 작업명 태그가 표시됨', () => {
            const template = createTestTemplate({ color: '#ff4d4f' })
            useWorkStore.setState({ templates: [template] })

            render(
                <TestWrapper>
                    <WorkTemplateList />
                </TestWrapper>
            )

            const tag = screen.getByText('테스트 작업')
            expect(tag).toBeInTheDocument()
        })

        it('업무명과 카테고리가 표시됨', () => {
            const template = createTestTemplate({
                task_name: '기획',
                category_name: '기획업무',
            })
            useWorkStore.setState({ templates: [template] })

            render(
                <TestWrapper>
                    <WorkTemplateList />
                </TestWrapper>
            )

            expect(screen.getByText('기획 · 기획업무')).toBeInTheDocument()
        })

        it('도움말 텍스트가 표시됨', () => {
            render(
                <TestWrapper>
                    <WorkTemplateList />
                </TestWrapper>
            )

            expect(
                screen.getByText(/자주 사용하는 작업을 프리셋으로 저장하세요/)
            ).toBeInTheDocument()
        })

        it('템플릿이 없을 때 안내 텍스트 표시', () => {
            render(
                <TestWrapper>
                    <WorkTemplateList />
                </TestWrapper>
            )

            expect(
                screen.getByText(/"추가" 버튼으로 추가하세요/)
            ).toBeInTheDocument()
        })
    })

    // =====================================================
    // 스토어 직접 테스트 (컴포넌트 우회)
    // =====================================================
    describe('스토어 동작', () => {
        it('addTemplate으로 템플릿 추가', () => {
            const store = useWorkStore.getState()
            store.addTemplate({
                project_code: 'A00_00000',
                work_name: '새 작업',
                task_name: '개발',
                deal_name: '새 거래',
                category_name: '개발',
                note: '',
                color: '#1890ff',
            })

            const state = useWorkStore.getState()
            expect(state.templates).toHaveLength(1)
            expect(state.templates[0].work_name).toBe('새 작업')
        })

        it('deleteTemplate으로 템플릿 삭제', () => {
            const template = createTestTemplate()
            useWorkStore.setState({ templates: [template] })

            useWorkStore.getState().deleteTemplate('template-1')

            expect(useWorkStore.getState().templates).toHaveLength(0)
        })

        it('updateTemplate으로 템플릿 수정', () => {
            const template = createTestTemplate()
            useWorkStore.setState({ templates: [template] })

            useWorkStore.getState().updateTemplate('template-1', {
                work_name: '수정된 작업',
            })

            const state = useWorkStore.getState()
            expect(state.templates[0].work_name).toBe('수정된 작업')
        })

        it('applyTemplate으로 폼에 템플릿 적용', () => {
            const template = createTestTemplate({
                work_name: '적용할 작업',
                deal_name: '적용할 거래',
            })
            useWorkStore.setState({ templates: [template] })

            useWorkStore.getState().applyTemplate('template-1')

            const state = useWorkStore.getState()
            expect(state.form_data.work_name).toBe('적용할 작업')
            expect(state.form_data.deal_name).toBe('적용할 거래')
        })

        it('reorderTemplates으로 순서 변경', () => {
            const templates = [
                createTestTemplate({ id: 't1', work_name: '작업1' }),
                createTestTemplate({ id: 't2', work_name: '작업2' }),
                createTestTemplate({ id: 't3', work_name: '작업3' }),
            ]
            useWorkStore.setState({ templates })

            useWorkStore.getState().reorderTemplates('t3', 't1')

            const state = useWorkStore.getState()
            expect(state.templates[0].id).toBe('t3')
            expect(state.templates[1].id).toBe('t1')
            expect(state.templates[2].id).toBe('t2')
        })

        it('존재하지 않는 템플릿 삭제 시 에러 없음', () => {
            expect(() => {
                useWorkStore.getState().deleteTemplate('non-existent')
            }).not.toThrow()
        })

        it('존재하지 않는 템플릿 수정 시 에러 없음', () => {
            expect(() => {
                useWorkStore.getState().updateTemplate('non-existent', {
                    work_name: '수정',
                })
            }).not.toThrow()
        })

        it('존재하지 않는 템플릿 적용 시 form_data 변경 없음', () => {
            const initial_form = { ...useWorkStore.getState().form_data }

            useWorkStore.getState().applyTemplate('non-existent')

            expect(useWorkStore.getState().form_data).toEqual(initial_form)
        })
    })

    // =====================================================
    // 타이머 동작 테스트 (스토어 직접 조작)
    // =====================================================
    describe('타이머 동작', () => {
        it('템플릿 적용 후 타이머 시작', () => {
            vi.useFakeTimers()
            vi.setSystemTime(new Date('2026-01-19T10:00:00'))

            const template = createTestTemplate()
            useWorkStore.setState({ templates: [template] })

            // 템플릿 적용
            useWorkStore.getState().applyTemplate('template-1')
            // 타이머 시작
            useWorkStore.getState().startTimer('template-1')

            const state = useWorkStore.getState()
            expect(state.timer.is_running).toBe(true)
            expect(state.timer.active_template_id).toBe('template-1')
        })

        it('타이머 전환 시 이전 작업 저장', () => {
            vi.useFakeTimers()
            vi.setSystemTime(new Date('2026-01-19T10:00:00'))

            const templates = [
                createTestTemplate({
                    id: 't1',
                    work_name: '작업1',
                    deal_name: '거래1',
                }),
                createTestTemplate({
                    id: 't2',
                    work_name: '작업2',
                    deal_name: '거래2',
                }),
            ]
            useWorkStore.setState({ templates })

            // 첫 번째 템플릿으로 타이머 시작 (즉시 records에 세션 추가됨)
            useWorkStore.getState().applyTemplate('t1')
            useWorkStore.getState().startTimer('t1')

            // 타이머 시작 시 바로 레코드가 생성됨
            expect(useWorkStore.getState().records).toHaveLength(1)

            // 5분 경과
            vi.advanceTimersByTime(5 * 60 * 1000)

            // 두 번째 템플릿으로 전환
            useWorkStore.getState().switchTemplate('t2')

            const state = useWorkStore.getState()
            // 이전 작업 세션 종료 + 새 작업 세션 추가 = 2개 레코드
            expect(state.records).toHaveLength(2)
            
            // 이전 작업이 저장됨 (종료 시간이 채워짐)
            const record1 = state.records.find(r => r.work_name === '작업1')
            expect(record1).toBeDefined()
            expect(record1!.sessions[0].end_time).not.toBe('')
            
            // 새 작업이 진행 중 (종료 시간이 빈 문자열)
            const record2 = state.records.find(r => r.work_name === '작업2')
            expect(record2).toBeDefined()
            expect(record2!.sessions[0].end_time).toBe('')
            
            // 새 타이머 실행 중
            expect(state.timer.is_running).toBe(true)
            expect(state.timer.active_template_id).toBe('t2')
        })

        it('타이머 중지 시 레코드 생성', () => {
            vi.useFakeTimers()
            vi.setSystemTime(new Date('2026-01-19T10:00:00'))

            const template = createTestTemplate()
            useWorkStore.setState({ templates: [template] })

            // 템플릿 적용 및 타이머 시작
            useWorkStore.getState().applyTemplate('template-1')
            useWorkStore.getState().startTimer('template-1')

            // 30분 경과
            vi.advanceTimersByTime(30 * 60 * 1000)

            // 타이머 정지
            const result = useWorkStore.getState().stopTimer()

            expect(result).not.toBeNull()
            expect(useWorkStore.getState().records).toHaveLength(1)
            expect(useWorkStore.getState().timer.is_running).toBe(false)
        })
    })
})
