/**
 * 앱 버전 및 변경 내역 관리
 */

// 현재 버전 (package.json과 동기화 필요)
export const CURRENT_VERSION = "2.0.6";

// 변경 타입 정의
export type ChangeType =
    | "feature" // 새로운 기능
    | "fix" // 버그 수정
    | "improvement" // 기존 기능 개선
    | "breaking" // 호환성이 깨지는 변경
    | "deprecation" // 기능 지원 중단 예고
    | "security" // 보안 관련 수정
    | "performance" // 성능 개선
    | "style" // UI/스타일 변경
    | "docs"; // 문서 변경

// 변경 항목 인터페이스
export interface ChangeItem {
    type: ChangeType;
    description: string;
}

// 변경 내역 인터페이스
export interface ChangelogEntry {
    version: string;
    date: string; // YYYY-MM-DD 형식
    title: string; // 릴리즈 제목
    changes: ChangeItem[];
}

// 변경 타입별 이모지 및 라벨
export const CHANGE_TYPE_CONFIG: Record<
    ChangeType,
    { emoji: string; label: string; color: string }
> = {
    feature: { emoji: "✨", label: "새 기능", color: "#52c41a" },
    fix: { emoji: "🐛", label: "버그 수정", color: "#ff4d4f" },
    improvement: { emoji: "💪", label: "개선", color: "#1890ff" },
    breaking: { emoji: "⚠️", label: "주요 변경", color: "#fa8c16" },
    deprecation: { emoji: "📢", label: "지원 중단 예고", color: "#faad14" },
    security: { emoji: "🔒", label: "보안", color: "#722ed1" },
    performance: { emoji: "⚡", label: "성능", color: "#13c2c2" },
    style: { emoji: "🎨", label: "스타일", color: "#eb2f96" },
    docs: { emoji: "📝", label: "문서", color: "#8c8c8c" },
};

// 변경 내역 (최신 버전이 맨 위)
export const CHANGELOG: ChangelogEntry[] = [
    {
        version: "2.0.6",
        date: "2026-01-28",
        title: "세션 추가 및 점심시간 설정",
        changes: [
            {
                type: "feature",
                description: "세션 이력에서 직접 세션을 추가할 수 있음",
            },
            {
                type: "feature",
                description: "설정에서 점심시간을 조정할 수 있음 (기본: 11:40~12:40)",
            },
            {
                type: "fix",
                description:
                    "새 작업/프리셋 추가 시 선택된 날짜 기준으로 추가됨 (기존: 항상 오늘)",
            },
            {
                type: "style",
                description: "설정 모달 UI가 카드 기반으로 모던하게 개선됨",
            },
        ],
    },
    {
        version: "2.0.5",
        date: "2026-01-28",
        title: "날짜 표시 한글화 및 UI 개선",
        changes: [
            {
                type: "style",
                description:
                    "달력 및 날짜 선택기의 요일, 월 이름이 한국어로 표시됨",
            },
            {
                type: "style",
                description:
                    "일간 타임라인 헤더에 연도, 월, 일, 요일이 직관적으로 표시됨",
            },
            {
                type: "improvement",
                description:
                    "날짜 선택 시 요일도 함께 표시되어 날짜 확인이 편리해짐",
            },
        ],
    },
    {
        version: "2.0.4",
        date: "2026-01-26",
        title: "반응형 레이아웃 개선",
        changes: [
            {
                type: "fix",
                description:
                    "태블릿 크기 화면에서 작업 프리셋만 보이던 레이아웃 문제 수정",
            },
            {
                type: "improvement",
                description:
                    "모바일 레이아웃이 실제 스마트폰 크기(480px 이하)에서만 적용되도록 변경",
            },
        ],
    },
    {
        version: "2.0.3",
        date: "2026-01-23",
        title: "녹화 중 시간 조절 자동 조정",
        changes: [
            {
                type: "fix",
                description:
                    "녹화 중인 세션의 시작 시간 조절 시 다른 세션과 충돌하면 자동 조정됨",
            },
        ],
    },
    {
        version: "2.0.2",
        date: "2026-01-23",
        title: "작업 기록 시작 버그 수정",
        changes: [
            {
                type: "fix",
                description:
                    "모바일에서 작업 기록 '시작' 버튼 클릭 시 빈 작업이 생성되던 버그 수정",
            },
        ],
    },
    {
        version: "2.0.1",
        date: "2026-01-23",
        title: "모바일/데스크탑 UI 분리",
        changes: [
            {
                type: "improvement",
                description:
                    "모바일/데스크탑 UI 완전 분리 - 플랫폼별 최적화된 화면 제공",
            },
        ],
    },
    {
        version: "2.0.0",
        date: "2026-01-23",
        title: "동기화 안정성 개선",
        changes: [
            {
                type: "improvement",
                description:
                    "동기화 안정성 대폭 개선 - 변경된 데이터만 저장",
            },
            {
                type: "improvement",
                description:
                    "수동 새로고침 방식으로 변경 - 다중 기기 충돌 방지",
            },
            {
                type: "fix",
                description:
                    "진행 중 세션 중복 생성 문제 해결",
            },
        ],
    },
    {
        version: "1.3.8",
        date: "2026-01-23",
        title: "주간 일정 복사 형식 옵션",
        changes: [
            {
                type: "improvement",
                description:
                    "주간 일정 복사 시 형식 선택 가능 (형식 1: 기존 형식, 형식 2: 구분선 형식)",
            },
        ],
    },
    {
        version: "1.3.7",
        date: "2026-01-23",
        title: "간트차트 시간 충돌 표시",
        changes: [
            {
                type: "feature",
                description:
                    "간트차트에서 시간대가 겹치는 작업 자동 감지 및 시각적 표시",
            },
            {
                type: "style",
                description:
                    "충돌 세션에 빨간색 테두리 및 깜빡임 효과, 경고 아이콘 표시",
            },
            {
                type: "improvement",
                description:
                    "충돌 구간에 빨간색 오버레이 표시 및 '조정이 필요합니다' 안내 툴팁",
            },
            {
                type: "fix",
                description:
                    "타이머 중단 시 세션이 중복 생성되는 버그 수정 (다중 탭 동기화 환경)",
            },
        ],
    },
    {
        version: "1.3.6",
        date: "2026-01-23",
        title: "진행 중 작업 실시간 동기화",
        changes: [
            {
                type: "fix",
                description:
                    "진행 중인 작업이 다른 탭/기기와 실시간 동기화됨 (충돌 문제 해결)",
            },
            {
                type: "improvement",
                description:
                    "진행 중인 세션의 종료 시간은 수정 불가 (종료 후에만 수정 가능)",
            },
        ],
    },
    {
        version: "1.3.5",
        date: "2026-01-23",
        title: "녹화 중 시작 시간 조절",
        changes: [
            {
                type: "feature",
                description:
                    "간트차트에서 녹화 중인 작업의 시작 시간을 드래그로 앞당길 수 있음",
            },
        ],
    },
    {
        version: "1.3.4",
        date: "2026-01-23",
        title: "동기화 안정성 개선",
        changes: [
            {
                type: "fix",
                description:
                    "다중 탭/기기 사용 시 중복 레코드 생성 문제 해결 (자동 병합)",
            },
            {
                type: "improvement",
                description:
                    "앱 시작 및 실시간 동기화 시 중복 레코드 자동 감지 및 병합",
            },
            {
                type: "improvement",
                description: "상단 메뉴에서 마우스 휠 버튼으로 새 탭 열기 지원",
            },
        ],
    },
    {
        version: "1.3.3",
        date: "2026-01-22",
        title: "주간일정 일별 누적시간 계산 개선",
        changes: [
            {
                type: "improvement",
                description:
                    "주간일정 복사 시 일별 누적시간 계산 (해당 날짜까지의 누적시간 표시)",
            },
        ],
    },
    {
        version: "1.3.2",
        date: "2026-01-22",
        title: "테마 색상 및 단축키 커스터마이징",
        changes: [
            {
                type: "feature",
                description:
                    "앱 테마 색상 선택 기능 (7가지 색상: 파란색, 초록색, 보라색, 빨간색, 주황색, 청록색, 검정색)",
            },
            {
                type: "improvement",
                description: "간트차트 0분 세션 경고 표시 제거 (깔끔한 UI)",
            },
            {
                type: "feature",
                description:
                    "단축키 사용자 지정 기능 (설정에서 원하는 키 조합으로 변경 가능)",
            },
            {
                type: "feature",
                description: "모달 저장/추가 단축키 설정 가능 (기본값 F8)",
            },
            {
                type: "style",
                description:
                    "테마 색상이 헤더, 버튼, 태그, 시간 표시 등 전체 UI에 적용",
            },
        ],
    },
    {
        version: "1.3.1",
        date: "2026-01-22",
        title: "간트차트 개선 및 버그 수정",
        changes: [
            {
                type: "improvement",
                description:
                    "간트차트에서 0분/1분 이하 세션도 표시 (최소 너비 보장, 경고 표시)",
            },
            {
                type: "feature",
                description:
                    "간트차트 우클릭 시 팝오버 메뉴 (작업 수정/세션 삭제)",
            },
            {
                type: "improvement",
                description: "충돌 메시지에 작업명, 거래명 정보 표시",
            },
            {
                type: "fix",
                description:
                    "삭제된 레코드(휴지통)가 충돌 감지에 포함되던 버그 수정",
            },
        ],
    },
    {
        version: "1.3.0",
        date: "2026-01-22",
        title: "편의 기능 개선 🔧",
        changes: [
            {
                type: "feature",
                description: "프리셋 추가 시 중복 이름 자동 번호 부여",
            },
            {
                type: "feature",
                description: "작업 이력 선택 삭제 기능",
            },
            {
                type: "improvement",
                description:
                    "완료 시 타이머 자동 중지, 완료된 작업 시작 시 완료 해제",
            },
            {
                type: "improvement",
                description:
                    "프리셋 작업 추가 시 postfix 사용 여부 설정 옵션 추가",
            },
            {
                type: "improvement",
                description: "건의사항 글 다중 열기 지원",
            },
            {
                type: "fix",
                description: "건의사항 페이지 스크롤 버그 수정",
            },
        ],
    },
    {
        version: "1.2.2",
        date: "2026-01-21",
        title: "사용 설명서 검색 개선 🔍",
        changes: [
            {
                type: "improvement",
                description: "검색 결과 클릭 시 해당 키워드 위치로 자동 스크롤",
            },
            {
                type: "improvement",
                description:
                    "검색 키워드 하이라이트 표시 (펄스 애니메이션, 4초 후 자동 해제)",
            },
        ],
    },
    {
        version: "1.2.1",
        date: "2026-01-21",
        title: "간트차트 더블클릭 수정 ✏️",
        changes: [
            {
                type: "feature",
                description: "간트차트 바 더블클릭으로 작업 수정 모달 열기",
            },
            {
                type: "improvement",
                description:
                    "수정 모달에서 프로젝트 코드, 작업명, 거래명, 업무명, 카테고리, 비고 수정 가능",
            },
            {
                type: "improvement",
                description: "Ctrl+Shift+Enter 단축키로 빠른 저장",
            },
            {
                type: "docs",
                description: "사용 설명서에 더블클릭 수정 기능 문서 추가",
            },
        ],
    },
    {
        version: "1.2.0",
        date: "2026-01-21",
        title: "사용 설명서 📖",
        changes: [
            {
                type: "feature",
                description: "사용 설명서 페이지 추가 (/guide)",
            },
            {
                type: "feature",
                description: "문서 내 검색 기능",
            },
            {
                type: "feature",
                description: "문서 간 링크로 쉬운 탐색",
            },
            {
                type: "feature",
                description:
                    "실제 UI 미리보기로 기능 이해 도움",
            },
            {
                type: "docs",
                description:
                    "시작하기, 일간 기록, 작업 프리셋, 주간 일정, 건의사항, 설정, 단축키 문서 작성",
            },
            {
                type: "style",
                description: "이전/다음 페이지 네비게이션 버튼",
            },
        ],
    },
    {
        version: "1.1.0",
        date: "2026-01-21",
        title: "건의사항 게시판 💬",
        changes: [
            {
                type: "feature",
                description: "건의사항 게시판 페이지 추가 (/suggestions)",
            },
            {
                type: "feature",
                description:
                    "건의사항 상태 확인 (대기/검토중/진행중/완료/반려)",
            },
            {
                type: "feature",
                description: "게시글 수정/삭제 기능 (본인 글)",
            },
            {
                type: "feature",
                description:
                    "비로그인 사용자도 자신의 게시글 수정/삭제 가능",
            },
            {
                type: "improvement",
                description:
                    "모달 제출 버튼 F8 단축키 지원 (글쓰기, 새 작업, 프리셋 추가 등)",
            },
            {
                type: "improvement",
                description:
                    "삭제 확인에서 엔터키로 바로 확인 가능",
            },
        ],
    },
    {
        version: "1.0.4",
        date: "2026-01-21",
        title: "간트차트 리사이즈 기능 📊",
        changes: [
            {
                type: "feature",
                description:
                    "간트차트 작업 바 리사이즈 - 좌/우 모서리 드래그로 시간 조절 가능",
            },
            {
                type: "improvement",
                description: "레코딩 중인 작업 시간과 충돌 감지 및 자동 조정",
            },
            {
                type: "improvement",
                description: "리사이즈 중 실시간 시간 표시",
            },
            {
                type: "style",
                description: "리사이즈 핸들 호버 효과 및 시각적 피드백",
            },
        ],
    },
    {
        version: "1.0.3",
        date: "2026-01-21",
        title: "게스트 모드 지원 👤",
        changes: [
            {
                type: "feature",
                description:
                    "게스트 모드 - 로그인 없이 LocalStorage 기반으로 사용 가능",
            },
            {
                type: "feature",
                description:
                    "비로그인 시에도 데이터 가져오기(Import) 기능 사용 가능",
            },
            {
                type: "improvement",
                description: "프리셋 드래그앤드롭으로 순서 변경 가능",
            },
            {
                type: "improvement",
                description:
                    "주간 일정에서 관리업무(A24_05591) 필터링 옵션 추가",
            },
            {
                type: "improvement",
                description: "간트차트 중복 세션 표시 문제 해결",
            },
            {
                type: "fix",
                description:
                    "레코딩 중 작업 수정 시 새 작업 생성되는 버그 수정",
            },
            {
                type: "fix",
                description: "작업 추가 시 간트차트에 즉시 표시되는 버그 수정",
            },
            {
                type: "style",
                description: "헤더에 게스트 모드 / 클라우드 연결 상태 표시",
            },
        ],
    },
    {
        version: "1.0.2",
        date: "2026-01-20",
        title: "PWA 지원 🚀",
        changes: [
            {
                type: "feature",
                description:
                    "PWA (Progressive Web App) 지원 - 홈 화면에 추가 가능",
            },
            { type: "feature", description: "오프라인 캐싱으로 빠른 앱 로딩" },
            {
                type: "feature",
                description: "앱 아이콘 및 스플래시 스크린 추가",
            },
            { type: "style", description: "앱 테마 컬러 최적화" },
        ],
    },
    {
        version: "1.0.1",
        date: "2026-01-19",
        title: "모바일 반응형 지원 📱",
        changes: [
            { type: "feature", description: "모바일 반응형 디자인 전면 지원" },
            { type: "feature", description: "모바일 하단 네비게이션 바 추가" },
            {
                type: "feature",
                description: "모바일 프리셋 플로팅 버튼 추가",
            },
            { type: "feature", description: "모바일 작업 기록 카드 뷰 추가" },
            {
                type: "improvement",
                description: "간트차트 모바일 수평 스크롤 최적화",
            },
            {
                type: "improvement",
                description: "모바일 버튼 아이콘 중심 미니멀 디자인",
            },
            {
                type: "improvement",
                description: "모바일 카드 여백 및 터치 영역 최적화",
            },
            { type: "improvement", description: "모바일 헤더 레이아웃 개선" },
        ],
    },
    {
        version: "1.0.0",
        date: "2026-01-19",
        title: "첫 번째 안정 버전 🎉",
        changes: [
            {
                type: "feature",
                description: "실시간 타이머 기반 작업 시간 측정",
            },
            {
                type: "feature",
                description: "작업 기록 관리 (추가/수정/삭제/완료)",
            },
            { type: "feature", description: "작업 프리셋(템플릿) 관리" },
            { type: "feature", description: "일간 간트차트 시각화" },
            { type: "feature", description: "주간 일정 조회 및 복사" },
            { type: "feature", description: "Firebase 클라우드 동기화" },
            { type: "feature", description: "다중 탭 타이머 동기화" },
            { type: "feature", description: "커스텀 단축키 지원" },
            { type: "feature", description: "데이터 내보내기/가져오기 기능" },
            {
                type: "feature",
                description: "자동완성 옵션 관리 (숨기기/복원)",
            },
            { type: "feature", description: "버전 정보 및 업데이트 내역 표시" },
        ],
    },
];

/**
 * 특정 버전의 변경 내역 조회
 */
export function getChangelogByVersion(
    version: string
): ChangelogEntry | undefined {
    return CHANGELOG.find((entry) => entry.version === version);
}

/**
 * 최신 버전의 변경 내역 조회
 */
export function getLatestChangelog(): ChangelogEntry | undefined {
    return CHANGELOG[0];
}
