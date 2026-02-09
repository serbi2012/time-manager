/**
 * 통계 대시보드 컴포넌트 - 확장 버전
 */

import { useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Segmented,
  Space,
  Typography,
  Divider,
  Progress,
  Table,
  Tooltip,
  Badge,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  FieldTimeOutlined,
  BranchesOutlined,
  RiseOutlined,
  FallOutlined,
  FireOutlined,
  TrophyOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  PieChartOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import type { WorkRecord } from "../../../../shared/types";
import {
  calculateDailyStats,
  calculateWeeklyStats,
  calculateMonthlyStats,
  calculateCategoryStats,
  calculateWorkNameStats,
  calculateSessionStats,
  calculateStatsSummary,
  calculateHourlyStats,
  calculateWeekdayStats,
  calculateDealStats,
  calculateProductivityStats,
  calculateWeekComparison,
  calculateMonthComparison,
  calculateCompletionStats,
  calculateSessionDistribution,
  calculateTodayStats,
  formatDuration,
  type TimeDisplayFormat,
  type DealStats,
  type CompletionStats,
} from "../../lib/statistics";
import { TimeChart } from "./TimeChart";
import { CategoryAnalysis } from "./CategoryAnalysis";

const { Title, Text } = Typography;

type TimeRange = "daily" | "weekly" | "monthly";

interface StatsDashboardProps {
  records: WorkRecord[];
  time_format?: TimeDisplayFormat;
}

export function StatsDashboard({
  records,
  time_format = "hours",
}: StatsDashboardProps) {
  const [time_range, setTimeRange] = useState<TimeRange>("daily");

  // 기본 통계 계산
  const summary = useMemo(() => calculateStatsSummary(records), [records]);
  const session_stats = useMemo(
    () => calculateSessionStats(records),
    [records]
  );
  const daily_stats = useMemo(
    () => calculateDailyStats(records, 30),
    [records]
  );
  const weekly_stats = useMemo(
    () => calculateWeeklyStats(records, 12),
    [records]
  );
  const monthly_stats = useMemo(
    () => calculateMonthlyStats(records, 12),
    [records]
  );
  const category_stats = useMemo(
    () => calculateCategoryStats(records),
    [records]
  );
  const work_name_stats = useMemo(
    () => calculateWorkNameStats(records, 10),
    [records]
  );

  // 확장 통계 계산
  const hourly_stats = useMemo(
    () => calculateHourlyStats(records),
    [records]
  );
  const weekday_stats = useMemo(
    () => calculateWeekdayStats(records),
    [records]
  );
  const deal_stats = useMemo(
    () => calculateDealStats(records, 15),
    [records]
  );
  const productivity = useMemo(
    () => calculateProductivityStats(records),
    [records]
  );
  const week_comparison = useMemo(
    () => calculateWeekComparison(records),
    [records]
  );
  const month_comparison = useMemo(
    () => calculateMonthComparison(records),
    [records]
  );
  const completion_stats = useMemo(
    () => calculateCompletionStats(records),
    [records]
  );
  const session_distribution = useMemo(
    () => calculateSessionDistribution(records),
    [records]
  );
  const today_stats = useMemo(() => calculateTodayStats(records), [records]);

  // 선택된 시간 범위에 따른 차트 데이터
  const chart_data = useMemo(() => {
    switch (time_range) {
      case "daily":
        return daily_stats;
      case "weekly":
        return weekly_stats;
      case "monthly":
        return monthly_stats;
      default:
        return daily_stats;
    }
  }, [time_range, daily_stats, weekly_stats, monthly_stats]);

  const chart_title = useMemo(() => {
    switch (time_range) {
      case "daily":
        return "일별 작업 시간 (최근 30일)";
      case "weekly":
        return "주별 작업 시간 (최근 12주)";
      case "monthly":
        return "월별 작업 시간 (최근 12개월)";
      default:
        return "";
    }
  }, [time_range]);

  // 시간대별 최대값 (차트 높이 계산용)
  const hourly_max = Math.max(...hourly_stats.map((h) => h.total_minutes), 1);
  const weekday_max = Math.max(...weekday_stats.map((w) => w.total_minutes), 1);

  // 세션 분포 총합
  const dist_total =
    session_distribution.under_15min +
    session_distribution.min_15_to_30 +
    session_distribution.min_30_to_60 +
    session_distribution.hour_1_to_2 +
    session_distribution.over_2hours || 1;

  // 변화율 표시 컴포넌트
  const renderChange = (percent: number) => {
    if (percent === 0) return <Text type="secondary">-</Text>;
    const is_positive = percent > 0;
    return (
      <Space size={4}>
        {is_positive ? (
          <RiseOutlined className="!text-[#52c41a]" />
        ) : (
          <FallOutlined className="!text-[#ff4d4f]" />
        )}
        <Text style={{ color: is_positive ? "#52c41a" : "#ff4d4f" }}>
          {is_positive ? "+" : ""}
          {percent}%
        </Text>
      </Space>
    );
  };

  // 딜 테이블 컬럼
  const deal_columns: ColumnsType<DealStats> = [
    {
      title: "딜명",
      dataIndex: "deal_name",
      key: "deal_name",
      ellipsis: true,
      render: (name: string, record) => (
        <Space direction="vertical" size={0}>
          <Text strong ellipsis>
            {name}
          </Text>
          {record.project_code && (
            <Text type="secondary" className="!text-[11px]">
              {record.project_code}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "시간",
      dataIndex: "total_minutes",
      key: "total_minutes",
      width: 100,
      align: "right",
      sorter: (a, b) => a.total_minutes - b.total_minutes,
      render: (mins: number) => formatDuration(mins, time_format),
    },
    {
      title: "레코드",
      dataIndex: "record_count",
      key: "record_count",
      width: 70,
      align: "center",
      render: (count: number) => <Badge count={count} showZero color="blue" />,
    },
    {
      title: "완료율",
      dataIndex: "completion_rate",
      key: "completion_rate",
      width: 80,
      align: "center",
      sorter: (a, b) => a.completion_rate - b.completion_rate,
      render: (rate: number) => (
        <Progress
          percent={rate}
          size="small"
          format={(p) => `${p}%`}
          status={rate === 100 ? "success" : "active"}
        />
      ),
    },
  ];

  // 카테고리별 완료율 컬럼
  const completion_columns: ColumnsType<CompletionStats["by_category"][0]> = [
    {
      title: "카테고리",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "완료/전체",
      key: "count",
      width: 100,
      align: "center",
      render: (_, record) => `${record.completed}/${record.total}`,
    },
    {
      title: "완료율",
      dataIndex: "rate",
      key: "rate",
      width: 120,
      render: (rate: number) => (
        <Progress
          percent={rate}
          size="small"
          status={rate === 100 ? "success" : rate >= 80 ? "active" : "normal"}
        />
      ),
    },
  ];

  return (
    <div>
      {/* ===== 오늘 통계 ===== */}
      <Card
        size="small"
        title={
          <Space>
            <CalendarOutlined />
            오늘 통계
          </Space>
        }
        className="!mb-lg"
      >
        <Row gutter={[16, 8]}>
          <Col xs={12} sm={6} md={4}>
            <Statistic
              title="오늘 작업 시간"
              value={formatDuration(today_stats.total_minutes, time_format)}
              valueStyle={{ color: "#1890ff", fontSize: 18 }}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Statistic
              title="세션 수"
              value={today_stats.session_count}
              suffix="개"
              valueStyle={{ fontSize: 18 }}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Statistic
              title="레코드 수"
              value={today_stats.record_count}
              suffix="건"
              valueStyle={{ fontSize: 18 }}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Statistic
              title="완료"
              value={today_stats.completed_count}
              suffix="건"
              valueStyle={{ color: "#52c41a", fontSize: 18 }}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Statistic
              title="첫 작업"
              value={today_stats.first_session_time || "-"}
              valueStyle={{ fontSize: 18 }}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Statistic
              title="마지막 작업"
              value={today_stats.last_session_time || "-"}
              valueStyle={{ fontSize: 18 }}
            />
          </Col>
        </Row>
      </Card>

      {/* ===== 기간 비교 ===== */}
      <Row gutter={[16, 16]} className="!mb-lg">
        <Col xs={24} md={12}>
          <Card
            size="small"
            title={
              <Space>
                <BarChartOutlined />
                이번 주 vs 지난 주
              </Space>
            }
          >
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="작업 시간"
                  value={formatDuration(
                    week_comparison.current_minutes,
                    time_format
                  )}
                  valueStyle={{ fontSize: 16 }}
                />
                <div className="mt-xs">
                  {renderChange(week_comparison.change_percent)}
                </div>
              </Col>
              <Col span={8}>
                <Statistic
                  title="세션"
                  value={week_comparison.current_sessions}
                  suffix="개"
                  valueStyle={{ fontSize: 16 }}
                />
                <div className="mt-xs">
                  {renderChange(week_comparison.sessions_change_percent)}
                </div>
              </Col>
              <Col span={8}>
                <Statistic
                  title="레코드"
                  value={week_comparison.current_records}
                  suffix="건"
                  valueStyle={{ fontSize: 16 }}
                />
                <div className="mt-xs">
                  {renderChange(week_comparison.records_change_percent)}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            size="small"
            title={
              <Space>
                <BarChartOutlined />
                이번 달 vs 지난 달
              </Space>
            }
          >
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="작업 시간"
                  value={formatDuration(
                    month_comparison.current_minutes,
                    time_format
                  )}
                  valueStyle={{ fontSize: 16 }}
                />
                <div className="mt-xs">
                  {renderChange(month_comparison.change_percent)}
                </div>
              </Col>
              <Col span={8}>
                <Statistic
                  title="세션"
                  value={month_comparison.current_sessions}
                  suffix="개"
                  valueStyle={{ fontSize: 16 }}
                />
                <div className="mt-xs">
                  {renderChange(month_comparison.sessions_change_percent)}
                </div>
              </Col>
              <Col span={8}>
                <Statistic
                  title="레코드"
                  value={month_comparison.current_records}
                  suffix="건"
                  valueStyle={{ fontSize: 16 }}
                />
                <div className="mt-xs">
                  {renderChange(month_comparison.records_change_percent)}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* ===== 요약 통계 ===== */}
      <Title level={5}>
        <FileTextOutlined /> 전체 요약
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="총 레코드"
              value={summary.total_records}
              prefix={<FileTextOutlined />}
              suffix="건"
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="총 세션"
              value={summary.total_sessions}
              prefix={<ClockCircleOutlined />}
              suffix="개"
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="총 시간"
              value={formatDuration(summary.total_minutes, time_format)}
              prefix={<FieldTimeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="완료됨"
              value={summary.completed_records}
              prefix={<CheckCircleOutlined />}
              suffix="건"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="삭제됨"
              value={summary.deleted_records}
              prefix={<DeleteOutlined />}
              suffix="건"
              valueStyle={{
                color: summary.deleted_records > 0 ? "#ff4d4f" : undefined,
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="레코드당 세션"
              value={summary.avg_sessions_per_record}
              prefix={<BranchesOutlined />}
              suffix="개"
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* ===== 생산성 지표 ===== */}
      <Title level={5}>
        <ThunderboltOutlined /> 생산성 지표
      </Title>
      <Row gutter={[16, 16]} className="!mb-xl">
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="일 평균"
              value={formatDuration(productivity.daily_avg_minutes, time_format)}
              valueStyle={{ fontSize: 16 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="주 평균 (5일)"
              value={formatDuration(
                productivity.weekly_avg_minutes,
                time_format
              )}
              valueStyle={{ fontSize: 16 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="월 평균 (22일)"
              value={formatDuration(
                productivity.monthly_avg_minutes,
                time_format
              )}
              valueStyle={{ fontSize: 16 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="일 평균 세션"
              value={productivity.daily_avg_sessions}
              suffix="개"
              valueStyle={{ fontSize: 16 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Tooltip title="가장 많이 일한 요일">
              <Statistic
                title="최고 생산 요일"
                value={productivity.most_productive_day}
                prefix={<TrophyOutlined className="!text-[#faad14]" />}
                valueStyle={{ fontSize: 16 }}
              />
            </Tooltip>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Tooltip title="가장 많이 일한 시간대">
              <Statistic
                title="최고 생산 시간"
                value={productivity.most_productive_hour}
                prefix={<TrophyOutlined className="!text-[#faad14]" />}
                valueStyle={{ fontSize: 16 }}
              />
            </Tooltip>
          </Card>
        </Col>
      </Row>

      {/* ===== 스트릭 & 활동일 ===== */}
      <Row gutter={[16, 16]} className="!mb-xl">
        <Col xs={12} sm={6}>
          <Card size="small">
            <Tooltip title="연속으로 작업한 일수 (오늘/어제 기준)">
              <Statistic
                title="현재 스트릭"
                value={productivity.streak_current}
                prefix={<FireOutlined className="!text-[#ff4d4f]" />}
                suffix="일"
                valueStyle={{
                  color: productivity.streak_current >= 5 ? "#ff4d4f" : undefined,
                }}
              />
            </Tooltip>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="최대 스트릭"
              value={productivity.streak_max}
              prefix={<FireOutlined className="!text-[#faad14]" />}
              suffix="일"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="활동일 수"
              value={productivity.active_days_count}
              suffix="일"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="총 기간"
              value={productivity.total_days_range}
              suffix="일"
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* ===== 세션 통계 ===== */}
      <Title level={5}>
        <ClockCircleOutlined /> 세션 통계
      </Title>
      <Row gutter={[16, 16]} className="!mb-xl">
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="평균 세션 시간"
              value={formatDuration(session_stats.average_minutes, time_format)}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="최장 세션"
              value={formatDuration(session_stats.longest_minutes, time_format)}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="최단 세션"
              value={formatDuration(session_stats.shortest_minutes, time_format)}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="세션 수"
              value={session_stats.total_count}
              suffix="개"
            />
          </Card>
        </Col>
      </Row>

      {/* ===== 세션 시간 분포 ===== */}
      <Card
        size="small"
        title="세션 시간 분포"
        className="!mb-xl"
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} md={4}>
            <div className="mb-sm">
              <Text>15분 미만</Text>
            </div>
            <Progress
              percent={Math.round(
                (session_distribution.under_15min / dist_total) * 100
              )}
              format={() => `${session_distribution.under_15min}개`}
              strokeColor="#ff4d4f"
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <div className="mb-sm">
              <Text>15-30분</Text>
            </div>
            <Progress
              percent={Math.round(
                (session_distribution.min_15_to_30 / dist_total) * 100
              )}
              format={() => `${session_distribution.min_15_to_30}개`}
              strokeColor="#faad14"
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <div className="mb-sm">
              <Text>30분-1시간</Text>
            </div>
            <Progress
              percent={Math.round(
                (session_distribution.min_30_to_60 / dist_total) * 100
              )}
              format={() => `${session_distribution.min_30_to_60}개`}
              strokeColor="#52c41a"
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <div className="mb-sm">
              <Text>1-2시간</Text>
            </div>
            <Progress
              percent={Math.round(
                (session_distribution.hour_1_to_2 / dist_total) * 100
              )}
              format={() => `${session_distribution.hour_1_to_2}개`}
              strokeColor="#1890ff"
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <div className="mb-sm">
              <Text>2시간 이상</Text>
            </div>
            <Progress
              percent={Math.round(
                (session_distribution.over_2hours / dist_total) * 100
              )}
              format={() => `${session_distribution.over_2hours}개`}
              strokeColor="#722ed1"
            />
          </Col>
        </Row>
      </Card>

      <Divider />

      {/* ===== 시간대별 & 요일별 분석 ===== */}
      <Row gutter={[24, 24]} className="!mb-xl">
        <Col xs={24} lg={12}>
          <Card size="small" title="시간대별 작업 패턴">
            <div className="flex items-end h-[150px] gap-[2px]">
              {hourly_stats.map((stat) => (
                <Tooltip
                  key={stat.hour}
                  title={
                    <div>
                      <div>{stat.label}</div>
                      <div>{formatDuration(stat.total_minutes, time_format)}</div>
                      <div>세션: {stat.session_count}개</div>
                    </div>
                  }
                >
                  <div
                    style={{
                      flex: 1,
                      backgroundColor:
                        stat.hour >= 9 && stat.hour < 18
                          ? "#1890ff"
                          : "#8c8c8c",
                      height: `${(stat.total_minutes / hourly_max) * 100}%`,
                      minHeight: stat.total_minutes > 0 ? 4 : 0,
                      borderRadius: 2,
                      opacity: stat.total_minutes > 0 ? 1 : 0.3,
                    }}
                  />
                </Tooltip>
              ))}
            </div>
            <div className="flex justify-between mt-sm">
              <Text type="secondary" className="!text-[11px]">
                0시
              </Text>
              <Text type="secondary" className="!text-[11px]">
                6시
              </Text>
              <Text type="secondary" className="!text-[11px]">
                12시
              </Text>
              <Text type="secondary" className="!text-[11px]">
                18시
              </Text>
              <Text type="secondary" className="!text-[11px]">
                24시
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card size="small" title="요일별 작업 패턴">
            <div className="flex items-end h-[150px] gap-sm">
              {weekday_stats.map((stat) => (
                <Tooltip
                  key={stat.weekday}
                  title={
                    <div>
                      <div>{stat.weekday_name}요일</div>
                      <div>{formatDuration(stat.total_minutes, time_format)}</div>
                      <div>세션: {stat.session_count}개</div>
                      <div>레코드: {stat.record_count}건</div>
                    </div>
                  }
                >
                  <div className="flex-1 flex flex-col items-center">
                    <div
                      style={{
                        width: "100%",
                        backgroundColor:
                          stat.weekday === 0 || stat.weekday === 6
                            ? "#ff4d4f"
                            : "#52c41a",
                        height: `${(stat.total_minutes / weekday_max) * 100}%`,
                        minHeight: stat.total_minutes > 0 ? 4 : 0,
                        borderRadius: 4,
                        marginBottom: 4,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        color:
                          stat.weekday === 0 || stat.weekday === 6
                            ? "#ff4d4f"
                            : undefined,
                      }}
                    >
                      {stat.weekday_name}
                    </Text>
                  </div>
                </Tooltip>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* ===== 시간별 차트 ===== */}
      <div className="mb-lg">
        <Space>
          <Title level={5} className="!m-0">
            작업 시간 추이
          </Title>
          <Segmented
            value={time_range}
            onChange={(value) => setTimeRange(value as TimeRange)}
            options={[
              { label: "일별", value: "daily" },
              { label: "주별", value: "weekly" },
              { label: "월별", value: "monthly" },
            ]}
          />
        </Space>
      </div>
      <Card size="small">
        <TimeChart
          data={chart_data}
          title={chart_title}
          height={250}
          show_labels={time_range !== "daily"}
          time_format={time_format}
        />
      </Card>

      <Divider />

      {/* ===== 완료율 통계 ===== */}
      <Title level={5}>
        <CheckCircleOutlined /> 완료율 분석
      </Title>
      <Row gutter={[16, 16]} className="!mb-xl">
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <div className="text-center">
              <Progress
                type="circle"
                percent={completion_stats.completion_rate}
                format={(p) => (
                  <div>
                    <div className="text-2xl font-bold">{p}%</div>
                    <div className="text-xs text-[#666]">완료율</div>
                  </div>
                )}
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="완료된 레코드"
              value={completion_stats.completed_records}
              suffix={`/ ${completion_stats.total_records}건`}
            />
            <div className="mt-sm">
              <Statistic
                title="평균 완료 시간"
                value={formatDuration(
                  completion_stats.avg_completion_time_minutes,
                  time_format
                )}
                valueStyle={{ fontSize: 16 }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card size="small" title="카테고리별 완료율">
            <Table
              dataSource={completion_stats.by_category}
              columns={completion_columns}
              rowKey="category"
              size="small"
              pagination={false}
              scroll={{ y: 200 }}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* ===== 딜/프로젝트 통계 ===== */}
      <Title level={5}>
        <PieChartOutlined /> 딜/프로젝트별 분석
      </Title>
      <Card size="small" className="!mb-xl">
        <Table
          dataSource={deal_stats}
          columns={deal_columns}
          rowKey="deal_name"
          size="small"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 600 }}
        />
      </Card>

      <Divider />

      {/* ===== 카테고리/작업명 분석 ===== */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card size="small" title="카테고리별 분석">
            <CategoryAnalysis
              category_stats={category_stats}
              work_name_stats={[]}
              time_format={time_format}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card size="small" title="작업명별 TOP 10">
            <CategoryAnalysis
              category_stats={[]}
              work_name_stats={work_name_stats}
              time_format={time_format}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default StatsDashboard;
