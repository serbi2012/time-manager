/**
 * 앱 버전 및 변경 내역 관리
 */

// 현재 버전 (package.json과 동기화 필요)
export const CURRENT_VERSION = "1.2.0";

// 변경 타입 정의
export type ChangeType =
    | "feature"      // 새로운 기능
    | "fix"          // 버그 수정
    | "improvement"  // 기존 기능 개선
    | "breaking"     // 호환성이 깨지는 변경
    | "deprecation"  // 기능 지원 중단 예고
    | "security"     // 보안 관련 수정
    | "performance"  // 성능 개선
    | "style"        // UI/스타일 변경
    | "docs";        // 문서 변경

// 변경 항목 인터페이스
export interface ChangeItem {
    type: ChangeType;
    description: string;
}

// 변경 내역 인터페이스
export interface ChangelogEntry {
    version: string;
    date: string;          // YYYY-MM-DD 형식
    title: string;         // 릴리즈 제목
    changes: ChangeItem[];
}

// 변경 타입별 이모지 및 라벨
export const CHANGE_TYPE_CONFIG: Record<ChangeType, { emoji: string; label: string; color: string }> = {
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
        version: "1.2.0",
        date: "2026-01-20",
        title: "PWA 지원 🚀",
        changes: [
            { type: "feature", description: "PWA (Progressive Web App) 지원 - 홈 화면에 추가 가능" },
            { type: "feature", description: "오프라인 캐싱으로 빠른 앱 로딩" },
            { type: "feature", description: "앱 아이콘 및 스플래시 스크린 추가" },
            { type: "improvement", description: "Service Worker를 통한 리소스 캐싱" },
            { type: "style", description: "앱 테마 컬러 및 메타 태그 최적화" },
        ],
    },
    {
        version: "1.1.0",
        date: "2026-01-19",
        title: "모바일 반응형 지원 📱",
        changes: [
            { type: "feature", description: "모바일 반응형 디자인 전면 지원" },
            { type: "feature", description: "모바일 하단 네비게이션 바 추가" },
            { type: "feature", description: "모바일 프리셋 플로팅 버튼 (FAB) 추가" },
            { type: "feature", description: "모바일 작업 기록 카드 뷰 추가" },
            { type: "improvement", description: "간트차트 모바일 수평 스크롤 최적화" },
            { type: "improvement", description: "모바일 버튼 아이콘 중심 미니멀 디자인" },
            { type: "improvement", description: "모바일 카드 여백 및 터치 영역 최적화" },
            { type: "improvement", description: "모바일 헤더 레이아웃 개선" },
            { type: "style", description: "useResponsive 훅으로 반응형 상태 관리" },
        ],
    },
    {
        version: "1.0.0",
        date: "2026-01-19",
        title: "첫 번째 안정 버전 🎉",
        changes: [
            { type: "feature", description: "실시간 타이머 기반 작업 시간 측정" },
            { type: "feature", description: "작업 기록 관리 (추가/수정/삭제/완료)" },
            { type: "feature", description: "작업 프리셋(템플릿) 관리" },
            { type: "feature", description: "일간 간트차트 시각화" },
            { type: "feature", description: "주간 일정 조회 및 복사" },
            { type: "feature", description: "Firebase 클라우드 동기화" },
            { type: "feature", description: "다중 탭 타이머 동기화" },
            { type: "feature", description: "커스텀 단축키 지원" },
            { type: "feature", description: "데이터 내보내기/가져오기 기능" },
            { type: "feature", description: "자동완성 옵션 관리 (숨기기/복원)" },
            { type: "feature", description: "버전 정보 및 업데이트 내역 표시" },
        ],
    },
];

/**
 * 특정 버전의 변경 내역 조회
 */
export function getChangelogByVersion(version: string): ChangelogEntry | undefined {
    return CHANGELOG.find((entry) => entry.version === version);
}

/**
 * 최신 버전의 변경 내역 조회
 */
export function getLatestChangelog(): ChangelogEntry | undefined {
    return CHANGELOG[0];
}
