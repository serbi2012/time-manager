/**
 * 시간 차트 컴포넌트
 * CSS로 구현한 간단한 바 차트
 */

import { useMemo } from "react";
import { Typography, Tooltip, Empty } from "antd";
import type { DailyStat } from "../../lib/statistics";
import {
  formatDuration,
  type TimeDisplayFormat,
} from "../../lib/statistics";

const { Text } = Typography;

interface TimeChartProps {
  data: DailyStat[];
  title: string;
  height?: number;
  show_labels?: boolean;
  time_format?: TimeDisplayFormat;
}

export function TimeChart({
  data,
  title,
  height = 200,
  show_labels = true,
  time_format = "hours",
}: TimeChartProps) {
  const max_value = useMemo(() => {
    return Math.max(...data.map((d) => d.total_minutes), 1);
  }, [data]);

  if (data.length === 0) {
    return <Empty description="데이터가 없습니다" />;
  }

  const bar_width = Math.max(100 / data.length - 1, 2);

  return (
    <div style={{ width: "100%" }}>
      <Text strong style={{ display: "block", marginBottom: 8 }}>
        {title}
      </Text>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          height,
          gap: 2,
          padding: "0 4px",
          borderBottom: "1px solid #d9d9d9",
        }}
      >
        {data.map((item, index) => {
          const bar_height = (item.total_minutes / max_value) * (height - 30);
          return (
            <Tooltip
              key={index}
              title={
                <div>
                  <div>{item.date}</div>
                  <div>{formatDuration(item.total_minutes, time_format)}</div>
                  <div>레코드: {item.record_count}건</div>
                  <div>세션: {item.session_count}개</div>
                </div>
              }
            >
              <div
                style={{
                  flex: 1,
                  maxWidth: `${bar_width}%`,
                  minWidth: 4,
                  height: Math.max(bar_height, 2),
                  backgroundColor:
                    item.total_minutes > 0 ? "#1890ff" : "#f0f0f0",
                  borderRadius: "2px 2px 0 0",
                  transition: "height 0.3s",
                  cursor: "pointer",
                }}
              />
            </Tooltip>
          );
        })}
      </div>
      {show_labels && data.length <= 31 && (
        <div
          style={{
            display: "flex",
            gap: 2,
            padding: "4px 4px 0",
            overflow: "hidden",
          }}
        >
          {data.map((item, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                maxWidth: `${bar_width}%`,
                minWidth: 4,
                textAlign: "center",
                fontSize: 10,
                color: "#999",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {data.length <= 12 ? item.date : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TimeChart;
