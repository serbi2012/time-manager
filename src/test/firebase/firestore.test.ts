/**
 * firestore 유틸리티 테스트
 *
 * Firestore 데이터 서비스 테스트 (Firebase SDK 모킹)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { WorkRecord, WorkTemplate, TimerState } from '../../types'
import type { ShortcutDefinition } from '../../store/useShortcutStore'

// Firebase Firestore 모킹
const mockSetDoc = vi.fn().mockResolvedValue(undefined)
const mockGetDoc = vi.fn()
const mockOnSnapshot = vi.fn()
const mockDoc = vi.fn().mockReturnValue({ id: 'mock-doc-ref' })

vi.mock('firebase/firestore', () => ({
    doc: (...args: any[]) => mockDoc(...args),
    setDoc: (...args: any[]) => mockSetDoc(...args),
    getDoc: (...args: any[]) => mockGetDoc(...args),
    onSnapshot: (...args: any[]) => mockOnSnapshot(...args),
}))

vi.mock('../../firebase/config', () => ({
    db: { type: 'mock-firestore' },
}))

// 모킹 후 import
import {
    saveUserData,
    loadUserData,
    subscribeToUserData,
    createInitialUserData,
} from '../../firebase/firestore'

describe('firestore 서비스', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // =====================================================
    // createInitialUserData 테스트
    // =====================================================
    describe('createInitialUserData', () => {
        it('빈 초기 데이터 구조 생성', () => {
            const initial_data = createInitialUserData()

            expect(initial_data.records).toEqual([])
            expect(initial_data.templates).toEqual([])
            expect(initial_data.custom_task_options).toEqual([])
            expect(initial_data.custom_category_options).toEqual([])
            expect(initial_data.updated_at).toBeDefined()
        })

        it('updated_at이 ISO 문자열 형식', () => {
            const initial_data = createInitialUserData()
            const date = new Date(initial_data.updated_at)

            expect(date instanceof Date).toBe(true)
            expect(isNaN(date.getTime())).toBe(false)
        })
    })

    // =====================================================
    // saveUserData 테스트
    // =====================================================
    describe('saveUserData', () => {
        it('사용자 데이터를 Firestore에 저장', async () => {
            const user_id = 'test-user-123'
            const data = {
                records: [
                    {
                        id: 'r1',
                        project_code: 'A00_00000',
                        work_name: '작업',
                        task_name: '개발',
                        deal_name: '거래',
                        category_name: '개발',
                        duration_minutes: 60,
                        note: '',
                        start_time: '09:00',
                        end_time: '10:00',
                        date: '2026-01-19',
                        sessions: [],
                        is_completed: false,
                    } as WorkRecord,
                ],
                templates: [],
                custom_task_options: ['업무1'],
                custom_category_options: ['카테고리1'],
            }

            await saveUserData(user_id, data)

            expect(mockDoc).toHaveBeenCalledWith(
                expect.anything(),
                'users',
                user_id
            )
            // setDoc이 호출되었는지 확인
            expect(mockSetDoc).toHaveBeenCalled()
            // 호출 인자 중 데이터 확인
            const call_args = mockSetDoc.mock.calls[0]
            expect(call_args[1]).toMatchObject({
                records: data.records,
                templates: data.templates,
                custom_task_options: data.custom_task_options,
                custom_category_options: data.custom_category_options,
            })
            expect(call_args[1].updated_at).toBeDefined()
            expect(call_args[2]).toEqual({ merge: true })
        })

        it('부분 데이터만 저장 가능 (merge: true)', async () => {
            const user_id = 'test-user-123'
            const partial_data = {
                custom_task_options: ['새 업무'],
            }

            await saveUserData(user_id, partial_data)

            expect(mockSetDoc).toHaveBeenCalled()
            const call_args = mockSetDoc.mock.calls[0]
            expect(call_args[1].custom_task_options).toEqual(['새 업무'])
            expect(call_args[2]).toEqual({ merge: true })
        })

        it('타이머 상태 저장', async () => {
            const user_id = 'test-user-123'
            const timer: TimerState = {
                is_running: true,
                start_time: Date.now(),
                active_template_id: 'template-1',
                active_form_data: {
                    project_code: 'A00_00000',
                    work_name: '작업',
                    task_name: '개발',
                    deal_name: '거래',
                    category_name: '개발',
                    note: '',
                },
                active_record_id: 'record-1',
                active_session_id: 'session-1',
            }

            await saveUserData(user_id, { timer })

            expect(mockSetDoc).toHaveBeenCalled()
            const call_args = mockSetDoc.mock.calls[0]
            expect(call_args[1].timer).toMatchObject({
                is_running: true,
                active_template_id: 'template-1',
            })
        })

        it('단축키 설정 저장', async () => {
            const user_id = 'test-user-123'
            const shortcuts: ShortcutDefinition[] = [
                {
                    id: 'new-work',
                    name: '새 작업 추가',
                    description: '설명',
                    keys: 'Alt+N',
                    category: 'general',
                    enabled: false,
                    action: 'openNewWorkModal',
                },
            ]

            await saveUserData(user_id, { shortcuts })

            expect(mockSetDoc).toHaveBeenCalled()
            const call_args = mockSetDoc.mock.calls[0]
            expect(call_args[1].shortcuts).toEqual(shortcuts)
        })
    })

    // =====================================================
    // loadUserData 테스트
    // =====================================================
    describe('loadUserData', () => {
        it('존재하는 사용자 데이터 로드', async () => {
            const user_id = 'test-user-123'
            const mock_data = {
                records: [{ id: 'r1' }],
                templates: [{ id: 't1' }],
                custom_task_options: ['업무1'],
                custom_category_options: ['카테고리1'],
                updated_at: '2026-01-19T00:00:00.000Z',
            }

            mockGetDoc.mockResolvedValueOnce({
                exists: () => true,
                data: () => mock_data,
            })

            const result = await loadUserData(user_id)

            expect(mockDoc).toHaveBeenCalledWith(
                expect.anything(),
                'users',
                user_id
            )
            expect(result).toEqual(mock_data)
        })

        it('존재하지 않는 사용자는 null 반환', async () => {
            const user_id = 'non-existent-user'

            mockGetDoc.mockResolvedValueOnce({
                exists: () => false,
                data: () => null,
            })

            const result = await loadUserData(user_id)

            expect(result).toBeNull()
        })
    })

    // =====================================================
    // subscribeToUserData 테스트
    // =====================================================
    describe('subscribeToUserData', () => {
        it('실시간 구독 시작 및 unsubscribe 함수 반환', () => {
            const user_id = 'test-user-123'
            const callback = vi.fn()
            const mock_unsubscribe = vi.fn()

            mockOnSnapshot.mockReturnValueOnce(mock_unsubscribe)

            const unsubscribe = subscribeToUserData(user_id, callback)

            expect(mockOnSnapshot).toHaveBeenCalled()
            expect(typeof unsubscribe).toBe('function')
        })

        it('데이터 변경 시 콜백 호출', () => {
            const user_id = 'test-user-123'
            const callback = vi.fn()
            const mock_data = {
                records: [{ id: 'r1' }],
                templates: [],
            }

            // onSnapshot 콜백을 캡처하여 직접 호출
            mockOnSnapshot.mockImplementationOnce((_ref, snapshot_callback) => {
                // 즉시 콜백 호출 (데이터 존재)
                snapshot_callback({
                    exists: () => true,
                    data: () => mock_data,
                })
                return vi.fn()
            })

            subscribeToUserData(user_id, callback)

            expect(callback).toHaveBeenCalledWith(mock_data)
        })

        it('데이터가 없으면 null로 콜백 호출', () => {
            const user_id = 'test-user-123'
            const callback = vi.fn()

            mockOnSnapshot.mockImplementationOnce((_ref, snapshot_callback) => {
                snapshot_callback({
                    exists: () => false,
                    data: () => null,
                })
                return vi.fn()
            })

            subscribeToUserData(user_id, callback)

            expect(callback).toHaveBeenCalledWith(null)
        })
    })

    // =====================================================
    // UserData 타입 검증
    // =====================================================
    describe('UserData 타입 검증', () => {
        it('완전한 UserData 구조', async () => {
            const complete_data = {
                records: [
                    {
                        id: 'r1',
                        project_code: 'A00_00000',
                        work_name: '작업',
                        task_name: '개발',
                        deal_name: '거래',
                        category_name: '개발',
                        duration_minutes: 60,
                        note: '',
                        start_time: '09:00',
                        end_time: '10:00',
                        date: '2026-01-19',
                        sessions: [
                            {
                                id: 's1',
                                date: '2026-01-19',
                                start_time: '09:00',
                                end_time: '10:00',
                                duration_minutes: 60,
                            },
                        ],
                        is_completed: false,
                    },
                ] as WorkRecord[],
                templates: [
                    {
                        id: 't1',
                        project_code: 'A00_00000',
                        work_name: '템플릿',
                        task_name: '개발',
                        deal_name: '거래',
                        category_name: '개발',
                        note: '',
                        color: '#1890ff',
                        created_at: '2026-01-19T00:00:00.000Z',
                    },
                ] as WorkTemplate[],
                custom_task_options: ['업무1', '업무2'],
                custom_category_options: ['카테고리1'],
                timer: {
                    is_running: false,
                    start_time: null,
                    active_template_id: null,
                    active_form_data: null,
                    active_record_id: null,
                    active_session_id: null,
                } as TimerState,
                shortcuts: [
                    {
                        id: 'new-work',
                        name: '새 작업',
                        description: '설명',
                        keys: 'Alt+N',
                        category: 'general' as const,
                        enabled: true,
                        action: 'openNewWorkModal',
                    },
                ],
                hidden_autocomplete_options: {
                    work_name: ['숨김작업'],
                    task_name: [],
                    deal_name: [],
                    project_code: [],
                    task_option: [],
                    category_option: [],
                },
            }

            await saveUserData('test-user', complete_data)

            expect(mockSetDoc).toHaveBeenCalled()
            const call_args = mockSetDoc.mock.calls[0]
            expect(call_args[1]).toMatchObject({
                records: complete_data.records,
                templates: complete_data.templates,
                timer: complete_data.timer,
                shortcuts: complete_data.shortcuts,
                hidden_autocomplete_options:
                    complete_data.hidden_autocomplete_options,
            })
        })
    })
})
