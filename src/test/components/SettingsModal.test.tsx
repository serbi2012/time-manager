/**
 * SettingsModal 컴포넌트 테스트
 *
 * 설정 모달의 렌더링 및 상호작용 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigProvider } from 'antd'
import koKR from 'antd/locale/ko_KR'
import SettingsModal from '../../components/SettingsModal'
import { useShortcutStore, DEFAULT_SHORTCUTS } from '../../store/useShortcutStore'
import { useWorkStore } from '../../store/useWorkStore'

// 스토어 초기화
const resetStores = () => {
    useShortcutStore.setState({
        shortcuts: [...DEFAULT_SHORTCUTS],
    })
    useWorkStore.setState({
        records: [],
        templates: [],
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

// 기본 props
const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onExport: vi.fn(),
    onImport: vi.fn(),
    isAuthenticated: false,
}

describe('SettingsModal', () => {
    beforeEach(() => {
        resetStores()
        vi.clearAllMocks()
    })

    // =====================================================
    // 기본 렌더링 테스트
    // =====================================================
    describe('기본 렌더링', () => {
        it('모달이 열려있을 때 렌더링됨', () => {
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} />
                </TestWrapper>
            )

            expect(screen.getByText('설정')).toBeInTheDocument()
        })

        it('모달이 닫혀있을 때 렌더링되지 않음', () => {
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} open={false} />
                </TestWrapper>
            )

            expect(screen.queryByText('설정')).not.toBeInTheDocument()
        })

        it('4개의 탭이 표시됨', () => {
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} />
                </TestWrapper>
            )

            expect(screen.getByText('테마')).toBeInTheDocument()
            expect(screen.getByText('데이터')).toBeInTheDocument()
            expect(screen.getByText('자동완성')).toBeInTheDocument()
            expect(screen.getByText('단축키')).toBeInTheDocument()
        })
    })

    // =====================================================
    // 데이터 탭 테스트
    // =====================================================
    describe('데이터 탭', () => {
        it('내보내기 버튼 클릭 시 onExport 호출', async () => {
            const user = userEvent.setup()
            const on_export = vi.fn()
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} onExport={on_export} />
                </TestWrapper>
            )

            // 데이터 탭으로 이동
            await user.click(screen.getByText('데이터'))

            await waitFor(() => {
                expect(screen.getByText('데이터 내보내기 (Export)')).toBeInTheDocument()
            })

            const export_button = screen.getByText('데이터 내보내기 (Export)')
            fireEvent.click(export_button)

            expect(on_export).toHaveBeenCalledTimes(1)
        })

        it('가져오기 버튼이 항상 활성화됨', async () => {
            const user = userEvent.setup()
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} isAuthenticated={false} />
                </TestWrapper>
            )

            // 데이터 탭으로 이동
            await user.click(screen.getByText('데이터'))

            await waitFor(() => {
                expect(screen.getByText('데이터 가져오기 (Import)')).toBeInTheDocument()
            })

            const import_button = screen.getByText('데이터 가져오기 (Import)')
            expect(import_button.closest('button')).not.toBeDisabled()
        })

        it('가져오기 시 주의 메시지 표시', async () => {
            const user = userEvent.setup()
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} isAuthenticated={false} />
                </TestWrapper>
            )

            // 데이터 탭으로 이동
            await user.click(screen.getByText('데이터'))

            await waitFor(() => {
                expect(
                    screen.getByText(/가져오기 시 기존 데이터가 덮어씌워집니다/)
                ).toBeInTheDocument()
            })
        })

        it('로그인되면 Firebase Cloud 태그 표시', async () => {
            const user = userEvent.setup()
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} isAuthenticated={true} />
                </TestWrapper>
            )

            // 데이터 탭으로 이동
            await user.click(screen.getByText('데이터'))

            await waitFor(() => {
                expect(screen.getByText('Firebase Cloud')).toBeInTheDocument()
            })
        })

        it('로그인되지 않으면 LocalStorage 태그 표시', async () => {
            const user = userEvent.setup()
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} isAuthenticated={false} />
                </TestWrapper>
            )

            // 데이터 탭으로 이동
            await user.click(screen.getByText('데이터'))

            await waitFor(() => {
                expect(screen.getByText('LocalStorage (브라우저)')).toBeInTheDocument()
            })
        })
    })

    // =====================================================
    // 단축키 탭 테스트
    // =====================================================
    describe('단축키 탭', () => {
        it('단축키 탭 클릭 시 단축키 목록 표시', async () => {
            const user = userEvent.setup()
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} />
                </TestWrapper>
            )

            await user.click(screen.getByText('단축키'))

            // 단축키 목록이 표시되어야 함
            await waitFor(() => {
                expect(screen.getByText('새 작업 추가')).toBeInTheDocument()
            })
        })

        it('단축키 토글 시 스토어 상태 변경', async () => {
            const user = userEvent.setup()
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} />
                </TestWrapper>
            )

            // 단축키 탭으로 이동
            await user.click(screen.getByText('단축키'))

            // 초기 상태 확인
            const initial_state = useShortcutStore.getState()
            const new_work_shortcut = initial_state.getShortcut('new-work')
            expect(new_work_shortcut?.enabled).toBe(true)

            // 스위치를 찾아서 토글 (첫 번째 스위치가 '새 작업 추가')
            await waitFor(() => {
                const switches = screen.getAllByRole('switch')
                expect(switches.length).toBeGreaterThan(0)
            })

            const switches = screen.getAllByRole('switch')
            await user.click(switches[0])

            // 스토어 상태 변경 확인
            const updated_state = useShortcutStore.getState()
            const updated_shortcut = updated_state.getShortcut('new-work')
            expect(updated_shortcut?.enabled).toBe(false)
        })

        it('단축키 키 조합이 표시됨', async () => {
            const user = userEvent.setup()
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} />
                </TestWrapper>
            )

            await user.click(screen.getByText('단축키'))

            await waitFor(() => {
                // Alt+N 같은 키 조합이 표시되어야 함
                expect(screen.getByText('Alt+N')).toBeInTheDocument()
            })
        })

        it('기본값으로 초기화 버튼이 있음', async () => {
            const user = userEvent.setup()
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} />
                </TestWrapper>
            )

            await user.click(screen.getByText('단축키'))

            await waitFor(() => {
                expect(
                    screen.getByText('기본값으로 초기화')
                ).toBeInTheDocument()
            })
        })
    })

    // =====================================================
    // 자동완성 탭 테스트
    // =====================================================
    describe('자동완성 탭', () => {
        it('자동완성 탭 클릭 시 옵션 목록 표시', async () => {
            const user = userEvent.setup()
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} />
                </TestWrapper>
            )

            await user.click(screen.getByText('자동완성'))

            await waitFor(() => {
                // '작업명 (N개)' 형식으로 표시되므로 정규식 사용
                expect(screen.getByText(/^작업명/)).toBeInTheDocument()
                expect(screen.getByText(/^거래명/)).toBeInTheDocument()
                expect(screen.getByText(/^프로젝트 코드/)).toBeInTheDocument()
            })
        })

        it('레코드에서 추출한 옵션이 표시됨', async () => {
            // 테스트 데이터 설정
            useWorkStore.setState({
                records: [
                    {
                        id: 'r1',
                        project_code: 'A25_TEST',
                        work_name: '테스트 작업',
                        task_name: '개발',
                        deal_name: '테스트 거래',
                        category_name: '개발',
                        duration_minutes: 60,
                        note: '',
                        start_time: '09:00',
                        end_time: '10:00',
                        date: '2026-01-19',
                        sessions: [],
                        is_completed: false,
                    },
                ],
                templates: [],
            })

            const user = userEvent.setup()
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} />
                </TestWrapper>
            )

            await user.click(screen.getByText('자동완성'))

            await waitFor(() => {
                expect(screen.getByText('테스트 작업')).toBeInTheDocument()
                expect(screen.getByText('테스트 거래')).toBeInTheDocument()
                expect(screen.getByText('A25_TEST')).toBeInTheDocument()
            })
        })
    })

    // =====================================================
    // 모달 닫기 테스트
    // =====================================================
    describe('모달 닫기', () => {
        it('닫기 버튼 클릭 시 onClose 호출', async () => {
            const on_close = vi.fn()
            render(
                <TestWrapper>
                    <SettingsModal {...defaultProps} onClose={on_close} />
                </TestWrapper>
            )

            // X 버튼 클릭
            const close_button = screen.getByRole('button', { name: /close/i })
            fireEvent.click(close_button)

            expect(on_close).toHaveBeenCalledTimes(1)
        })
    })
})
