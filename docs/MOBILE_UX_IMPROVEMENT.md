# 모바일 UI/UX 개선 계획

**작성일**: 2026-02-05  
**Phase**: 10 (Phase 9 플랫폼 분리 완료 후)

---

## 목차

1. [현황 분석](#현황-분석)
2. [핵심 문제점](#핵심-문제점)
3. [개선 방향](#개선-방향)
4. [우선순위별 개선 계획](#우선순위별-개선-계획)
5. [상세 개선 방안](#상세-개선-방안)
6. [기대 효과](#기대-효과)

---

## 현황 분석

### 현재 모바일 컴포넌트 구조

Phase 9 완료 후, 다음 컴포넌트들이 모바일 전용으로 분리되었습니다:

```
src/
├── app/layouts/
│   └── MobileLayout.tsx                     # 레이아웃
├── widgets/
│   ├── Header/MobileHeader.tsx              # 헤더
│   └── Navigation/
│       ├── MobileBottomNav.tsx              # 하단 네비게이션
│       └── MobilePresetDrawer.tsx           # 프리셋 드로어
├── features/
│   ├── gantt-chart/ui/DailyGanttChart/
│   │   └── MobileDailyGanttChart.tsx        # 간트 차트
│   ├── work-record/ui/
│   │   ├── Mobile/MobileWorkRecordTable.tsx # 작업 기록 테이블
│   │   └── MobileRecordCard/                # 작업 카드 (미사용?)
│   ├── work-template/ui/Mobile/
│   │   └── MobileWorkTemplateList.tsx       # 작업 템플릿
│   ├── weekly-schedule/ui/Mobile/
│   │   ├── MobileWeeklySchedule.tsx         # 주간 일정
│   │   └── MobileWeeklyHeader.tsx           # 주간 헤더
│   ├── settings/ui/Mobile/
│   │   └── MobileSettingsModal.tsx          # 설정 모달
│   ├── suggestion/ui/Mobile/
│   │   └── MobileSuggestionBoard.tsx        # 건의사항
│   └── guide/ui/
│       ├── Mobile/MobileGuideBook.tsx       # 설명서
│       └── MobileSidebar/MobileSidebar.tsx  # 모바일 사이드바
└── pages/
    └── DailyPage/MobileDailyPage.tsx        # 일간 페이지
```

### 현재 UI 특징

#### ✅ 잘 되어 있는 부분

1. **하단 네비게이션**

    - 4개 메뉴 (일간/주간/건의/설명서)
    - 명확한 아이콘 + 레이블
    - 현재 위치 강조

2. **헤더 정보**

    - 현재 페이지 표시
    - 오늘 날짜 표시
    - 동기화 상태 표시

3. **플랫폼 분리**
    - Desktop/Mobile 완전 분리
    - 플랫폼별 최적화 가능

#### ⚠️ 개선이 필요한 부분

1. **터치 영역 부족**

    - 버튼, 아이콘 크기 작음
    - 최소 44x44px 미충족

2. **스크롤 및 제스처 미흡**

    - Pull-to-refresh 없음
    - Swipe 네비게이션 없음
    - 무한 스크롤 없음

3. **시각적 피드백 부족**

    - 터치 피드백 약함
    - 로딩 상태 불명확
    - 에러 처리 미흡

4. **공간 활용 비효율**

    - 데스크탑 UI를 축소한 형태
    - 모바일 맞춤 레이아웃 부족
    - 여백 과다/부족

5. **입력 편의성 낮음**
    - 긴 폼
    - 키보드 대응 미흡
    - 자동완성 미흡

---

## 핵심 문제점

### 1. 터치 타겟 크기 미달 (심각)

**현황:**

-   버튼/아이콘 크기: 32px 이하
-   iOS/Android 권장: 최소 44x44px

**영향:**

-   오터치 발생
-   사용자 피로도 증가
-   접근성 저하

**예시 (현재 코드):**

```tsx
// ❌ WorkRecordTable 버튼: 32px (too small)
<Button icon={<PlusOutlined />} />

// ❌ BottomNav 높이: 60px 미만
.mobile-bottom-nav { height: 56px; }
```

---

### 2. 간트 차트 조작 어려움 (심각)

**현황:**

-   드래그/리사이즈 정밀도 요구
-   작은 핸들, 좁은 바
-   세션 편집 힘듦

**영향:**

-   핵심 기능 사용 어려움
-   데스크탑 대비 생산성 저하

**문제점:**

```tsx
// ❌ 리사이즈 핸들: 8px (너무 작음)
.gantt-bar-resize-handle { width: 8px; }

// ❌ 바 높이: 32px (터치하기 작음)
.gantt-bar { height: 32px; }
```

---

### 3. 스크롤 및 제스처 미지원 (중요)

**미지원 제스처:**

-   Pull-to-refresh (새로고침)
-   Swipe-to-navigate (페이지 전환)
-   Swipe-to-delete (삭제)
-   Long-press menu (컨텍스트 메뉴)

**영향:**

-   모바일 네이티브 UX 부족
-   학습 곡선 높음

---

### 4. 작업 기록 테이블 가독성 낮음 (중요)

**현황:**

-   데스크탑 테이블을 그대로 축소
-   8개 컬럼 (딜명/작업명/할일/카테고리/시간/시간대/날짜/액션)
-   작은 화면에 과다한 정보

**영향:**

-   가로 스크롤 필요
-   정보 파악 어려움

**개선 필요:**

```tsx
// ❌ 현재: 8개 컬럼을 작은 화면에 표시
<Table columns={columns} dataSource={records} />

// ✅ 목표: 카드 UI로 전환
<List dataSource={records} renderItem={(r) => <RecordCard {...r} />} />
```

---

### 5. 모달/폼 입력 불편 (중요)

**현황:**

-   긴 세로 스크롤 폼
-   키보드 올라오면 버튼 가림
-   Stepper 없음

**영향:**

-   데이터 입력 피로
-   오입력 증가

---

### 6. 로딩/에러 피드백 부족 (보통)

**현황:**

-   Spinner만 표시
-   에러 메시지 토스트로만
-   재시도 버튼 없음

**영향:**

-   대기 시간 불안
-   에러 복구 어려움

---

### 7. 오프라인 대응 미흡 (보통)

**현황:**

-   오프라인 상태 감지 미흡
-   로컬 저장 후 동기화 불명확

**영향:**

-   네트워크 불안정 시 데이터 손실 우려

---

### 8. 주간 일정 정보 밀도 과다 (보통)

**현황:**

-   7일 × 24시간 그리드
-   작은 화면에 과다한 정보

**개선 필요:**

-   일별 스와이프 뷰
-   요약 정보만 표시

---

### 9. 설정 모달 탭 접근성 (낮음)

**현황:**

-   상단 탭 5개 (테마/애니메이션/데이터/자동완성/단축키)
-   작은 터치 영역

**개선 필요:**

-   탭 크기 확대
-   아이콘만 표시 옵션

---

## 개선 방향

### 디자인 원칙

#### 1. **Thumb-Friendly Design** (엄지 친화)

-   하단 액션 배치
-   큰 터치 타겟 (최소 44x44px)
-   리치 가능 영역 우선

#### 2. **Progressive Disclosure** (점진적 노출)

-   핵심 정보만 먼저 표시
-   상세 정보는 탭/확장으로
-   빈 상태 가이드

#### 3. **Native Gestures** (네이티브 제스처)

-   Pull-to-refresh
-   Swipe actions
-   Long-press menu
-   Pinch-to-zoom (간트 차트)

#### 4. **Responsive Feedback** (즉각적 피드백)

-   터치 ripple 효과
-   로딩 스켈레톤
-   낙관적 업데이트

#### 5. **Offline-First** (오프라인 우선)

-   로컬 저장 우선
-   백그라운드 동기화
-   충돌 해결 UI

---

## 우선순위별 개선 계획

### 🔴 Priority 1 - Critical (즉시 개선)

#### 1.1 터치 타겟 크기 확대

**대상:**

-   모든 버튼 (최소 44x44px)
-   하단 네비게이션 (60px → 72px)
-   간트 차트 리사이즈 핸들 (8px → 16px)
-   테이블 액션 버튼

**작업량:** 2-3일  
**영향도:** ⭐⭐⭐⭐⭐ (사용성 대폭 개선)

---

#### 1.2 작업 기록 테이블 → 카드 UI 전환

**변경사항:**

-   Table → List + Card
-   핵심 정보만 표시 (딜명/작업명/시간)
-   확장 시 상세 정보
-   Swipe-to-delete

**작업량:** 3-5일  
**영향도:** ⭐⭐⭐⭐⭐ (모바일 UX 핵심)

---

#### 1.3 간트 차트 터치 최적화

**변경사항:**

-   바 높이 확대 (32px → 44px)
-   리사이즈 핸들 확대 (8px → 16px)
-   터치 피드백 강화
-   롱프레스 컨텍스트 메뉴

**작업량:** 3-4일  
**영향도:** ⭐⭐⭐⭐⭐ (핵심 기능 개선)

---

### 🟡 Priority 2 - Important (1-2주 내)

#### 2.1 Pull-to-Refresh 구현

**대상 페이지:**

-   일간 페이지
-   주간 페이지
-   건의사항

**작업량:** 2-3일  
**영향도:** ⭐⭐⭐⭐ (네이티브 UX)

---

#### 2.2 작업 추가/수정 모달 개선

**변경사항:**

-   Step Wizard 적용 (기본 정보 → 시간 → 추가 정보)
-   키보드 대응 개선
-   하단 고정 액션 버튼

**작업량:** 4-5일  
**영향도:** ⭐⭐⭐⭐ (입력 편의성)

---

#### 2.3 로딩/에러 스켈레톤 UI

**변경사항:**

-   Spinner → Skeleton Loader
-   에러 상태 전용 UI (재시도 버튼)
-   낙관적 업데이트

**작업량:** 2-3일  
**영향도:** ⭐⭐⭐⭐ (피드백 개선)

---

#### 2.4 하단 시트(Bottom Sheet) 도입

**대상:**

-   작업 선택 (프리셋)
-   필터링 옵션
-   컨텍스트 메뉴

**작업량:** 3-4일  
**영향도:** ⭐⭐⭐⭐ (모바일 UX)

---

### 🟢 Priority 3 - Nice to Have (1개월 내)

#### 3.1 주간 일정 스와이프 뷰

**변경사항:**

-   7일 그리드 → 일별 스와이프
-   Swiper.js 또는 Framer Motion

**작업량:** 4-5일  
**영향도:** ⭐⭐⭐ (공간 활용)

---

#### 3.2 오프라인 모드 강화

**변경사항:**

-   오프라인 감지 배너
-   동기화 대기열 표시
-   충돌 해결 UI

**작업량:** 5-7일  
**영향도:** ⭐⭐⭐ (안정성)

---

#### 3.3 햅틱 피드백

**대상:**

-   버튼 클릭
-   간트 차트 스냅
-   삭제 확인

**작업량:** 1-2일  
**영향도:** ⭐⭐⭐ (촉각 피드백)

---

#### 3.4 다크 모드 최적화

**변경사항:**

-   모바일 화면 밝기 고려
-   OLED 최적화 (Pure Black)
-   자동 전환 (시간대)

**작업량:** 2-3일  
**영향도:** ⭐⭐⭐ (야간 사용)

---

#### 3.5 검색/필터 개선

**변경사항:**

-   상단 검색바 고정
-   빠른 필터 칩
-   최근 검색어

**작업량:** 3-4일  
**영향도:** ⭐⭐⭐ (탐색 개선)

---

## 상세 개선 방안

### 1. 작업 기록 카드 UI (Priority 1.2)

#### Before (현재)

```tsx
// ❌ 테이블 형태 - 8개 컬럼, 가로 스크롤 필요
<Table
  columns={[
    { title: "딜명", dataIndex: "deal_name" },
    { title: "작업명", dataIndex: "work_name" },
    { title: "할일", dataIndex: "task_name" },
    { title: "카테고리", dataIndex: "category_name" },
    { title: "시간", dataIndex: "duration_minutes" },
    { title: "시간대", ... },
    { title: "날짜", ... },
    { title: "", ... }, // 액션
  ]}
  dataSource={records}
/>
```

#### After (개선)

```tsx
// ✅ 카드 리스트 - 핵심 정보만 표시
<List
    dataSource={records}
    renderItem={(record) => (
        <SwipeAction
            right={[
                { text: "편집", color: "blue", onPress: () => onEdit(record) },
                { text: "삭제", color: "red", onPress: () => onDelete(record) },
            ]}
        >
            <Card className="record-card">
                {/* 상단: 타이머 + 딜명/작업명 */}
                <div className="record-card-header">
                    <Button
                        icon={<ClockCircleOutlined />}
                        shape="circle"
                        size="large" // 48px
                        onClick={() => onToggleTimer(record)}
                    />
                    <div className="record-card-title">
                        <Text strong>
                            {record.deal_name || record.work_name}
                        </Text>
                        <Text type="secondary" size="small">
                            {record.work_name}
                        </Text>
                    </div>
                </div>

                {/* 중단: 시간 + 카테고리 */}
                <div className="record-card-meta">
                    <Tag icon={<ClockCircleOutlined />}>
                        {record.duration_minutes}분
                    </Tag>
                    {record.category_name && (
                        <Tag color="blue">{record.category_name}</Tag>
                    )}
                </div>

                {/* 하단: 시간대 (확장 시만 표시) */}
                {expanded && (
                    <div className="record-card-details">
                        <Text type="secondary">
                            {formatTimeRange(record.sessions)}
                        </Text>
                        {record.note && <Text>{record.note}</Text>}
                    </div>
                )}
            </Card>
        </SwipeAction>
    )}
/>
```

**구현 디테일:**

1. **카드 높이**

    - 최소 높이: 88px (버튼 48px + 패딩)
    - 확장 시: auto

2. **Swipe Actions**

    - 좌측 스와이프: 편집 (파란색)
    - 우측 스와이프: 삭제 (빨간색)
    - 라이브러리: `react-swipeable` 또는 직접 구현

3. **터치 피드백**

    - 카드 탭: `active:bg-gray-100` ripple
    - 버튼 탭: Material Design ripple

4. **로딩 스켈레톤**
    ```tsx
    {
        loading && <Skeleton.List count={5} height={88} animation="wave" />;
    }
    ```

---

### 2. 간트 차트 터치 최적화 (Priority 1.3)

#### 개선 사항

##### 2.1 바 크기 확대

```tsx
// Before
const BAR_HEIGHT = 32; // ❌ 작음
const RESIZE_HANDLE_WIDTH = 8; // ❌ 터치 불가

// After
const MOBILE_BAR_HEIGHT = 48; // ✅ 터치 가능
const MOBILE_RESIZE_HANDLE_WIDTH = 20; // ✅ 엄지 크기
const MOBILE_ROW_GAP = 12; // ✅ 여백 확대
```

##### 2.2 롱프레스 컨텍스트 메뉴

```tsx
import { useLongPress } from "@/shared/hooks";

const bind = useLongPress({
    onLongPress: (e) => {
        // 컨텍스트 메뉴 표시
        setContextMenu({
            visible: true,
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            session: session,
        });
    },
    threshold: 500, // 500ms
});

<div
    className="gantt-bar"
    {...bind()}
    style={{
        height: MOBILE_BAR_HEIGHT,
        minHeight: 48, // 터치 타겟
    }}
>
    {/* 바 내용 */}
</div>;
```

##### 2.3 리사이즈 핸들 개선

```tsx
// Before: 8px 핸들 (터치 불가)
<div className="resize-handle" style={{ width: 8 }} />

// After: 20px 핸들 + 터치 영역 확대
<div
  className="resize-handle"
  style={{
    width: 20,
    // 터치 영역 확대 (패딩으로)
    padding: "0 12px",
    margin: "0 -12px",
  }}
>
  <div className="resize-handle-indicator" />
</div>
```

**CSS:**

```css
.resize-handle {
    width: 20px;
    height: 100%;
    cursor: col-resize;
    position: absolute;
    top: 0;
    z-index: 10;
}

.resize-handle-indicator {
    width: 4px;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 2px;
    margin: 0 auto;
}

/* 터치 피드백 */
.resize-handle:active .resize-handle-indicator {
    background: rgba(255, 255, 255, 1);
    width: 6px;
}
```

##### 2.4 스냅 간격 확대

```tsx
// Before: 5분 단위 스냅 (정밀하나 터치로 어려움)
const SNAP_INTERVAL = 5;

// After: 15분 단위 스냅 (모바일 적합)
const MOBILE_SNAP_INTERVAL = 15;
```

##### 2.5 Pinch-to-Zoom (선택)

```tsx
import { useGesture } from "@use-gesture/react";

const bind = useGesture({
    onPinch: ({ offset: [scale] }) => {
        setZoomLevel(Math.max(0.5, Math.min(2, scale)));
    },
});

<div {...bind()} style={{ touchAction: "none" }}>
    {/* 간트 차트 */}
</div>;
```

---

### 3. Pull-to-Refresh (Priority 2.1)

#### 구현 방법

**라이브러리:** `react-use-gesture` + `framer-motion`

```tsx
import { useDrag } from "@use-gesture/react";
import { motion, useMotionValue, useTransform } from "framer-motion";

export function MobileDailyPage() {
    const y = useMotionValue(0);
    const opacity = useTransform(y, [0, 100], [0, 1]);
    const [is_refreshing, setIsRefreshing] = useState(false);

    const bind = useDrag(
        ({ movement: [, my], memo = y.get() }) => {
            // 상단에서만 작동
            if (window.scrollY > 0) return memo;

            // 드래그 중
            if (my > 0 && my < 120) {
                y.set(my);
            }

            // 릴리즈
            if (my > 100 && !is_refreshing) {
                setIsRefreshing(true);
                handleRefresh().finally(() => {
                    setIsRefreshing(false);
                    y.set(0);
                });
            } else {
                y.set(0);
            }

            return memo;
        },
        { axis: "y" }
    );

    return (
        <div {...bind()} style={{ touchAction: "pan-x pan-down" }}>
            {/* 새로고침 인디케이터 */}
            <motion.div
                className="pull-to-refresh-indicator"
                style={{
                    opacity,
                    y: y,
                }}
            >
                <Spin spinning={is_refreshing} />
                <Text>아래로 당겨서 새로고침</Text>
            </motion.div>

            {/* 페이지 내용 */}
            <Content />
        </div>
    );
}
```

---

### 4. 하단 시트 (Priority 2.4)

#### 사용 사례

1. **작업 선택 (프리셋)**
2. **필터 옵션**
3. **컨텍스트 메뉴**

#### 구현

**라이브러리:** `react-spring-bottom-sheet` 또는 직접 구현

```tsx
import BottomSheet from "react-spring-bottom-sheet";

export function WorkTemplateSelector({ open, onClose, onSelect }: Props) {
    return (
        <BottomSheet
            open={open}
            onDismiss={onClose}
            snapPoints={({ maxHeight }) => [maxHeight * 0.6]}
        >
            <div className="bottom-sheet-header">
                <Text strong>작업 선택</Text>
            </div>

            <List
                dataSource={templates}
                renderItem={(template) => (
                    <List.Item
                        onClick={() => onSelect(template)}
                        style={{ minHeight: 60 }} // 터치 타겟
                    >
                        <List.Item.Meta
                            avatar={<Avatar icon={<FolderOutlined />} />}
                            title={template.work_name}
                            description={template.category_name}
                        />
                    </List.Item>
                )}
            />
        </BottomSheet>
    );
}
```

**장점:**

-   모달보다 자연스러운 UX
-   드래그로 닫기 가능
-   부분 노출 → 전체 노출 가능

---

### 5. Step Wizard 폼 (Priority 2.2)

#### Before (현재)

```tsx
// ❌ 긴 단일 폼 - 스크롤 많음, 키보드 가림
<Form>
    <Form.Item label="딜명">...</Form.Item>
    <Form.Item label="작업명">...</Form.Item>
    <Form.Item label="할일">...</Form.Item>
    <Form.Item label="카테고리">...</Form.Item>
    <Form.Item label="시작시간">...</Form.Item>
    <Form.Item label="종료시간">...</Form.Item>
    <Form.Item label="점심시간 제외">...</Form.Item>
    <Form.Item label="메모">...</Form.Item>
    <Button>저장</Button> {/* 키보드에 가림 */}
</Form>
```

#### After (개선)

```tsx
// ✅ 3단계 위저드 - 각 단계 짧음, 하단 액션 고정
<StepWizard>
    {/* Step 1: 기본 정보 */}
    <Step title="작업 정보">
        <Form.Item label="딜명">...</Form.Item>
        <Form.Item label="작업명">...</Form.Item>
        <Form.Item label="할일">...</Form.Item>
    </Step>

    {/* Step 2: 시간 정보 */}
    <Step title="시간 설정">
        <TimePicker.RangePicker />
        <Checkbox>점심시간 제외</Checkbox>
    </Step>

    {/* Step 3: 추가 정보 */}
    <Step title="추가 정보">
        <Form.Item label="카테고리">...</Form.Item>
        <Form.Item label="메모">...</Form.Item>
    </Step>

    {/* 하단 고정 액션 */}
    <div className="wizard-footer">
        <Button onClick={onPrev} disabled={step === 0}>
            이전
        </Button>
        <Button type="primary" onClick={onNext}>
            {step === 2 ? "완료" : "다음"}
        </Button>
    </div>
</StepWizard>
```

**구현 디테일:**

```tsx
export function StepWizard({ children }: Props) {
    const [step, setStep] = useState(0);
    const steps = React.Children.toArray(children);

    return (
        <div className="step-wizard">
            {/* Progress Indicator */}
            <Steps current={step} size="small">
                {steps.map((_, i) => (
                    <Steps.Step key={i} />
                ))}
            </Steps>

            {/* Current Step Content */}
            <div className="step-content">{steps[step]}</div>

            {/* Fixed Bottom Actions */}
            <div className="step-actions">
                {step > 0 && (
                    <Button onClick={() => setStep(step - 1)}>이전</Button>
                )}
                <Button
                    type="primary"
                    onClick={() => {
                        if (step === steps.length - 1) {
                            onFinish();
                        } else {
                            setStep(step + 1);
                        }
                    }}
                >
                    {step === steps.length - 1 ? "완료" : "다음"}
                </Button>
            </div>
        </div>
    );
}
```

**CSS (하단 고정):**

```css
.step-wizard {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.step-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    padding-bottom: 80px; /* 액션 버튼 공간 */
}

.step-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 16px;
    background: white;
    border-top: 1px solid #f0f0f0;
    display: flex;
    gap: 12px;
    z-index: 100;
}

.step-actions button {
    flex: 1;
    height: 48px; /* 터치 타겟 */
}
```

---

### 6. 로딩 스켈레톤 (Priority 2.3)

#### Before (현재)

```tsx
// ❌ 중앙 Spinner만 - 무엇을 기다리는지 불명확
{
    loading && <Spin />;
}
{
    !loading && <WorkRecordTable />;
}
```

#### After (개선)

```tsx
// ✅ 실제 UI 구조를 보여주는 스켈레톤
import { Skeleton } from "antd";

{
    loading ? (
        <div className="record-list-skeleton">
            {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="record-card-skeleton">
                    <Skeleton.Avatar size={48} active />
                    <div style={{ flex: 1, marginLeft: 12 }}>
                        <Skeleton.Input style={{ width: "60%" }} active />
                        <Skeleton.Input
                            style={{ width: "40%", marginTop: 8 }}
                            active
                        />
                    </div>
                </Card>
            ))}
        </div>
    ) : (
        <WorkRecordList />
    );
}
```

**장점:**

-   로딩 시간 체감 단축
-   레이아웃 시프트 방지
-   전문적인 느낌

---

### 7. 에러 상태 UI (Priority 2.3)

#### Before (현재)

```tsx
// ❌ Toast 메시지만 - 사라지면 끝
message.error("데이터를 불러올 수 없습니다.");
```

#### After (개선)

```tsx
// ✅ 전용 에러 UI - 재시도 가능
{
    error ? (
        <Empty
            image={<ExclamationCircleOutlined style={{ fontSize: 64 }} />}
            description={
                <div>
                    <Text strong>데이터를 불러올 수 없습니다</Text>
                    <Text type="secondary">{error.message}</Text>
                </div>
            }
        >
            <Space>
                <Button onClick={handleRetry} type="primary">
                    다시 시도
                </Button>
                <Button onClick={handleGoBack}>뒤로 가기</Button>
            </Space>
        </Empty>
    ) : (
        <Content />
    );
}
```

---

### 8. 오프라인 배너 (Priority 3.2)

```tsx
import { useOnlineStatus } from "@/shared/hooks";

export function OfflineBanner() {
    const is_online = useOnlineStatus();

    if (is_online) return null;

    return (
        <div className="offline-banner">
            <WifiOutlined />
            <Text>오프라인 모드 · 변경 사항은 연결 시 동기화됩니다</Text>
        </div>
    );
}
```

**CSS:**

```css
.offline-banner {
    position: fixed;
    top: 64px; /* 헤더 아래 */
    left: 0;
    right: 0;
    background: #faad14; /* 경고 색상 */
    color: white;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 999;
    animation: slideDown 0.3s ease-out;
}
```

---

### 9. 주간 일정 스와이프 뷰 (Priority 3.1)

#### Before (현재)

```tsx
// ❌ 7일 × 24시간 그리드 - 작은 화면에 과다
<div className="weekly-grid">
    {days.map((day) => (
        <div className="day-column">
            {hours.map((hour) => (
                <div className="time-slot">{/* 작업 */}</div>
            ))}
        </div>
    ))}
</div>
```

#### After (개선)

```tsx
// ✅ 일별 스와이프 - 한 번에 하루만 표시
import Swiper from "swiper";

<Swiper
    initialSlide={getCurrentDayIndex()}
    pagination={{ type: "bullets" }}
    navigation
>
    {days.map((day, index) => (
        <SwiperSlide key={index}>
            <DayView date={day}>
                {/* 해당 날짜 작업만 표시 */}
                <TimelineView records={filterByDate(records, day)} />
            </DayView>
        </SwiperSlide>
    ))}
</Swiper>;
```

**장점:**

-   정보 밀도 감소
-   가독성 향상
-   네이티브 제스처

---

## 기대 효과

### 정량적 지표

| 지표                  | Before | After (예상) | 개선율 |
| --------------------- | ------ | ------------ | ------ |
| 터치 성공률           | 85%    | 95%          | +10%   |
| 작업 추가 시간        | 45초   | 25초         | -44%   |
| 간트 차트 조작 성공률 | 70%    | 90%          | +20%   |
| 오터치 발생률         | 20%    | 5%           | -75%   |
| 페이지 로딩 체감 시간 | 3초    | 1.5초        | -50%   |

### 정성적 효과

1. **사용성**

    - 엄지로 모든 기능 접근 가능
    - 네이티브 앱 수준의 UX
    - 학습 곡선 감소

2. **생산성**

    - 빠른 데이터 입력
    - 오류 감소
    - 피로도 감소

3. **접근성**

    - 큰 터치 타겟 (손떨림, 고령자)
    - 명확한 피드백 (시각장애인)
    - 오프라인 대응 (네트워크 불안정)

4. **브랜드**
    - 전문성 향상
    - 사용자 만족도 증가
    - 모바일 우선 이미지

---

## 구현 로드맵

### Phase 10.1 - Critical (1주)

| 작업                      | 일정 | 담당 |
| ------------------------- | ---- | ---- |
| 1.1 터치 타겟 크기 확대   | 2일  | -    |
| 1.2 작업 기록 카드 UI     | 3일  | -    |
| 1.3 간트 차트 터치 최적화 | 3일  | -    |

**마일스톤:** 핵심 사용성 개선 완료

---

### Phase 10.2 - Important (2주)

| 작업                      | 일정 | 담당 |
| ------------------------- | ---- | ---- |
| 2.1 Pull-to-Refresh       | 2일  | -    |
| 2.2 작업 추가/수정 위저드 | 4일  | -    |
| 2.3 로딩/에러 스켈레톤    | 2일  | -    |
| 2.4 하단 시트             | 3일  | -    |

**마일스톤:** 모바일 UX 패턴 도입 완료

---

### Phase 10.3 - Nice to Have (3주)

| 작업                   | 일정 | 담당 |
| ---------------------- | ---- | ---- |
| 3.1 주간 일정 스와이프 | 4일  | -    |
| 3.2 오프라인 모드 강화 | 5일  | -    |
| 3.3 햅틱 피드백        | 1일  | -    |
| 3.4 다크 모드 최적화   | 2일  | -    |
| 3.5 검색/필터 개선     | 3일  | -    |

**마일스톤:** 고급 기능 완성

---

## 기술 스택

### 제스처/애니메이션

-   **@use-gesture/react**: 터치 제스처 (swipe, long-press, pinch)
-   **framer-motion**: 애니메이션, 트랜지션
-   **react-spring-bottom-sheet**: 하단 시트
-   **swiper**: 스와이프 뷰

### UI 컴포넌트

-   **antd-mobile**: Ant Design 모바일 (선택적)
-   **react-spring**: 물리 기반 애니메이션
-   **react-intersection-observer**: 무한 스크롤

### 상태 관리

-   **zustand**: 전역 상태 (기존 유지)
-   **react-query**: 서버 상태 (선택적)

---

## 테스트 전략

### 단위 테스트

-   제스처 훅 (useLongPress, useSwipe)
-   카드 컴포넌트 렌더링
-   스켈레톤 로딩

### 통합 테스트

-   Pull-to-refresh 플로우
-   작업 추가 위저드
-   오프라인 → 온라인 동기화

### E2E 테스트 (Playwright)

```typescript
test("작업 기록 카드에서 swipe-to-delete", async ({ page }) => {
    await page.goto("/");

    const card = page.locator(".record-card").first();

    // 좌측 스와이프
    await card.swipe({ direction: "left" });

    // 삭제 버튼 표시 확인
    await expect(page.locator("text=삭제")).toBeVisible();

    // 삭제
    await page.click("text=삭제");

    // 카드 사라짐 확인
    await expect(card).toBeHidden();
});
```

### 실제 디바이스 테스트

-   iOS Safari (iPhone 13, 14, 15)
-   Android Chrome (Galaxy S21, S22, S23)
-   다양한 화면 크기 (375px ~ 428px)

---

## 성능 최적화

### 렌더링 최적화

1. **가상 스크롤** (react-window)

    - 작업 기록 리스트 (100개 이상)
    - 간트 차트 시간 레이블

2. **메모이제이션**

    - 카드 컴포넌트 (`React.memo`)
    - 복잡한 계산 (`useMemo`)

3. **Lazy Loading**
    - 이미지 (Intersection Observer)
    - 모달 컴포넌트 (React.lazy)

### 번들 크기 최적화

```bash
# Before
mobile_bundle.js: 3.2MB (900KB gzipped)

# After (목표)
mobile_bundle.js: 2.5MB (750KB gzipped)
```

**전략:**

-   Tree-shaking (unused exports)
-   Code-splitting (route-based)
-   Dynamic imports (modals, heavy components)

---

## 마이그레이션 계획

### 점진적 롤아웃

1. **Week 1**: Priority 1 (Critical) 배포

    - 피처 플래그로 A/B 테스트
    - 20% 사용자에게 먼저 노출

2. **Week 2**: 피드백 수집 및 버그 수정

    - 사용성 테스트 (5명)
    - 오류 로그 분석

3. **Week 3**: 100% 롤아웃

    - 모든 사용자에게 배포

4. **Week 4-6**: Priority 2-3 순차 배포

### 롤백 계획

-   피처 플래그로 즉시 이전 UI 복원 가능
-   데이터 스키마 변경 없음 (하위 호환)

---

## 참고 자료

### 디자인 가이드라인

-   [iOS Human Interface Guidelines - Touch Input](https://developer.apple.com/design/human-interface-guidelines/inputs/touchscreen-gestures/)
-   [Material Design - Mobile Layout](https://m3.material.io/foundations/layout/applying-layout/compact)
-   [WCAG 2.1 - Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)

### 라이브러리 문서

-   [use-gesture](https://use-gesture.netlify.app/)
-   [Framer Motion](https://www.framer.com/motion/)
-   [React Spring Bottom Sheet](https://github.com/stipsan/react-spring-bottom-sheet)
-   [Swiper](https://swiperjs.com/react)

### 벤치마크

-   Notion 모바일
-   Todoist 모바일
-   ClickUp 모바일
-   Linear 모바일

---

## 부록

### A. 터치 타겟 체크리스트

```tsx
// 모든 인터랙티브 요소에 적용
const TOUCH_TARGET_CHECKLIST = {
    // ✅ 최소 크기
    minWidth: 44,
    minHeight: 44,

    // ✅ 패딩으로 확장
    padding: 12, // 실제 버튼보다 큰 터치 영역

    // ✅ 간격
    gap: 8, // 최소 8px 간격

    // ✅ 피드백
    feedback: "ripple", // 터치 시 ripple 효과
};
```

### B. 모바일 전용 스타일 변수

```css
:root {
    /* 터치 타겟 */
    --touch-target-min: 44px;
    --touch-target-comfortable: 48px;

    /* 간격 */
    --mobile-spacing-xs: 4px;
    --mobile-spacing-sm: 8px;
    --mobile-spacing-md: 12px;
    --mobile-spacing-lg: 16px;
    --mobile-spacing-xl: 24px;

    /* 폰트 크기 */
    --mobile-font-xs: 11px;
    --mobile-font-sm: 12px;
    --mobile-font-md: 14px;
    --mobile-font-lg: 16px;
    --mobile-font-xl: 18px;

    /* 레이아웃 */
    --mobile-header-height: 64px;
    --mobile-bottom-nav-height: 72px;
    --mobile-safe-area-bottom: env(safe-area-inset-bottom);
}
```

### C. 성능 측정 스크립트

```typescript
// 터치 성공률 추적
export function trackTouchSuccess(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const touches: Touch[] = [];

    element.addEventListener("touchstart", (e) => {
        touches.push(...e.changedTouches);
    });

    element.addEventListener("touchend", (e) => {
        const successful = touches.some(
            (touch) =>
                touch.clientX >= rect.left &&
                touch.clientX <= rect.right &&
                touch.clientY >= rect.top &&
                touch.clientY <= rect.bottom
        );

        // 분석 전송
        analytics.track("touch_success", {
            element: element.id,
            successful,
            targetSize: { width: rect.width, height: rect.height },
        });
    });
}
```

---

## 결론

모바일 UI/UX 개선은 **3단계**로 진행됩니다:

1. **Phase 10.1 (1주)**: Critical - 터치 타겟, 카드 UI, 간트 차트
2. **Phase 10.2 (2주)**: Important - Pull-to-refresh, 위저드, 스켈레톤, 하단 시트
3. **Phase 10.3 (3주)**: Nice to Have - 스와이프 뷰, 오프라인, 햅틱, 다크 모드

총 **6주** 소요 예상이며, 각 단계마다 배포 및 피드백 수집을 통해 **점진적으로 개선**합니다.

핵심은 **Thumb-Friendly Design**, **Native Gestures**, **Responsive Feedback**을 통해 데스크탑과 구별되는 **모바일 네이티브 UX**를 제공하는 것입니다.

---

**작성자**: AI Assistant  
**검토 필요**: UX 디자이너, 모바일 개발자  
**업데이트**: 구현 진행 시 수시 업데이트
