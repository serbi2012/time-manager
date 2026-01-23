/**
 * syncService 유닛 테스트
 *
 * Firebase 동기화 서비스 테스트 (firestore는 모킹)
 * 새로운 컬렉션 구조 및 부분 업데이트 방식 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWorkStore } from '../../store/useWorkStore'
import { useShortcutStore, DEFAULT_SHORTCUTS } from '../../store/useShortcutStore'
import type { WorkRecord, WorkTemplate } from '../../types'

// Firebase 모듈 모킹 - 새로운 컬렉션 구조 함수들
vi.mock('../../firebase/firestore', () => ({
    saveUserData: vi.fn().mockResolvedValue(undefined),
    loadUserData: vi.fn().mockResolvedValue(null),
    subscribeToUserData: vi.fn().mockReturnValue(() => {}),
    createInitialUserData: vi.fn().mockReturnValue({
        records: [],
        templates: [],
        custom_task_options: [],
        custom_category_options: [],
        updated_at: new Date().toISOString(),
    }),
    // 새로운 컬렉션 구조 함수들
    saveRecord: vi.fn().mockResolvedValue(undefined),
    deleteRecordFromFirestore: vi.fn().mockResolvedValue(undefined),
    loadAllRecords: vi.fn().mockResolvedValue([]),
    saveRecordsBatch: vi.fn().mockResolvedValue(undefined),
    saveTemplateToFirestore: vi.fn().mockResolvedValue(undefined),
    deleteTemplateFromFirestore: vi.fn().mockResolvedValue(undefined),
    loadAllTemplates: vi.fn().mockResolvedValue([]),
    saveTemplatesBatch: vi.fn().mockResolvedValue(undefined),
    saveSettings: vi.fn().mockResolvedValue(undefined),
    loadSettings: vi.fn().mockResolvedValue(null),
    markMigrationComplete: vi.fn().mockResolvedValue(undefined),
    checkMigrationStatus: vi.fn().mockResolvedValue(true),
    loadAllData: vi.fn().mockResolvedValue({
        records: [],
        templates: [],
        settings: null,
    }),
}))

// 마이그레이션 모듈 모킹
vi.mock('../../firebase/migration', () => ({
    checkAndMigrate: vi.fn().mockResolvedValue({
        needed_migration: false,
        result: { success: true, migrated: false, records_count: 0, templates_count: 0 },
    }),
    migrateToCollectionStructure: vi.fn().mockResolvedValue({
        success: true,
        migrated: false,
        records_count: 0,
        templates_count: 0,
    }),
    loadMigratedData: vi.fn().mockResolvedValue({
        records: [],
        templates: [],
        settings: null,
    }),
}))

// 모킹된 모듈 import
import {
    saveRecord,
    deleteRecordFromFirestore,
    saveTemplateToFirestore,
    deleteTemplateFromFirestore,
    saveSettings,
    loadAllData,
} from '../../firebase/firestore'
import { checkAndMigrate } from '../../firebase/migration'
import {
    syncRecord,
    syncDeleteRecord,
    syncTemplate,
    syncDeleteTemplate,
    syncSettings,
    loadFromFirebase,
    refreshFromFirebase,
    syncBeforeUnload,
    checkPendingSync,
    setCurrentUser,
    clearSyncState,
    getCurrentUser,
} from '../../firebase/syncService'
import type { User } from 'firebase/auth'

// 테스트용 유저 객체
const mock_user = {
    uid: 'test-user-123',
    email: 'test@example.com',
} as User

// 테스트용 레코드 생성
const createTestRecord = (id: string): WorkRecord => ({
    id,
    project_code: 'A00_00000',
    work_name: `작업 ${id}`,
    task_name: '개발',
    deal_name: `거래 ${id}`,
    category_name: '개발',
    duration_minutes: 60,
    note: '',
    start_time: '09:00',
    end_time: '10:00',
    date: '2026-01-19',
    sessions: [
        {
            id: `session-${id}`,
            date: '2026-01-19',
            start_time: '09:00',
            end_time: '10:00',
            duration_minutes: 60,
        },
    ],
    is_completed: false,
})

// 테스트용 템플릿 생성
const createTestTemplate = (id: string): WorkTemplate => ({
    id,
    project_code: 'A00_00000',
    work_name: `템플릿 ${id}`,
    task_name: '개발',
    deal_name: `거래 ${id}`,
    category_name: '개발',
    note: '',
    color: '#1890ff',
    created_at: '2026-01-19T00:00:00.000Z',
})

// 스토어 초기화
const resetStores = () => {
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
    useShortcutStore.setState({
        shortcuts: [...DEFAULT_SHORTCUTS],
    })
    localStorage.clear()
    clearSyncState()
}

describe('syncService', () => {
    beforeEach(() => {
        resetStores()
        vi.clearAllMocks()
    })

    afterEach(() => {
        localStorage.clear()
        clearSyncState()
    })

    // =====================================================
    // setCurrentUser / clearSyncState 테스트
    // =====================================================
    describe('setCurrentUser / clearSyncState', () => {
        it('현재 사용자를 설정함', () => {
            setCurrentUser(mock_user)
            expect(getCurrentUser()).toBe(mock_user)
        })

        it('clearSyncState로 사용자 정보 초기화', () => {
            setCurrentUser(mock_user)
            clearSyncState()
            expect(getCurrentUser()).toBeNull()
        })
    })

    // =====================================================
    // syncRecord 테스트
    // =====================================================
    describe('syncRecord', () => {
        it('로그인된 상태에서 레코드를 Firebase에 저장', async () => {
            setCurrentUser(mock_user)
            const record = createTestRecord('1')

            await syncRecord(record)

            expect(saveRecord).toHaveBeenCalledWith(mock_user.uid, record)
        })

        it('로그인되지 않은 상태에서는 저장하지 않음', async () => {
            clearSyncState()
            const record = createTestRecord('1')

            await syncRecord(record)

            expect(saveRecord).not.toHaveBeenCalled()
        })
    })

    // =====================================================
    // syncDeleteRecord 테스트
    // =====================================================
    describe('syncDeleteRecord', () => {
        it('로그인된 상태에서 레코드를 Firebase에서 삭제', async () => {
            setCurrentUser(mock_user)

            await syncDeleteRecord('record-1')

            expect(deleteRecordFromFirestore).toHaveBeenCalledWith(
                mock_user.uid,
                'record-1'
            )
        })

        it('로그인되지 않은 상태에서는 삭제하지 않음', async () => {
            clearSyncState()

            await syncDeleteRecord('record-1')

            expect(deleteRecordFromFirestore).not.toHaveBeenCalled()
        })
    })

    // =====================================================
    // syncTemplate 테스트
    // =====================================================
    describe('syncTemplate', () => {
        it('로그인된 상태에서 템플릿을 Firebase에 저장', async () => {
            setCurrentUser(mock_user)
            const template = createTestTemplate('1')

            await syncTemplate(template)

            expect(saveTemplateToFirestore).toHaveBeenCalledWith(
                mock_user.uid,
                template
            )
        })

        it('로그인되지 않은 상태에서는 저장하지 않음', async () => {
            clearSyncState()
            const template = createTestTemplate('1')

            await syncTemplate(template)

            expect(saveTemplateToFirestore).not.toHaveBeenCalled()
        })
    })

    // =====================================================
    // syncDeleteTemplate 테스트
    // =====================================================
    describe('syncDeleteTemplate', () => {
        it('로그인된 상태에서 템플릿을 Firebase에서 삭제', async () => {
            setCurrentUser(mock_user)

            await syncDeleteTemplate('template-1')

            expect(deleteTemplateFromFirestore).toHaveBeenCalledWith(
                mock_user.uid,
                'template-1'
            )
        })

        it('로그인되지 않은 상태에서는 삭제하지 않음', async () => {
            clearSyncState()

            await syncDeleteTemplate('template-1')

            expect(deleteTemplateFromFirestore).not.toHaveBeenCalled()
        })
    })

    // =====================================================
    // syncSettings 테스트
    // =====================================================
    describe('syncSettings', () => {
        it('로그인된 상태에서 설정을 Firebase에 저장', async () => {
            setCurrentUser(mock_user)
            const settings = {
                custom_task_options: ['옵션1', '옵션2'],
            }

            await syncSettings(settings)

            expect(saveSettings).toHaveBeenCalledWith(mock_user.uid, settings)
        })

        it('로그인되지 않은 상태에서는 저장하지 않음', async () => {
            clearSyncState()

            await syncSettings({ custom_task_options: ['옵션1'] })

            expect(saveSettings).not.toHaveBeenCalled()
        })
    })

    // =====================================================
    // loadFromFirebase 테스트
    // =====================================================
    describe('loadFromFirebase', () => {
        beforeEach(() => {
            // checkAndMigrate 모킹 초기화
            vi.mocked(checkAndMigrate).mockResolvedValue({
                needed_migration: false,
                result: { success: true, migrated: false, records_count: 0, templates_count: 0 },
            })
        })

        it('Firebase에서 데이터를 로드하여 스토어에 적용', async () => {
            const firebase_data = {
                records: [createTestRecord('fb-1')],
                templates: [createTestTemplate('fb-1')],
                settings: {
                    custom_task_options: ['Firebase 업무'],
                    custom_category_options: ['Firebase 카테고리'],
                    updated_at: new Date().toISOString(),
                },
            }
            vi.mocked(loadAllData).mockResolvedValueOnce(firebase_data)

            const result = await loadFromFirebase(mock_user)

            expect(result).toBe(true)
            expect(checkAndMigrate).toHaveBeenCalledWith(mock_user.uid)

            const state = useWorkStore.getState()
            expect(state.records).toHaveLength(1)
            expect(state.records[0].id).toBe('fb-1')
            expect(state.templates).toHaveLength(1)
            expect(state.custom_task_options).toContain('Firebase 업무')
        })

        it('현재 사용자가 설정됨', async () => {
            vi.mocked(loadAllData).mockResolvedValueOnce({
                records: [],
                templates: [],
                settings: null,
            })

            await loadFromFirebase(mock_user)

            expect(getCurrentUser()).toBe(mock_user)
        })

        it('타이머 상태도 복원', async () => {
            const firebase_data = {
                records: [],
                templates: [],
                settings: {
                    timer: {
                        is_running: true,
                        start_time: Date.now() - 60000,
                        active_template_id: null,
                        active_form_data: {
                            project_code: '',
                            work_name: '진행중인 작업',
                            task_name: '개발',
                            deal_name: '거래',
                            category_name: '개발',
                            note: '',
                        },
                        active_record_id: null,
                        active_session_id: null,
                    },
                    custom_task_options: [],
                    custom_category_options: [],
                    updated_at: new Date().toISOString(),
                },
            }
            vi.mocked(loadAllData).mockResolvedValueOnce(firebase_data)

            await loadFromFirebase(mock_user)

            const state = useWorkStore.getState()
            expect(state.timer.is_running).toBe(true)
            expect(state.timer.active_form_data?.work_name).toBe('진행중인 작업')
        })

        it('단축키 설정도 복원', async () => {
            const firebase_data = {
                records: [],
                templates: [],
                settings: {
                    shortcuts: [
                        { ...DEFAULT_SHORTCUTS[0], enabled: false },
                        ...DEFAULT_SHORTCUTS.slice(1),
                    ],
                    custom_task_options: [],
                    custom_category_options: [],
                    updated_at: new Date().toISOString(),
                },
            }
            vi.mocked(loadAllData).mockResolvedValueOnce(firebase_data)

            await loadFromFirebase(mock_user)

            const shortcut_state = useShortcutStore.getState()
            const new_work_shortcut = shortcut_state.getShortcut('new-work')
            expect(new_work_shortcut?.enabled).toBe(false)
        })
    })

    // =====================================================
    // refreshFromFirebase 테스트
    // =====================================================
    describe('refreshFromFirebase', () => {
        it('서버에서 최신 데이터를 다시 로드', async () => {
            const firebase_data = {
                records: [createTestRecord('refreshed-1')],
                templates: [],
                settings: {
                    custom_task_options: ['새로운 옵션'],
                    custom_category_options: [],
                    updated_at: new Date().toISOString(),
                },
            }
            vi.mocked(loadAllData).mockResolvedValueOnce(firebase_data)

            const result = await refreshFromFirebase(mock_user)

            expect(result).toBe(true)
            const state = useWorkStore.getState()
            expect(state.records).toHaveLength(1)
            expect(state.records[0].id).toBe('refreshed-1')
        })

        it('로드 실패 시 false 반환', async () => {
            vi.mocked(loadAllData).mockRejectedValueOnce(new Error('Network error'))

            const result = await refreshFromFirebase(mock_user)

            expect(result).toBe(false)
        })
    })

    // =====================================================
    // syncBeforeUnload 테스트
    // =====================================================
    describe('syncBeforeUnload', () => {
        it('localStorage에 백업 데이터 저장', () => {
            // 스토어에 데이터 설정
            useWorkStore.setState({
                records: [createTestRecord('1')],
                templates: [createTestTemplate('1')],
            })

            syncBeforeUnload(mock_user)

            const backup = localStorage.getItem('time_manager_pending_sync')
            expect(backup).not.toBeNull()

            const parsed = JSON.parse(backup!)
            expect(parsed.user_id).toBe(mock_user.uid)
            expect(parsed.records).toHaveLength(1)
            expect(parsed.templates).toHaveLength(1)
            expect(parsed.timestamp).toBeDefined()
        })

        it('타이머 상태도 백업에 포함', () => {
            useWorkStore.setState({
                records: [],
                templates: [],
                timer: {
                    is_running: true,
                    start_time: Date.now(),
                    active_template_id: null,
                    active_form_data: null,
                    active_record_id: null,
                    active_session_id: null,
                },
            })

            syncBeforeUnload(mock_user)

            const backup = localStorage.getItem('time_manager_pending_sync')
            const parsed = JSON.parse(backup!)
            expect(parsed.timer.is_running).toBe(true)
        })

        it('단축키 설정도 백업에 포함', () => {
            useShortcutStore.getState().toggleShortcut('new-work')

            syncBeforeUnload(mock_user)

            const backup = localStorage.getItem('time_manager_pending_sync')
            const parsed = JSON.parse(backup!)
            const shortcut = parsed.shortcuts.find(
                (s: { id: string; enabled: boolean }) => s.id === 'new-work'
            )
            expect(shortcut.enabled).toBe(false)
        })
    })

    // =====================================================
    // checkPendingSync 테스트
    // =====================================================
    describe('checkPendingSync', () => {
        it('미저장 백업이 있으면 로그 출력 후 삭제 (새 구조에서는 즉시 저장)', async () => {
            // 5분 이내 백업 생성
            const backup_data = {
                records: [createTestRecord('backup-1')],
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
                timer: {
                    is_running: false,
                    start_time: null,
                    active_template_id: null,
                    active_form_data: null,
                    active_record_id: null,
                    active_session_id: null,
                },
                shortcuts: DEFAULT_SHORTCUTS,
                user_id: mock_user.uid,
                timestamp: Date.now() - 60000, // 1분 전
            }
            localStorage.setItem(
                'time_manager_pending_sync',
                JSON.stringify(backup_data)
            )

            await checkPendingSync(mock_user)

            // 새 구조에서는 백업만 삭제 (즉시 저장되므로 복구 불필요)
            expect(localStorage.getItem('time_manager_pending_sync')).toBeNull()
        })

        it('다른 사용자의 백업은 삭제', async () => {
            const backup_data = {
                records: [createTestRecord('other-user')],
                templates: [],
                user_id: 'different-user-id',
                timestamp: Date.now() - 60000,
            }
            localStorage.setItem(
                'time_manager_pending_sync',
                JSON.stringify(backup_data)
            )

            await checkPendingSync(mock_user)

            // 백업이 삭제됨
            expect(localStorage.getItem('time_manager_pending_sync')).toBeNull()
        })

        it('백업이 없으면 아무것도 하지 않음', async () => {
            await checkPendingSync(mock_user)

            // 에러 없이 완료
            expect(true).toBe(true)
        })

        it('잘못된 JSON 백업은 삭제', async () => {
            localStorage.setItem('time_manager_pending_sync', 'invalid json')

            await checkPendingSync(mock_user)

            expect(localStorage.getItem('time_manager_pending_sync')).toBeNull()
        })
    })
})
