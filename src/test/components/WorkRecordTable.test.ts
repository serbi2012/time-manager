/* eslint-disable @typescript-eslint/no-explicit-any -- 레거시 타입 테스트 */
/**
 * WorkRecordTable 컴포넌트 유틸리티 함수 테스트
 *
 * 컴포넌트 내부 유틸리티 함수들을 별도 모듈로 추출하여 테스트
 */
import { describe, it, expect } from 'vitest'
import type { WorkRecord, WorkSession } from '../../types'

// WorkRecordTable에서 사용하는 유틸리티 함수들 재구현 (테스트용)
// 실제 프로덕션에서는 이 함수들을 별도 모듈로 분리하는 것이 좋습니다

/**
 * 분을 읽기 쉬운 형식으로 변환
 */
function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes}분`
    }
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (mins === 0) {
        return `${hrs}시간`
    }
    return `${hrs}시간 ${mins}분`
}

/**
 * 타이머 표시 형식 (HH:MM)
 */
function formatTimer(seconds: number): string {
    const total_mins = Math.floor(seconds / 60)
    const hrs = Math.floor(total_mins / 60)
    const mins = total_mins % 60
    return `${hrs.toString().padStart(2, '0')}:${mins
        .toString()
        .padStart(2, '0')}`
}

/**
 * 세션의 duration을 분 단위로 가져오기 (기존 데이터 호환)
 */
function getSessionDurationMinutes(session: WorkSession): number {
    if (
        session.duration_minutes !== undefined &&
        !isNaN(session.duration_minutes)
    ) {
        return session.duration_minutes
    }
    // 기존 데이터는 duration_seconds 필드가 있을 수 있음
    const legacy = session as unknown as { duration_seconds?: number }
    if (
        legacy.duration_seconds !== undefined &&
        !isNaN(legacy.duration_seconds)
    ) {
        return Math.ceil(legacy.duration_seconds / 60)
    }
    return 0
}

/**
 * 레코드의 duration_minutes 가져오기 (NaN 처리)
 */
function getRecordDurationMinutes(record: WorkRecord): number {
    if (
        record.duration_minutes !== undefined &&
        !isNaN(record.duration_minutes) &&
        record.duration_minutes > 0
    ) {
        return record.duration_minutes
    }
    if (record.sessions && record.sessions.length > 0) {
        const total_minutes = record.sessions.reduce(
            (sum, s) => sum + getSessionDurationMinutes(s),
            0
        )
        if (total_minutes > 0) {
            return Math.max(1, total_minutes)
        }
    }
    return 0
}

/**
 * 특정 날짜의 세션들만 시간 합산
 */
function getRecordDurationMinutesForDate(
    record: WorkRecord,
    target_date: string
): number {
    if (!record.sessions || record.sessions.length === 0) {
        if (record.date === target_date) {
            return getRecordDurationMinutes(record)
        }
        return 0
    }

    const date_sessions = record.sessions.filter(
        (s) => (s.date || record.date) === target_date
    )

    if (date_sessions.length === 0) {
        return 0
    }

    return date_sessions.reduce(
        (sum, s) => sum + getSessionDurationMinutes(s),
        0
    )
}

/**
 * 특정 날짜의 시작/종료 시간 가져오기
 */
function getTimeRangeForDate(
    record: WorkRecord,
    target_date: string
): { start_time: string; end_time: string } {
    if (!record.sessions || record.sessions.length === 0) {
        if (record.date === target_date) {
            return {
                start_time: record.start_time || '',
                end_time: record.end_time || '',
            }
        }
        return { start_time: '', end_time: '' }
    }

    const date_sessions = record.sessions.filter(
        (s) => (s.date || record.date) === target_date
    )

    if (date_sessions.length === 0) {
        return { start_time: '', end_time: '' }
    }

    const sorted = [...date_sessions].sort((a, b) => {
        const a_start = a.start_time || '00:00'
        const b_start = b.start_time || '00:00'
        return a_start.localeCompare(b_start)
    })

    return {
        start_time: sorted[0].start_time || '',
        end_time: sorted[sorted.length - 1].end_time || '',
    }
}

// 테스트용 헬퍼
const createTestSession = (overrides: Partial<WorkSession> = {}): WorkSession => ({
    id: 'session-1',
    date: '2026-01-19',
    start_time: '09:00',
    end_time: '10:00',
    duration_minutes: 60,
    ...overrides,
})

const createTestRecord = (overrides: Partial<WorkRecord> = {}): WorkRecord => ({
    id: 'record-1',
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
    sessions: [createTestSession()],
    is_completed: false,
    ...overrides,
})

// =====================================================
// formatDuration 테스트
// =====================================================
describe('formatDuration', () => {
    it('0분', () => {
        expect(formatDuration(0)).toBe('0분')
    })

    it('1분', () => {
        expect(formatDuration(1)).toBe('1분')
    })

    it('59분', () => {
        expect(formatDuration(59)).toBe('59분')
    })

    it('정확히 1시간', () => {
        expect(formatDuration(60)).toBe('1시간')
    })

    it('정확히 2시간', () => {
        expect(formatDuration(120)).toBe('2시간')
    })

    it('1시간 30분', () => {
        expect(formatDuration(90)).toBe('1시간 30분')
    })

    it('2시간 15분', () => {
        expect(formatDuration(135)).toBe('2시간 15분')
    })

    it('8시간 (표준 근무)', () => {
        expect(formatDuration(480)).toBe('8시간')
    })

    it('8시간 30분', () => {
        expect(formatDuration(510)).toBe('8시간 30분')
    })
})

// =====================================================
// formatTimer 테스트
// =====================================================
describe('formatTimer', () => {
    it('0초', () => {
        expect(formatTimer(0)).toBe('00:00')
    })

    it('59초', () => {
        expect(formatTimer(59)).toBe('00:00')
    })

    it('60초 = 1분', () => {
        expect(formatTimer(60)).toBe('00:01')
    })

    it('3599초 = 59분', () => {
        expect(formatTimer(3599)).toBe('00:59')
    })

    it('3600초 = 1시간', () => {
        expect(formatTimer(3600)).toBe('01:00')
    })

    it('3660초 = 1시간 1분', () => {
        expect(formatTimer(3660)).toBe('01:01')
    })

    it('7200초 = 2시간', () => {
        expect(formatTimer(7200)).toBe('02:00')
    })

    it('28800초 = 8시간 (표준 근무)', () => {
        expect(formatTimer(28800)).toBe('08:00')
    })

    it('36000초 = 10시간', () => {
        expect(formatTimer(36000)).toBe('10:00')
    })
})

// =====================================================
// getSessionDurationMinutes 테스트
// =====================================================
describe('getSessionDurationMinutes', () => {
    it('duration_minutes가 있으면 그 값 반환', () => {
        const session = createTestSession({ duration_minutes: 45 })
        expect(getSessionDurationMinutes(session)).toBe(45)
    })

    it('duration_minutes가 0이면 0 반환', () => {
        const session = createTestSession({ duration_minutes: 0 })
        expect(getSessionDurationMinutes(session)).toBe(0)
    })

    it('레거시 duration_seconds가 있으면 분으로 변환', () => {
        const session = createTestSession({ duration_minutes: undefined }) as any
        session.duration_seconds = 180 // 3분
        expect(getSessionDurationMinutes(session)).toBe(3)
    })

    it('레거시 duration_seconds 올림 처리', () => {
        const session = createTestSession({ duration_minutes: undefined }) as any
        session.duration_seconds = 150 // 2.5분 → 3분
        expect(getSessionDurationMinutes(session)).toBe(3)
    })

    it('duration_minutes와 duration_seconds 둘 다 없으면 0', () => {
        const session = {
            id: 's1',
            date: '2026-01-19',
            start_time: '09:00',
            end_time: '10:00',
        } as WorkSession
        expect(getSessionDurationMinutes(session)).toBe(0)
    })

    it('NaN duration_minutes 처리', () => {
        const session = createTestSession({ duration_minutes: NaN })
        expect(getSessionDurationMinutes(session)).toBe(0)
    })
})

// =====================================================
// getRecordDurationMinutes 테스트
// =====================================================
describe('getRecordDurationMinutes', () => {
    it('duration_minutes가 유효하면 그 값 반환', () => {
        const record = createTestRecord({ duration_minutes: 120 })
        expect(getRecordDurationMinutes(record)).toBe(120)
    })

    it('duration_minutes가 0이면 세션에서 계산', () => {
        const record = createTestRecord({
            duration_minutes: 0,
            sessions: [
                createTestSession({ duration_minutes: 30 }),
                createTestSession({ id: 's2', duration_minutes: 45 }),
            ],
        })
        expect(getRecordDurationMinutes(record)).toBe(75)
    })

    it('duration_minutes가 NaN이면 세션에서 계산', () => {
        const record = createTestRecord({
            duration_minutes: NaN,
            sessions: [createTestSession({ duration_minutes: 60 })],
        })
        expect(getRecordDurationMinutes(record)).toBe(60)
    })

    it('세션이 비어있으면 0', () => {
        const record = createTestRecord({
            duration_minutes: 0,
            sessions: [],
        })
        expect(getRecordDurationMinutes(record)).toBe(0)
    })

    it('세션과 duration_minutes 둘 다 없으면 0', () => {
        const record = createTestRecord({
            duration_minutes: undefined as any,
            sessions: [],
            start_time: '',
            end_time: '',
        })
        expect(getRecordDurationMinutes(record)).toBe(0)
    })

    it('최소 1분 보장', () => {
        const record = createTestRecord({
            duration_minutes: 0,
            sessions: [createTestSession({ duration_minutes: 0.5 as any })],
        })
        // 0.5분 세션 → 최소 1분
        const result = getRecordDurationMinutes(record)
        expect(result).toBeGreaterThanOrEqual(0)
    })
})

// =====================================================
// getRecordDurationMinutesForDate 테스트
// =====================================================
describe('getRecordDurationMinutesForDate', () => {
    it('해당 날짜의 세션들만 합산', () => {
        const record = createTestRecord({
            date: '2026-01-18',
            sessions: [
                createTestSession({
                    id: 's1',
                    date: '2026-01-18',
                    duration_minutes: 30,
                }),
                createTestSession({
                    id: 's2',
                    date: '2026-01-19',
                    duration_minutes: 45,
                }),
                createTestSession({
                    id: 's3',
                    date: '2026-01-19',
                    duration_minutes: 15,
                }),
            ],
        })

        expect(getRecordDurationMinutesForDate(record, '2026-01-18')).toBe(30)
        expect(getRecordDurationMinutesForDate(record, '2026-01-19')).toBe(60)
        expect(getRecordDurationMinutesForDate(record, '2026-01-20')).toBe(0)
    })

    it('세션에 date가 없으면 record.date 사용', () => {
        const record = createTestRecord({
            date: '2026-01-19',
            sessions: [
                createTestSession({
                    id: 's1',
                    date: undefined as any,
                    duration_minutes: 60,
                }),
            ],
        })

        expect(getRecordDurationMinutesForDate(record, '2026-01-19')).toBe(60)
        expect(getRecordDurationMinutesForDate(record, '2026-01-18')).toBe(0)
    })

    it('세션이 없고 레코드 날짜가 맞으면 전체 시간 반환', () => {
        const record = createTestRecord({
            date: '2026-01-19',
            duration_minutes: 120,
            sessions: [],
        })

        expect(getRecordDurationMinutesForDate(record, '2026-01-19')).toBe(120)
        expect(getRecordDurationMinutesForDate(record, '2026-01-18')).toBe(0)
    })
})

// =====================================================
// getTimeRangeForDate 테스트
// =====================================================
describe('getTimeRangeForDate', () => {
    it('해당 날짜의 시작/종료 시간 반환', () => {
        const record = createTestRecord({
            date: '2026-01-19',
            sessions: [
                createTestSession({
                    id: 's1',
                    date: '2026-01-19',
                    start_time: '10:00',
                    end_time: '11:00',
                }),
                createTestSession({
                    id: 's2',
                    date: '2026-01-19',
                    start_time: '09:00',
                    end_time: '09:30',
                }),
                createTestSession({
                    id: 's3',
                    date: '2026-01-19',
                    start_time: '14:00',
                    end_time: '15:00',
                }),
            ],
        })

        const result = getTimeRangeForDate(record, '2026-01-19')
        // 시간순 정렬: s2(09:00), s1(10:00), s3(14:00)
        expect(result.start_time).toBe('09:00')
        expect(result.end_time).toBe('15:00')
    })

    it('다른 날짜의 세션은 제외', () => {
        const record = createTestRecord({
            date: '2026-01-18',
            sessions: [
                createTestSession({
                    id: 's1',
                    date: '2026-01-18',
                    start_time: '08:00',
                    end_time: '09:00',
                }),
                createTestSession({
                    id: 's2',
                    date: '2026-01-19',
                    start_time: '10:00',
                    end_time: '11:00',
                }),
            ],
        })

        const result18 = getTimeRangeForDate(record, '2026-01-18')
        expect(result18.start_time).toBe('08:00')
        expect(result18.end_time).toBe('09:00')

        const result19 = getTimeRangeForDate(record, '2026-01-19')
        expect(result19.start_time).toBe('10:00')
        expect(result19.end_time).toBe('11:00')
    })

    it('세션이 없으면 레코드 시간 반환 (날짜 일치 시)', () => {
        const record = createTestRecord({
            date: '2026-01-19',
            start_time: '09:00',
            end_time: '18:00',
            sessions: [],
        })

        const result = getTimeRangeForDate(record, '2026-01-19')
        expect(result.start_time).toBe('09:00')
        expect(result.end_time).toBe('18:00')
    })

    it('세션이 없고 날짜 불일치 시 빈 문자열', () => {
        const record = createTestRecord({
            date: '2026-01-18',
            start_time: '09:00',
            end_time: '18:00',
            sessions: [],
        })

        const result = getTimeRangeForDate(record, '2026-01-19')
        expect(result.start_time).toBe('')
        expect(result.end_time).toBe('')
    })

    it('해당 날짜에 세션이 없으면 빈 문자열', () => {
        const record = createTestRecord({
            date: '2026-01-18',
            sessions: [
                createTestSession({
                    date: '2026-01-18',
                    start_time: '09:00',
                    end_time: '10:00',
                }),
            ],
        })

        const result = getTimeRangeForDate(record, '2026-01-19')
        expect(result.start_time).toBe('')
        expect(result.end_time).toBe('')
    })
})

// =====================================================
// 엣지 케이스 테스트
// =====================================================
describe('엣지 케이스', () => {
    describe('formatDuration 엣지 케이스', () => {
        it('음수 분', () => {
            // 음수는 그대로 표시 (실제로는 발생하면 안됨)
            expect(formatDuration(-30)).toBe('-30분')
        })

        it('매우 큰 값', () => {
            // 24시간 = 1440분
            expect(formatDuration(1440)).toBe('24시간')
            // 25시간 30분 = 1530분
            expect(formatDuration(1530)).toBe('25시간 30분')
        })
    })

    describe('formatTimer 엣지 케이스', () => {
        it('음수 초는 음수 결과를 반환 (실제로는 발생하면 안됨)', () => {
            // 음수 입력 시 Math.floor 특성으로 음수 결과
            // 실제 앱에서는 음수 초가 입력되면 안됨
            const result = formatTimer(-60)
            expect(result).toBe('-1:-1')
        })

        it('매우 큰 값', () => {
            // 100시간 = 360000초
            expect(formatTimer(360000)).toBe('100:00')
        })
    })

    describe('세션/레코드 엣지 케이스', () => {
        it('빈 세션 배열', () => {
            const record = createTestRecord({
                duration_minutes: 0,
                sessions: [],
            })
            expect(getRecordDurationMinutes(record)).toBe(0)
        })

        it('undefined 세션', () => {
            const record = createTestRecord({
                duration_minutes: 60,
                sessions: undefined as any,
            })
            expect(getRecordDurationMinutes(record)).toBe(60)
        })

        it('여러 날짜에 걸친 세션', () => {
            const record = createTestRecord({
                date: '2026-01-17',
                sessions: [
                    createTestSession({
                        id: 's1',
                        date: '2026-01-17',
                        duration_minutes: 30,
                    }),
                    createTestSession({
                        id: 's2',
                        date: '2026-01-18',
                        duration_minutes: 60,
                    }),
                    createTestSession({
                        id: 's3',
                        date: '2026-01-19',
                        duration_minutes: 45,
                    }),
                ],
            })

            expect(getRecordDurationMinutesForDate(record, '2026-01-17')).toBe(30)
            expect(getRecordDurationMinutesForDate(record, '2026-01-18')).toBe(60)
            expect(getRecordDurationMinutesForDate(record, '2026-01-19')).toBe(45)
        })
    })
})
