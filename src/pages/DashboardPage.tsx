import { AppstoreOutlined, BarChartOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, Col, DatePicker, Empty, Row, Select, Space, Spin, Statistic, Tabs, Tag, Typography, message } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../App';
import AppLayout from '../components/AppLayout';
import PostsTab from '../components/PostsTab';
import ProductsTab from '../components/ProductsTab';
import UsersTab from '../components/UsersTab';
import { statisticsService } from '../services/statistics.service';
import type { StatisticsMetric, StatisticsOverview, StatisticsPeriod } from '../types/statistics';

const periodOptions: { label: string; value: StatisticsPeriod }[] = [
  { label: 'Theo ngày', value: 'day' },
  { label: 'Theo tuần', value: 'week' },
  { label: 'Theo tháng', value: 'month' },
];

const periodLabel: Record<StatisticsPeriod, string> = {
  day: 'ngày',
  week: 'tuần',
  month: 'tháng',
};

function renderGrowth(metric: StatisticsMetric) {
  const color = metric.trend === 'increase' ? 'green' : metric.trend === 'decrease' ? 'red' : 'default';

  return (
    <Tag color={color}>
      {metric.change >= 0 ? '+' : ''}
      {metric.change} ({metric.growthRate}%)
    </Tag>
  );
}

function formatRange(value?: string) {
  return value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '-';
}

function StatisticsTab() {
  const [period, setPeriod] = useState<StatisticsPeriod>('day');
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [overview, setOverview] = useState<StatisticsOverview>();
  const [loading, setLoading] = useState(false);

  const loadOverview = async (nextPeriod = period, nextDate = date) => {
    try {
      setLoading(true);
      const data = await statisticsService.getOverview({
        period: nextPeriod,
        date: nextDate.format('YYYY-MM-DD'),
      });
      setOverview(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không tải được thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview(period, date);
  }, [period, date]);

  const picker = period === 'day' ? 'date' : period;

  return (
    <div className="statistics-panel">
      <div className="statistics-toolbar">
        <div>
          <Typography.Title level={4}>Thống kê tổng quan</Typography.Title>
          <Typography.Text type="secondary">Admin xem toàn hệ thống, user thường xem dữ liệu của chính user.</Typography.Text>
        </div>
        <Space wrap>
          <Select value={period} options={periodOptions} onChange={setPeriod} />
          <DatePicker value={date} picker={picker} format="DD/MM/YYYY" onChange={(value) => setDate(value || dayjs())} allowClear={false} />
        </Space>
      </div>

      <Spin spinning={loading}>
        {overview ? (
          <Space direction="vertical" className="w-100" size="large">
            <Card size="small" className="statistics-range-card">
              <Typography.Text strong>
                Kỳ hiện tại ({periodLabel[overview.period]}): {formatRange(overview.range.currentStart)} - {formatRange(overview.range.currentEnd)}
              </Typography.Text>
              <br />
              <Typography.Text type="secondary">
                Kỳ trước: {formatRange(overview.range.previousStart)} - {formatRange(overview.range.previousEnd)}
              </Typography.Text>
            </Card>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card className="stat-card">
                  <Statistic title="Sản phẩm mới" value={overview.created.products.current} suffix={renderGrowth(overview.created.products)} />
                  <Typography.Text type="secondary">Kỳ trước: {overview.created.products.previous}</Typography.Text>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="stat-card">
                  <Statistic title="Bài đăng mới" value={overview.created.posts.current} suffix={renderGrowth(overview.created.posts)} />
                  <Typography.Text type="secondary">Kỳ trước: {overview.created.posts.previous}</Typography.Text>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="stat-card">
                  <Statistic title="Người dùng mới" value={overview.created.users.current} suffix={renderGrowth(overview.created.users)} />
                  <Typography.Text type="secondary">Kỳ trước: {overview.created.users.previous}</Typography.Text>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card className="stat-card">
                  <Statistic title="Tổng sản phẩm" value={overview.totals.products} />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="stat-card">
                  <Statistic title="Tổng bài đăng" value={overview.totals.posts} />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="stat-card">
                  <Statistic title="Tổng người dùng" value={overview.totals.users} />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Trạng thái bài đăng" className="stat-card">
                  <Space wrap>
                    <Tag color="green">Đã post: {overview.posts.posted}</Tag>
                    <Tag color="orange">Đang chờ: {overview.posts.pending}</Tag>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Liên kết bài đăng của sản phẩm" className="stat-card">
                  <Space wrap>
                    <Tag color="green">Đã gắn với bài đăng: {overview.products.linked}</Tag>
                    <Tag color="orange">Chưa gắn với bài đăng: {overview.products.unlinked}</Tag>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Space>
        ) : (
          <Empty description="Chưa có dữ liệu thống kê" />
        )}
      </Spin>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const items = useMemo(
    () => [
      {
        key: 'statistics',
        label: (
          <span>
            <BarChartOutlined /> Thống kê
          </span>
        ),
        children: <StatisticsTab />,
      },
      {
        key: 'products',
        label: (
          <span>
            <AppstoreOutlined /> Kho sản phẩm
          </span>
        ),
        children: <ProductsTab />,
      },
      {
        key: 'posts',
        label: (
          <span>
            <FileTextOutlined /> Kho bài đăng
          </span>
        ),
        children: <PostsTab />,
      },
      ...(user?.role === 'admin'
        ? [
            {
              key: 'users',
              label: (
                <span>
                  <TeamOutlined /> Quản lý người dùng
                </span>
              ),
              children: <UsersTab />,
            },
          ]
        : []),
    ],
    [user?.role],
  );

  return (
    <AppLayout>
      <Card className="dashboard-card">
        <Tabs defaultActiveKey="statistics" items={items} />
      </Card>
    </AppLayout>
  );
}