/**
 * 카테고리별 분석 컴포넌트
 */

import { Progress, Typography, Space, Table, Tag, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { CategoryStat, WorkNameStat } from "../../lib/statistics";
import {
  formatDuration,
  type TimeDisplayFormat,
} from "../../lib/statistics";

const { Text } = Typography;

// 카테고리별 색상
const CATEGORY_COLORS: Record<string, string> = {
  개발: "#1890ff",
  회의: "#52c41a",
  문서작업: "#faad14",
  분석: "#722ed1",
  테스트: "#eb2f96",
  기타: "#8c8c8c",
};

interface CategoryChartProps {
  data: CategoryStat[];
  title: string;
  time_format?: TimeDisplayFormat;
}

export function CategoryChart({
  data,
  title,
  time_format = "hours",
}: CategoryChartProps) {
  if (data.length === 0) {
    return <Empty description="데이터가 없습니다" />;
  }

  return (
    <div>
      <Text strong style={{ display: "block", marginBottom: 16 }}>
        {title}
      </Text>
      <Space direction="vertical" style={{ width: "100%" }} size="small">
        {data.slice(0, 8).map((item) => (
          <div key={item.category}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <Text>{item.category}</Text>
              <Text type="secondary">
                {formatDuration(item.total_minutes, time_format)} ({item.percentage}%)
              </Text>
            </div>
            <Progress
              percent={item.percentage}
              showInfo={false}
              strokeColor={CATEGORY_COLORS[item.category] || "#1890ff"}
              size="small"
            />
          </div>
        ))}
      </Space>
    </div>
  );
}

interface WorkNameTableProps {
  data: WorkNameStat[];
  title: string;
  time_format?: TimeDisplayFormat;
}

export function WorkNameTable({
  data,
  title,
  time_format = "hours",
}: WorkNameTableProps) {
  const columns: ColumnsType<WorkNameStat> = [
    {
      title: "순위",
      key: "rank",
      width: 50,
      render: (_, __, index) => (
        <Tag color={index < 3 ? "gold" : "default"}>{index + 1}</Tag>
      ),
    },
    {
      title: "작업명",
      dataIndex: "work_name",
      key: "work_name",
      ellipsis: true,
    },
    {
      title: "시간",
      dataIndex: "total_minutes",
      key: "total_minutes",
      width: 100,
      render: (mins: number) => formatDuration(mins, time_format),
    },
    {
      title: "레코드",
      dataIndex: "record_count",
      key: "record_count",
      width: 70,
      render: (count: number) => `${count}건`,
    },
    {
      title: "세션",
      dataIndex: "session_count",
      key: "session_count",
      width: 70,
      render: (count: number) => `${count}개`,
    },
  ];

  if (data.length === 0) {
    return <Empty description="데이터가 없습니다" />;
  }

  return (
    <div>
      <Text strong style={{ display: "block", marginBottom: 16 }}>
        {title}
      </Text>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="work_name"
        size="small"
        pagination={false}
      />
    </div>
  );
}

interface CategoryAnalysisProps {
  category_stats: CategoryStat[];
  work_name_stats: WorkNameStat[];
  time_format?: TimeDisplayFormat;
}

export function CategoryAnalysis({
  category_stats,
  work_name_stats,
  time_format = "hours",
}: CategoryAnalysisProps) {
  return (
    <div>
      <CategoryChart
        data={category_stats}
        title="카테고리별 시간 분포"
        time_format={time_format}
      />
      <div style={{ marginTop: 24 }}>
        <WorkNameTable
          data={work_name_stats}
          title="작업명별 TOP 10"
          time_format={time_format}
        />
      </div>
    </div>
  );
}

export default CategoryAnalysis;
