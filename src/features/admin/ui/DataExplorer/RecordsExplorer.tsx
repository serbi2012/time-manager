/**
 * 레코드 탐색기 컴포넌트
 * 전체 레코드 조회, 검색, 필터링
 */

import { useState, useMemo } from "react";
import {
  Table,
  Input,
  DatePicker,
  Select,
  Space,
  Tag,
  Button,
  Modal,
  Descriptions,
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  Badge,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { WorkRecord } from "../../../../shared/types";
import {
  formatDuration,
  type TimeDisplayFormat,
} from "../../lib/statistics";

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface RecordsExplorerProps {
  records: WorkRecord[];
  time_format?: TimeDisplayFormat;
}

type FilterStatus = "all" | "completed" | "incomplete";
type DeletedFilter = "exclude" | "include" | "only";

export function RecordsExplorer({
  records,
  time_format = "hours",
}: RecordsExplorerProps) {
  // 필터 상태
  const [search_text, setSearchText] = useState("");
  const [date_range, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [status_filter, setStatusFilter] = useState<FilterStatus>("all");
  const [deleted_filter, setDeletedFilter] = useState<DeletedFilter>("exclude");

  // 상세 모달
  const [detail_record, setDetailRecord] = useState<WorkRecord | null>(null);

  // 필터링된 레코드
  const filtered_records = useMemo(() => {
    let result = [...records];

    // 삭제 필터
    if (deleted_filter === "exclude") {
      result = result.filter((r) => !r.is_deleted);
    } else if (deleted_filter === "only") {
      result = result.filter((r) => r.is_deleted);
    }

    // 완료 상태 필터
    if (status_filter === "completed") {
      result = result.filter((r) => r.is_completed);
    } else if (status_filter === "incomplete") {
      result = result.filter((r) => !r.is_completed);
    }

    // 날짜 범위 필터
    if (date_range) {
      const [start, end] = date_range;
      result = result.filter((r) => {
        const record_date = dayjs(r.date);
        return (
          record_date.isAfter(start.subtract(1, "day")) &&
          record_date.isBefore(end.add(1, "day"))
        );
      });
    }

    // 텍스트 검색
    if (search_text.trim()) {
      const search_lower = search_text.toLowerCase().trim();
      result = result.filter((r) => {
        return (
          r.work_name?.toLowerCase().includes(search_lower) ||
          r.deal_name?.toLowerCase().includes(search_lower) ||
          r.project_code?.toLowerCase().includes(search_lower) ||
          r.category_name?.toLowerCase().includes(search_lower) ||
          r.task_name?.toLowerCase().includes(search_lower)
        );
      });
    }

    // 날짜 내림차순 정렬
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [records, search_text, date_range, status_filter, deleted_filter]);

  // 통계
  const stats = useMemo(() => {
    const total_minutes = filtered_records.reduce(
      (sum, r) => sum + (r.duration_minutes || 0),
      0
    );
    const total_sessions = filtered_records.reduce(
      (sum, r) => sum + r.sessions.length,
      0
    );
    return {
      count: filtered_records.length,
      total_minutes,
      total_sessions,
    };
  }, [filtered_records]);

  const columns: ColumnsType<WorkRecord> = [
    {
      title: "날짜",
      dataIndex: "date",
      key: "date",
      width: 110,
      sorter: (a, b) => a.date.localeCompare(b.date),
      render: (date: string) => (
        <Text>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {date}
        </Text>
      ),
    },
    {
      title: "거래명",
      dataIndex: "deal_name",
      key: "deal_name",
      ellipsis: true,
      sorter: (a, b) => (a.deal_name || "").localeCompare(b.deal_name || ""),
    },
    {
      title: "작업명",
      dataIndex: "work_name",
      key: "work_name",
      width: 150,
      ellipsis: true,
      sorter: (a, b) => (a.work_name || "").localeCompare(b.work_name || ""),
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "카테고리",
      dataIndex: "category_name",
      key: "category_name",
      width: 100,
      render: (text: string) => text || "-",
    },
    {
      title: "시간",
      dataIndex: "duration_minutes",
      key: "duration_minutes",
      width: 100,
      sorter: (a, b) =>
        (a.duration_minutes || 0) - (b.duration_minutes || 0),
      render: (mins: number) => (
        <Text>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {formatDuration(mins || 0, time_format)}
        </Text>
      ),
    },
    {
      title: "세션",
      key: "sessions",
      width: 70,
      sorter: (a, b) => a.sessions.length - b.sessions.length,
      render: (_, record) => (
        <Badge count={record.sessions.length} showZero color="cyan" />
      ),
    },
    {
      title: "상태",
      key: "status",
      width: 100,
      render: (_, record) => (
        <Space>
          {record.is_completed && <Tag color="green">완료</Tag>}
          {record.is_deleted && <Tag color="red">삭제됨</Tag>}
          {!record.is_completed && !record.is_deleted && (
            <Tag color="default">진행중</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => setDetailRecord(record)}
        />
      ),
    },
  ];

  return (
    <div>
      {/* 필터 영역 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="검색 (거래명, 작업명, 프로젝트 코드)"
              prefix={<SearchOutlined />}
              value={search_text}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              value={date_range}
              onChange={(dates) =>
                setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)
              }
              style={{ width: "100%" }}
              placeholder={["시작일", "종료일"]}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              value={status_filter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
              options={[
                { value: "all", label: "전체 상태" },
                { value: "completed", label: "완료됨" },
                { value: "incomplete", label: "미완료" },
              ]}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              value={deleted_filter}
              onChange={setDeletedFilter}
              style={{ width: "100%" }}
              options={[
                { value: "exclude", label: "삭제 제외" },
                { value: "include", label: "삭제 포함" },
                { value: "only", label: "삭제만" },
              ]}
            />
          </Col>
          <Col xs={24} md={4}>
            <Button
              onClick={() => {
                setSearchText("");
                setDateRange(null);
                setStatusFilter("all");
                setDeletedFilter("exclude");
              }}
            >
              필터 초기화
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 통계 요약 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="레코드 수"
              value={stats.count}
              prefix={<FileTextOutlined />}
              suffix="건"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="총 세션"
              value={stats.total_sessions}
              prefix={<ClockCircleOutlined />}
              suffix="개"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="총 시간"
              value={formatDuration(stats.total_minutes, time_format)}
            />
          </Card>
        </Col>
      </Row>

      {/* 테이블 */}
      <Table
        dataSource={filtered_records}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `총 ${total}건`,
        }}
        scroll={{ x: 900 }}
      />

      {/* 상세 모달 */}
      <Modal
        title="레코드 상세"
        open={!!detail_record}
        onCancel={() => setDetailRecord(null)}
        footer={null}
        width={700}
      >
        {detail_record && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="ID" span={2}>
              <Text code copyable>
                {detail_record.id}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="날짜">
              {detail_record.date}
            </Descriptions.Item>
            <Descriptions.Item label="프로젝트 코드">
              {detail_record.project_code}
            </Descriptions.Item>
            <Descriptions.Item label="작업명">
              {detail_record.work_name}
            </Descriptions.Item>
            <Descriptions.Item label="업무명">
              {detail_record.task_name}
            </Descriptions.Item>
            <Descriptions.Item label="거래명" span={2}>
              {detail_record.deal_name}
            </Descriptions.Item>
            <Descriptions.Item label="카테고리">
              {detail_record.category_name}
            </Descriptions.Item>
            <Descriptions.Item label="총 시간">
              {formatDuration(detail_record.duration_minutes || 0, time_format)}
            </Descriptions.Item>
            <Descriptions.Item label="시작 시간">
              {detail_record.start_time || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="종료 시간">
              {detail_record.end_time || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="완료 여부">
              {detail_record.is_completed ? (
                <Tag color="green">완료</Tag>
              ) : (
                <Tag>미완료</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="삭제 여부">
              {detail_record.is_deleted ? (
                <Tag color="red">삭제됨</Tag>
              ) : (
                <Tag color="blue">활성</Tag>
              )}
            </Descriptions.Item>
            {detail_record.completed_at && (
              <Descriptions.Item label="완료 시각" span={2}>
                {dayjs(detail_record.completed_at).format(
                  "YYYY-MM-DD HH:mm:ss"
                )}
              </Descriptions.Item>
            )}
            {detail_record.deleted_at && (
              <Descriptions.Item label="삭제 시각" span={2}>
                {dayjs(detail_record.deleted_at).format("YYYY-MM-DD HH:mm:ss")}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="비고" span={2}>
              {detail_record.note || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="세션 수" span={2}>
              {detail_record.sessions.length}개
            </Descriptions.Item>
          </Descriptions>
        )}

        {detail_record && detail_record.sessions.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text strong>세션 목록</Text>
            <Table
              dataSource={detail_record.sessions}
              rowKey="id"
              size="small"
              pagination={false}
              style={{ marginTop: 8 }}
              columns={[
                {
                  title: "날짜",
                  dataIndex: "date",
                  key: "date",
                  render: (date: string) =>
                    date || detail_record.date,
                },
                {
                  title: "시작",
                  dataIndex: "start_time",
                  key: "start_time",
                },
                {
                  title: "종료",
                  dataIndex: "end_time",
                  key: "end_time",
                  render: (time: string) => time || "(진행중)",
                },
                {
                  title: "시간",
                  dataIndex: "duration_minutes",
                  key: "duration_minutes",
                  render: (mins: number) =>
                    formatDuration(mins || 0, time_format),
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default RecordsExplorer;
