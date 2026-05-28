import api, { unwrapData } from './api';
import type { StatisticsOverview, StatisticsOverviewParams } from '../types/statistics';

export const statisticsService = {
  async getOverview(params?: StatisticsOverviewParams) {
    const response = await api.get('/statistics/overview', { params });
    return unwrapData<StatisticsOverview>(response);
  },
};