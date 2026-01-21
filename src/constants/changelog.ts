/**
 * 앱 버전 및 변경 내역 관리
 */

// 현재 버전 (package.json과 동기화 필요)
export const CURRENT_VERSION = "1.2.2";

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
                description: "마크다운 기반 위키 스타일 문서 시스템",
            },
            {
                type: "feature",
                description: "문서 내 검색 기능",
            },
            {
                type: "feature",
                description: "문서 간 위키 링크 (wiki:section-id) 지원",
            },
            {
                type: "feature",
                description:
                    "실제 UI 미리보기 데모 컴포넌트 (작업 테이블, 프리셋 목록 등)",
            },
            {
                type: "feature",
                description: "Mermaid 다이어그램으로 프로세스 시각화",
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
                    "건의사항 상태 관리 (대기/검토중/진행중/완료/반려) - 관리자 전용",
            },
            {
                type: "feature",
                description: "게시글 수정/삭제 기능 (본인 글 또는 관리자)",
            },
            {
                type: "feature",
                description:
                    "비로그인 사용자도 자신의 게시글 수정/삭제 가능 (로컬 ID 기반)",
            },
            {
                type: "improvement",
                description:
                    "모달 제출 버튼 F8 단축키 지원 (글쓰기, 새 작업, 프리셋 추가 등)",
            },
            {
                type: "improvement",
                description:
                    "Popconfirm(삭제 확인 등)에서 엔터키로 바로 확인 가능",
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
            {
                type: "improvement",
                description: "Service Worker를 통한 리소스 캐싱",
            },
            { type: "style", description: "앱 테마 컬러 및 메타 태그 최적화" },
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
                description: "모바일 프리셋 플로팅 버튼 (FAB) 추가",
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
            {
                type: "style",
                description: "useResponsive 훅으로 반응형 상태 관리",
            },
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
