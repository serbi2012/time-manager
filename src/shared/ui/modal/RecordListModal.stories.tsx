import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { ConfigProvider, Button, Tag } from "antd";
import { RollbackOutlined, DeleteOutlined } from "@ant-design/icons";
import koKR from "antd/locale/ko_KR";
import type { ColumnsType } from "antd/es/table";
import { RecordListModal } from "./RecordListModal";

interface MockRecord {
    id: string;
    name: string;
    category: string;
    duration: number;
    date: string;
}

const meta = {
    title: "Shared/UI/Modal/RecordListModal",
    component: RecordListModal,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <ConfigProvider locale={koKR}>
                <Story />
            </ConfigProvider>
        ),
    ],
    args: {
        onClose: fn(),
    },
} satisfies Meta<typeof RecordListModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockRecords: MockRecord[] = [
    {
        id: "1",
        name: "API 개발",
        category: "개발",
        duration: 120,
        date: "2024-01-15",
    },
    {
        id: "2",
        name: "UI 디자인",
        category: "디자인",
        duration: 90,
        date: "2024-01-15",
    },
    {
        id: "3",
        name: "기획 회의",
        category: "회의",
        duration: 60,
        date: "2024-01-14",
    },
    {
        id: "4",
        name: "코드 리뷰",
        category: "개발",
        duration: 45,
        date: "2024-01-14",
    },
    {
        id: "5",
        name: "문서 작성",
        category: "기타",
        duration: 30,
        date: "2024-01-13",
    },
];

const columns: ColumnsType<MockRecord> = [
    { title: "작업명", dataIndex: "name", key: "name" },
    {
        title: "카테고리",
        dataIndex: "category",
        key: "category",
        render: (cat: string) => <Tag>{cat}</Tag>,
    },
    {
        title: "소요 시간",
        dataIndex: "duration",
        key: "duration",
        render: (mins: number) => `${Math.floor(mins / 60)}시간 ${mins % 60}분`,
    },
    { title: "날짜", dataIndex: "date", key: "date" },
];

/**
 * 기본 목록 모달
 */
export const Default: Story = {
    args: {
        title: "작업 목록",
        open: true,
        records: mockRecords as { id: string }[],
        columns: columns as ColumnsType<{ id: string }>,
        countText: "개의 작업",
    },
};

/**
 * 인터랙티브 데모
 */
export const Interactive: Story = {
    args: {
        title: "완료된 작업",
        open: false,
        records: mockRecords as { id: string }[],
        columns: columns as ColumnsType<{ id: string }>,
        countText: "개의 완료된 작업",
    },
    render: function Render() {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button type="primary" onClick={() => setOpen(true)}>
                    목록 보기
                </Button>
                <RecordListModal
                    title="완료된 작업"
                    open={open}
                    onClose={() => setOpen(false)}
                    records={mockRecords}
                    columns={columns}
                    countText="개의 완료된 작업"
                />
            </>
        );
    },
};

/**
 * 빈 목록
 */
export const EmptyList: Story = {
    args: {
        title: "완료된 작업",
        open: true,
        records: [],
        columns: columns as ColumnsType<{ id: string }>,
        emptyText: "완료된 작업이 없습니다.",
    },
};

/**
 * 검색 기능
 */
export const WithSearch: Story = {
    args: {
        title: "작업 검색",
        open: true,
        records: mockRecords as { id: string }[],
        columns: columns as ColumnsType<{ id: string }>,
        showSearch: true,
        searchPlaceholder: "작업명 검색...",
    },
    render: function Render() {
        const [search, setSearch] = useState("");
        const filteredRecords = mockRecords.filter((r) =>
            r.name.toLowerCase().includes(search.toLowerCase())
        );

        return (
            <RecordListModal
                title="작업 검색"
                open={true}
                onClose={fn()}
                records={filteredRecords}
                columns={columns}
                showSearch={true}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="작업명 검색..."
            />
        );
    },
};

/**
 * 액션 버튼 포함
 */
export const WithActions: Story = {
    args: {
        title: "휴지통",
        open: true,
        records: mockRecords as { id: string }[],
        columns: columns as ColumnsType<{ id: string }>,
        emptyText: "휴지통이 비어있습니다.",
        countText: "개의 삭제된 작업",
    },
    render: function Render() {
        const columnsWithActions: ColumnsType<MockRecord> = [
            ...columns,
            {
                title: "",
                key: "actions",
                width: 100,
                render: () => (
                    <Button.Group size="small">
                        <Button icon={<RollbackOutlined />} />
                        <Button icon={<DeleteOutlined />} danger />
                    </Button.Group>
                ),
            },
        ];

        return (
            <RecordListModal
                title="휴지통"
                open={true}
                onClose={fn()}
                records={mockRecords}
                columns={columnsWithActions}
                emptyText="휴지통이 비어있습니다."
                countText="개의 삭제된 작업"
            />
        );
    },
};

/**
 * 헤더 추가 요소
 */
export const WithHeaderExtra: Story = {
    args: {
        title: "작업 관리",
        open: true,
        records: mockRecords as { id: string }[],
        columns: columns as ColumnsType<{ id: string }>,
        headerExtra: (
            <Button type="primary" size="small">
                전체 복원
            </Button>
        ),
    },
};

/**
 * 작은 페이지 크기
 */
export const SmallPageSize: Story = {
    args: {
        title: "작업 목록",
        open: true,
        records: mockRecords as { id: string }[],
        columns: columns as ColumnsType<{ id: string }>,
        pageSize: 3,
    },
};
