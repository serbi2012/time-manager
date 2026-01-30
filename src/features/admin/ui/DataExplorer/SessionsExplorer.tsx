/**
 * 세션 탐색기 컴포넌트
 * 전체 세션 조회, 검색, 필터링
 */

import { useState, useMemo } from "react";
import {
  Table,
  Input,
  DatePicker,
  Space,
  Tag,
  Button,
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { WorkRecord, WorkSession } from "../../../../shared/types";
import {
  formatDuration,
  type TimeDisplayFormat,
} from "../../lib/statistics";

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface SessionWithRecord extends WorkSession {
  record_id: string;
  work_name: string;
  deal_name: string;
  project_code: string;
  record_date: string;
}

interface SessionsExplorerProps {
  records: WorkRecord[];
  time_format?: TimeDisplayFormat;
}

export function SessionsExplorer({
  records,
  time_format = "hours",
}: SessionsExplorerProps) {
  // 필터 상태
  const [search_text, setSearchText] = useState("");
  const [date_range, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [time_filter, setTimeFilter] = useState<"all" | "running" | "completed">(
    "all"
  );

  // 모든 세션 추출 (레코드 정보 포함)
  const all_sessions = useMemo(() => {
    const sessions: SessionWithRecord[] = [];

    records
      .filter((r) => !r.is_deleted)
      .forEach((record) => {
        record.sessions.forEach((session) => {
          sessions.push({
            ...session,
            record_id: record.id,
            work_name: record.work_name,
            deal_name: record.deal_name,
            project_code: record.project_code,
            record_date: record.date,
          });
        });
      });

    return sessions;
  }, [records]);

  // 필터링된 세션
  const filtered_sessions = useMemo(() => {
    let result = [...all_sessions];

    // 날짜 범위 필터
    if (date_range) {
      const [start, end] = date_range;
      result = result.filter((s) => {
        const session_date = dayjs(s.date || s.record_date);
        return (
          session_date.isAfter(start.subtract(1, "day")) &&
          session_date.isBefore(end.add(1, "day"))
        );
      });
    }

    // 진행중/완료 필터
    if (time_filter === "running") {
      result = result.filter((s) => s.end_time === "");
    } else if (time_filter === "completed") {
      result = result.filter((s) => s.end_time !== "");
    }

    // 텍스트 검색
    if (search_text.trim()) {
      const search_lower = search_text.toLowerCase().trim();
      result = result.filter((s) => {
        return (
          s.work_name?.toLowerCase().includes(search_lower) ||
          s.deal_name?.toLowerCase().includes(search_lower) ||
          s.project_code?.toLowerCase().includes(search_lower) ||
          s.record_id?.toLowerCase().includes(search_lower)
        );
      });
    }

    // 날짜+시작시간 내림차순 정렬
    return result.sort((a, b) => {
      const date_a = a.date || a.record_date;
      const date_b = b.date || b.record_date;
      const date_compare = date_b.localeCompare(date_a);
      if (date_compare !== 0) return date_compare;
      return (b.start_time || "").localeCompare(a.start_time || "");
    });
  }, [all_sessions, search_text, date_range, time_filter]);

  // 통계
  const stats = useMemo(() => {
    const total_minutes = filtered_sessions.reduce(
      (sum, s) => sum + (s.duration_minutes || 0),
      0
    );
    const running_count = filtered_sessions.filter(
      (s) => s.end_time === ""
    ).length;
    const avg_duration =
      filtered_sessions.length > 0
        ? Math.round(total_minutes / filtered_sessions.length)
        : 0;

    return {
      count: filtered_sessions.length,
      total_minutes,
      running_count,
      avg_duration,
    };
  }, [filtered_sessions]);

  const columns: ColumnsType<SessionWithRecord> = [
    {
      title: "날짜",
      key: "date",
      width: 110,
      sorter: (a, b) => {
        const date_a = a.date || a.record_date;
        const date_b = b.date || b.record_date;
        return date_a.localeCompare(date_b);
      },
      render: (_, session) => (
        <Text>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {session.date || session.record_date}
        </Text>
      ),
    },
    {
      title: "시간",
      key: "time_range",
      width: 130,
      render: (_, session) => (
        <Space>
          <Text>{session.start_time}</Text>
          <Text type="secondary">~</Text>
          <Text>
            {session.end_time || <Tag color="green">진행중</Tag>}
          </Text>
        </Space>
      ),
    },
    {
      title: "소요",
      dataIndex: "duration_minutes",
      key: "duration_minutes",
      width: 90,
      sorter: (a, b) =>
        (a.duration_minutes || 0) - (b.duration_minutes || 0),
      render: (mins: number, session) => (
        <Text type={session.end_time === "" ? "success" : undefined}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {formatDuration(mins || 0, time_format)}
        </Text>
      ),
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
      title: "거래명",
      dataIndex: "deal_name",
      key: "deal_name",
      ellipsis: true,
      sorter: (a, b) => (a.deal_name || "").localeCompare(b.deal_name || ""),
    },
    {
      title: "레코드",
      dataIndex: "record_id",
      key: "record_id",
      width: 120,
      render: (id: string) => (
        <Tooltip title={id}>
          <Text code style={{ fontSize: 11 }}>
            <LinkOutlined style={{ marginRight: 4 }} />
            {id.substring(0, 8)}...
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "세션 ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (id: string) => (
        <Tooltip title={id}>
          <Text code style={{ fontSize: 11 }}>
            {id.substring(0, 8)}...
          </Text>
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      {/* 필터 영역 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="검색 (작업명, 거래명, 프로젝트 코드)"
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
            <Space.Compact style={{ width: "100%" }}>
              <Button
                type={time_filter === "all" ? "primary" : "default"}
                onClick={() => setTimeFilter("all")}
              >
                전체
              </Button>
              <Button
                type={time_filter === "running" ? "primary" : "default"}
                onClick={() => setTimeFilter("running")}
              >
                진행중
              </Button>
              <Button
                type={time_filter === "completed" ? "primary" : "default"}
                onClick={() => setTimeFilter("completed")}
              >
                완료
              </Button>
            </Space.Compact>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Button
              onClick={() => {
                setSearchText("");
                setDateRange(null);
                setTimeFilter("all");
              }}
            >
              필터 초기화
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 통계 요약 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="세션 수"
              value={stats.count}
              suffix="개"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="진행중"
              value={stats.running_count}
              valueStyle={{
                color: stats.running_count > 0 ? "#52c41a" : undefined,
              }}
              suffix="개"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="총 시간"
              value={formatDuration(stats.total_minutes, time_format)}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="평균 시간"
              value={formatDuration(stats.avg_duration, time_format)}
            />
          </Card>
        </Col>
      </Row>

      {/* 테이블 */}
      <Table
        dataSource={filtered_sessions}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `총 ${total}개`,
        }}
        scroll={{ x: 900 }}
      />
    </div>
  );
}

export default SessionsExplorer;
