import { cricketData } from './CricketDataService';

export class PointsTableService {
  getForSeries(seriesId: string) {
    return cricketData.getPointsTable(seriesId);
  }

  getBySeriesSlug(slug: string) {
    const series = cricketData.getSeriesBySlug(slug);
    if (!series) return [];
    return cricketData.getPointsTable(series.externalId);
  }

  listAvailable() {
    return cricketData
      .getSeries()
      .filter((s) => s.pointsTableAvailable)
      .map((s) => ({ id: s.externalId, name: s.name, slug: s.slug }));
  }
}

export const pointsTableService = new PointsTableService();
