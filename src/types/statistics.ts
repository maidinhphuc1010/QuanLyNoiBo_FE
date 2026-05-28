export type StatisticsPeriod = 'day' | 'week' | 'month';

export type StatisticsTrend = 'increase' | 'decrease' | 'stable';

export interface StatisticsRange {
  currentStart: string;
  currentEnd: string;
  previousStart: string;
  previousEnd: string;
}

export interface StatisticsMetric {
  current: number;
  previous: number;
  change: number;
  growthRate: number;
  trend: StatisticsTrend;
}

export interface StatisticsOverview {
  period: StatisticsPeriod;
  range: StatisticsRange;
  created: {
    products: StatisticsMetric;
    posts: StatisticsMetric;
    users: StatisticsMetric;
  };
  totals: {
    products: number;
    posts: number;
    users: number;
  };
  posts: {
    posted: number;
    pending: number;
  };
  products: {
    linked: number;
    unlinked: number;
  };
}

export interface StatisticsOverviewParams {
  period?: StatisticsPeriod;
  date?: string;
}