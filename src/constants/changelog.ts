/**
 * 앱 버전 및 변경 내역 관리
 */

// 현재 버전 (package.json과 동기화 필요)
export const CURRENT_VERSION = "2.0.36";

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
        version: "2.0.36",
        date: "2026-03-05",
        title: "모바일 롱프레스 상호작용 대폭 확장",
        changes: [
            {
                type: "feature",
                description:
                    "간트 차트 작업 카드를 길게 눌러 수정·타이머 시작·삭제할 수 있어요",
            },
            {
                type: "feature",
                description:
                    "간트 차트 시간 바를 길게 눌러 세션을 수정하거나 삭제할 수 있어요",
            },
            {
                type: "feature",
                description:
                    "프리셋 카드를 길게 눌러 바로 시작·수정·삭제할 수 있어요",
            },
            {
                type: "feature",
                description:
                    "주간 일정에서 날짜 카드를 길게 눌러 해당 날짜를 복사하거나 일간 기록으로 이동할 수 있어요",
            },
            {
                type: "feature",
                description:
                    "플로팅 버튼을 길게 눌러 최근 작업을 빠르게 시작할 수 있어요",
            },
            {
                type: "feature",
                description:
                    "날짜 표시를 길게 눌러 달력에서 바로 날짜를 선택할 수 있어요",
            },
            {
                type: "fix",
                description:
                    "모바일 컨텍스트 메뉴가 다른 요소 위에 정상적으로 표시돼요",
            },
        ],
    },
    {
        version: "2.0.35",
        date: "2026-03-05",
        title: "모바일 날짜 이동 애니메이션 & 안정성 개선",
        changes: [
            {
                type: "style",
                description:
                    "모바일에서 날짜 이동 시 슬라이드 애니메이션이 적용돼요",
            },
            {
                type: "improvement",
                description:
                    "모바일 날짜 화살표 버튼에 눌림 효과가 추가됐어요",
            },
            {
                type: "feature",
                description:
                    "사용설명서에 다이어그램이 추가됐어요",
            },
            {
                type: "improvement",
                description:
                    "새 버전이 배포되면 자동으로 업데이트돼요",
            },
            {
                type: "performance",
                description:
                    "설정, 변경내역 등 모달이 필요할 때만 불러와요",
            },
            {
                type: "fix",
                description:
                    "주간 캘린더 좌우 여백이 부족하던 문제를 수정했어요",
            },
        ],
    },
    {
        version: "2.0.34",
        date: "2026-03-05",
        title: "프리셋 순서 저장 수정",
        changes: [
            {
                type: "fix",
                description:
                    "프리셋 순서를 드래그앤드롭으로 변경한 후 새로고침하면 원래대로 돌아가는 문제를 수정했어요",
            },
        ],
    },
    {
        version: "2.0.33",
        date: "2026-03-04",
        title: "성능 최적화",
        changes: [
            {
                type: "performance",
                description:
                    "페이지 초기 로딩 속도가 크게 빨라졌어요 (번들 87% 감소)",
            },
            {
                type: "performance",
                description:
                    "타이머 실행 중 화면이 더 부드럽게 동작해요",
            },
        ],
    },
    {
        version: "2.0.32",
        date: "2026-03-03",
        title: "완료된 작업 재시작 시 자동 완료 해제",
        changes: [
            {
                type: "improvement",
                description:
                    "완료된 작업의 녹화 버튼을 누르면 완료 상태가 자동으로 풀려요",
            },
        ],
    },
    {
        version: "2.0.31",
        date: "2026-03-03",
        title: "페이지 이동 및 콘텐츠 전환 애니메이션",
        changes: [
            {
                type: "feature",
                description:
                    "메뉴 이동 시 방향에 따라 슬라이드 애니메이션이 적용돼요",
            },
            {
                type: "improvement",
                description:
                    "주간 일정 진입 시 카드가 순차적으로 나타나요",
            },
            {
                type: "improvement",
                description:
                    "사용설명서 섹션 변경 시 부드러운 슬라이드업 전환이 적용돼요",
            },
        ],
    },
    {
        version: "2.0.30",
        date: "2026-03-03",
        title: "모바일 롱프레스 메뉴 사용성 개선",
        changes: [
            {
                type: "improvement",
                description:
                    "길게 눌러 열린 메뉴가 스크롤하면 자동으로 닫혀요",
            },
            {
                type: "improvement",
                description:
                    "작업을 길게 누를 때 짧은 진동으로 알려줘요 (Android)",
            },
        ],
    },
    {
        version: "2.0.29",
        date: "2026-03-03",
        title: "간트 차트 바 조작성 개선 및 캘린더 버그 수정",
        changes: [
            {
                type: "fix",
                description:
                    "타이머 실행 중 날짜 네비게이션 캘린더에서 다른 월로 이동해도 원래대로 돌아오지 않아요",
            },
            {
                type: "improvement",
                description:
                    "간트 차트에서 짧은 작업의 바가 실제 시간에 더 가깝게 표시돼요",
            },
            {
                type: "improvement",
                description:
                    "간트 차트에서 좁은 바도 클릭 위치에 따라 시작·종료 시간을 쉽게 조절할 수 있어요",
            },
        ],
    },
    {
        version: "2.0.28",
        date: "2026-02-27",
        title: "점심시간 설정이 전체 시간 계산에 반영",
        changes: [
            {
                type: "fix",
                description:
                    "설정에서 변경한 점심시간이 타이머 종료 시 시간 계산에 반영돼요",
            },
            {
                type: "fix",
                description:
                    "내역 복사 시 설정한 점심시간 기준으로 시간이 계산돼요",
            },
            {
                type: "improvement",
                description:
                    "간트 차트뿐 아니라 모든 시간 계산이 사용자 점심시간 설정과 일치해요",
            },
        ],
    },
    {
        version: "2.0.27",
        date: "2026-02-25",
        title: "작업 기록 푸터 버튼 인터랙션 개선",
        changes: [
            {
                type: "style",
                description:
                    "완료 목록·휴지통·내역 복사 버튼이 더 직관적으로 바뀌었어요",
            },
            {
                type: "improvement",
                description:
                    "버튼에 마우스를 올리면 애니메이션으로 클릭 가능함을 알려줘요",
            },
        ],
    },
    {
        version: "2.0.26",
        date: "2026-02-25",
        title: "간트차트 & 작업 기록 편의성 개선",
        changes: [
            {
                type: "improvement",
                description:
                    "간트차트 작업 라벨에 마우스를 올리면 전체 이름을 확인할 수 있어요",
            },
            {
                type: "improvement",
                description:
                    "마크다운 복사 시 작업명 기준으로 정렬되어 보기 좋아졌어요",
            },
            {
                type: "improvement",
                description:
                    "날짜 이동 후 '오늘' 버튼을 눌러 바로 오늘로 돌아올 수 있어요",
            },
        ],
    },
    {
        version: "2.0.25",
        date: "2026-02-24",
        title: "데스크탑 헤더 리디자인 & 앱 이름 변경",
        changes: [
            {
                type: "style",
                description:
                    "데스크탑 상단 메뉴가 깔끔하고 모던한 디자인으로 바뀌었어요",
            },
            {
                type: "improvement",
                description:
                    "메뉴 전환 시 부드러운 슬라이딩 애니메이션이 추가됐어요",
            },
            {
                type: "improvement",
                description: "앱 이름이 '업무 관리'로 변경됐어요",
            },
        ],
    },
    {
        version: "2.0.24",
        date: "2026-02-23",
        title: "주간 일정 관리업무 필터 기본값 변경",
        changes: [
            {
                type: "improvement",
                description:
                    "주간 일정에서 관리업무 제외가 기본값으로 설정돼요",
            },
        ],
    },
    {
        version: "2.0.23",
        date: "2026-02-23",
        title: "주간 일정 누적시간 수정",
        changes: [
            {
                type: "fix",
                description:
                    "주간 일정의 누적시간이 전체 기간 기준으로 정확하게 표시돼요",
            },
        ],
    },
    {
        version: "2.0.22",
        date: "2026-02-20",
        title: "커서 트래킹 효과 & 설정 토글",
        changes: [
            {
                type: "feature",
                description:
                    "카드, 버튼 등에 커서를 따라다니는 은은한 인터랙션 효과가 추가됐어요",
            },
            {
                type: "feature",
                description:
                    "설정 > 애니메이션에서 커서 인터랙션 효과를 끄고 킬 수 있어요",
            },
        ],
    },
    {
        version: "2.0.21",
        date: "2026-02-19",
        title: "간트 차트 동기화 수정 & 날짜 네비게이션 개선",
        changes: [
            {
                type: "fix",
                description:
                    "내역 복사 시 해당 날짜의 작업 시간만 정확히 복사돼요",
            },
            {
                type: "fix",
                description:
                    "간트 차트에서 현재 시간 표시와 진행 중인 작업 바가 정확히 일치해요",
            },
            {
                type: "fix",
                description: "날짜 영역 어디를 클릭해도 달력이 열려요",
            },
            {
                type: "style",
                description:
                    "날짜 네비게이션이 더 세련된 디자인으로 바뀌었어요",
            },
            {
                type: "improvement",
                description:
                    "날짜 영역에 마우스를 올리면 빛이 따라오는 인터랙션이 추가됐어요",
            },
        ],
    },
    {
        version: "2.0.20",
        date: "2026-02-12",
        title: "모바일 롱프레스 수정 & 카드 레이아웃 개선",
        changes: [
            {
                type: "feature",
                description:
                    "작업을 길게 눌러 수정·완료·삭제 메뉴를 열 수 있어요",
            },
            {
                type: "feature",
                description: "진행 중인 타이머도 길게 눌러 수정할 수 있어요",
            },
            {
                type: "style",
                description: "완료된 작업에 체크 표시와 뮤트 스타일이 적용돼요",
            },
            {
                type: "style",
                description: "각 작업이 독립 카드로 표시되어 구분이 쉬워졌어요",
            },
            {
                type: "style",
                description:
                    "길게 누를 때 물방울 같은 탄력 애니메이션이 재생돼요",
            },
        ],
    },
    {
        version: "2.0.19",
        date: "2026-02-11",
        title: "모바일 UI 전체 다듬기",
        changes: [
            {
                type: "style",
                description:
                    "모바일 전체 배경색 통일 — 헤더와 콘텐츠 사이 색상 차이 제거",
            },
            {
                type: "feature",
                description:
                    "날짜 이동 바 추가 — 좌/우 화살표로 하루씩 빠르게 이동 가능",
            },
            {
                type: "style",
                description:
                    "모바일 UI 크기 확대 — 캘린더, 타이머, 작업 목록 등 전체적으로 더 크고 읽기 쉽게 개선",
            },
            {
                type: "style",
                description:
                    "주간 일정 모바일 디자인 개편 — 깔끔한 헤더, 주간 네비게이션, 필터 버튼 개선",
            },
            {
                type: "style",
                description:
                    "사용설명서 모바일 디자인 개편 — 검색 바 개선, 메뉴를 칩 스타일로 변경",
            },
        ],
    },
    {
        version: "2.0.18",
        date: "2026-02-11",
        title: "모바일 작업 기록 전면 리디자인",
        changes: [
            {
                type: "style",
                description:
                    "모바일 작업 기록 화면이 카드 리스트 디자인으로 전면 개편됨",
            },
            {
                type: "feature",
                description:
                    "주간 캘린더 스트립 추가 — 날짜 탭으로 빠르게 이동 가능",
            },
            {
                type: "feature",
                description:
                    "스피드 다이얼 플로팅 버튼 — 새 작업 추가와 프리셋을 한 곳에서 사용",
            },
            {
                type: "feature",
                description:
                    "스와이프 액션 — 작업 카드를 왼쪽으로 밀어 완료/삭제 가능",
            },
            {
                type: "improvement",
                description:
                    "완료된 작업이 작업 목록에 체크 아이콘과 취소선으로 표시됨",
            },
            {
                type: "style",
                description:
                    "다양한 모바일 전용 애니메이션 적용 (입장 효과, 슬라이드 전환, 숫자 카운트업 등)",
            },
        ],
    },
    {
        version: "2.0.17",
        date: "2026-02-11",
        title: "모바일 타임라인 재설계",
        changes: [
            {
                type: "style",
                description:
                    "모바일 일간 타임라인이 세그먼트 바 + 카드 리스트 디자인으로 전면 개선됨",
            },
            {
                type: "feature",
                description:
                    "모바일 타임라인 작업 목록 접기/펼치기 기능 추가 (설정 동기화 지원)",
            },
            {
                type: "improvement",
                description: "모바일에서 세션 시간 칩을 탭하여 바로 수정 가능",
            },
        ],
    },
    {
        version: "2.0.16",
        date: "2026-02-10",
        title: "UI 리디자인",
        changes: [
            {
                type: "style",
                description: "전체 UI가 더 깔끔하고 현대적인 디자인으로 개선됨",
            },
            {
                type: "improvement",
                description:
                    "간트차트에 현재 시간 표시기와 점심시간 오버레이 추가",
            },
            {
                type: "improvement",
                description:
                    "간트차트 상단에 날짜 탐색 헤더 추가 (화살표로 이전/다음 날 이동)",
            },
            {
                type: "style",
                description:
                    "작업 기록 카테고리, 날짜, 시간 컬럼의 시각적 표현 개선",
            },
            {
                type: "style",
                description:
                    "프리셋 카드가 더 간결하고 보기 좋은 디자인으로 변경됨",
            },
            {
                type: "style",
                description: "설정 화면이 카드 기반 섹션 구조로 개선됨",
            },
        ],
    },
    {
        version: "2.0.15",
        date: "2026-02-02",
        title: "페이지 트랜지션 효과",
        changes: [
            {
                type: "feature",
                description:
                    "페이지 진입 시 UI 요소들이 부드럽게 나타나는 트랜지션 효과 추가",
            },
            {
                type: "feature",
                description:
                    "설정에서 트랜지션 효과 활성화/비활성화 및 속도 조절 가능",
            },
        ],
    },
    {
        version: "2.0.13",
        date: "2026-01-30",
        title: "수정 모달에서 세션 시간 수정",
        changes: [
            {
                type: "feature",
                description:
                    "간트차트에서 세션 더블클릭 시 시작/종료 시간도 수정 가능",
            },
            {
                type: "improvement",
                description:
                    "시간 수정 시 다른 세션과의 충돌 자동 감지 및 경고",
            },
        ],
    },
    {
        version: "2.0.12",
        date: "2026-01-29",
        title: "간트차트 실시간 업데이트",
        changes: [
            {
                type: "improvement",
                description:
                    "간트차트에서 레코딩 중인 작업의 바가 실시간으로 길어짐",
            },
        ],
    },
    {
        version: "2.0.11",
        date: "2026-01-29",
        title: "자동완성 검색 개선",
        changes: [
            {
                type: "feature",
                description:
                    "간트차트에서 드래그로 추가 시 오늘의 기존 작업에 세션 추가 가능",
            },
            {
                type: "improvement",
                description:
                    "자동완성에서 부분 검색(Like 검색) 지원 및 검색어 하이라이트",
            },
            {
                type: "improvement",
                description:
                    "같은 프로젝트 코드의 다른 작업명을 개별 선택 가능",
            },
            {
                type: "improvement",
                description: "버튼에 설정된 단축키가 동적으로 표시됨",
            },
            {
                type: "performance",
                description: "자동완성 검색 시 성능 최적화 (디바운스 적용)",
            },
            {
                type: "fix",
                description:
                    "자동완성 옵션 숨김 시 즉시 반영되지 않던 문제 수정",
            },
        ],
    },
    {
        version: "2.0.9",
        date: "2026-01-28",
        title: "모바일 UI 개선",
        changes: [
            {
                type: "style",
                description: "모바일 설정 화면이 더 보기 좋게 개선됨",
            },
            {
                type: "improvement",
                description: "모바일에서 프리셋 수정/삭제 버튼이 항상 표시됨",
            },
            {
                type: "improvement",
                description: "모바일에서 날짜 선택 UI가 개선됨",
            },
        ],
    },
    {
        version: "2.0.8",
        date: "2026-01-28",
        title: "모바일 헤더 개선",
        changes: [
            {
                type: "improvement",
                description:
                    "헤더의 '업무 시간 관리' 클릭 시 일간 기록으로 이동",
            },
            {
                type: "style",
                description: "모바일 헤더에 현재 페이지명과 오늘 날짜가 표시됨",
            },
        ],
    },
    {
        version: "2.0.7",
        date: "2026-01-28",
        title: "간트차트 드래그 개선 및 UI 개선",
        changes: [
            {
                type: "improvement",
                description:
                    "간트차트에서 드래그 중 영역을 벗어나도 드래그 상태가 유지됨",
            },
            {
                type: "feature",
                description:
                    "날짜 선택기 좌우에 화살표 버튼 추가로 어제/내일 빠른 이동 가능",
            },
            {
                type: "style",
                description:
                    "작업 기록 헤더 버튼들의 디자인 개선 (Tooltip 추가, 단축키 뱃지 스타일)",
            },
        ],
    },
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
                description:
                    "설정에서 점심시간을 조정할 수 있음 (기본: 11:40~12:40)",
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
                description: "동기화 안정성 대폭 개선 - 변경된 데이터만 저장",
            },
            {
                type: "improvement",
                description:
                    "수동 새로고침 방식으로 변경 - 다중 기기 충돌 방지",
            },
            {
                type: "fix",
                description: "진행 중 세션 중복 생성 문제 해결",
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
                description: "실제 UI 미리보기로 기능 이해 도움",
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
                description: "비로그인 사용자도 자신의 게시글 수정/삭제 가능",
            },
            {
                type: "improvement",
                description:
                    "모달 제출 버튼 F8 단축키 지원 (글쓰기, 새 작업, 프리셋 추가 등)",
            },
            {
                type: "improvement",
                description: "삭제 확인에서 엔터키로 바로 확인 가능",
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
