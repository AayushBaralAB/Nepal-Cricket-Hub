import { cricketData } from './CricketDataService';

export class SeriesService {
  list() {
    return cricketData.getSeries();
  }

  getBySlug(slug: string) {
    return cricketData.getSeriesBySlug(slug);
  }

  matchesForSeries(seriesId: string) {
    return cricketData.getMatches({ series: seriesId });
  }
}

export const seriesService = new SeriesService();
