import { ObjectId } from 'mongodb';
import { db } from '../db';
import { logger } from '../utils/logger';
import { nowIso } from '../utils/helpers';

export interface Photo {
  _id?: ObjectId;
  title: string;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  photographer?: string;
  matchId?: string;
  tags: string[];
  uploadedAt: string;
}

const SEED_PHOTOS: Omit<Photo, '_id' | 'uploadedAt'>[] = [
  { title: 'Nepal vs India T20 - Final Over Drama', url: 'https://placehold.co/1200x800/1a1a2e/ffffff?text=Cricket+Final+Over', thumbnailUrl: 'https://placehold.co/400x300/1a1a2e/ffffff?text=Final+Over', caption: 'A thrilling final over in the Nepal vs India T20 match', photographer: 'CricketHub', tags: ['nepal', 't20', 'india'], matchId: 'match-001' },
  { title: 'Sandeep Lamichhane Bowling', url: 'https://placehold.co/1200x800/16213e/ffffff?text=Lamichhane+Ball', thumbnailUrl: 'https://placehold.co/400x300/16213e/ffffff?text=Lamichhane', caption: 'Sandeep Lamichhane in his iconic bowling action', photographer: 'CricketHub', tags: ['nepal', 'player', 'bowling'], matchId: 'match-002' },
  { title: 'Kirtipur Stadium Packed Crowd', url: 'https://placehold.co/1200x800/0f3460/ffffff?text=Kirtipur+Stadium', thumbnailUrl: 'https://placehold.co/400x300/0f3460/ffffff?text=Kirtipur', caption: 'The electric atmosphere at TU Cricket Ground, Kirtipur', photographer: 'CricketHub', tags: ['nepal', 'stadium', 'crowd'] },
  { title: 'NPL Opening Ceremony', url: 'https://placehold.co/1200x800/e94560/ffffff?text=NPL+Ceremony', thumbnailUrl: 'https://placehold.co/400x300/e94560/ffffff?text=NPL+Ceremony', caption: 'Grand opening ceremony of Nepal Premier League', photographer: 'CricketHub', tags: ['npl', 'ceremony', 'nepal'], matchId: 'match-003' },
  { title: 'Rohit Paudel century celebration', url: 'https://placehold.co/1200x800/533483/ffffff?text=Paudel+100', thumbnailUrl: 'https://placehold.co/400x300/533483/ffffff?text=Paudel', caption: 'Rohit Paudel celebrates his maiden ODI century', photographer: 'CricketHub', tags: ['nepal', 'player', 'batsman'] },
  { title: 'Women cricket team huddle', url: 'https://placehold.co/1200x800/1a1a2e/e94560?text=Women+Cricket', thumbnailUrl: 'https://placehold.co/400x300/1a1a2e/e94560?text=Women', caption: 'Nepal women cricket team in a strategic huddle', photographer: 'CricketHub', tags: ['nepal', 'women', 'team'] },
  { title: 'T20 World Cup Qualifier action', url: 'https://placehold.co/1200x800/0f3460/e94560?text=WC+Qualifier', thumbnailUrl: 'https://placehold.co/400x300/0f3460/e94560?text=Qualifier', caption: 'Nepal in action during the T20 World Cup Qualifier', photographer: 'CricketHub', tags: ['nepal', 'world cup', 't20'], matchId: 'match-004' },
  { title: 'Stumpings and catches compilation', url: 'https://placehold.co/1200x800/16213e/e94560?text=Wicketkeeper', thumbnailUrl: 'https://placehold.co/400x300/16213e/e94560?text=Wicketkeeper', caption: 'Brilliant wicketkeeping behind the stumps', photographer: 'CricketHub', tags: ['nepal', 'wicketkeeper', 'fielding'] },
  { title: 'Pokhara Avengers vs Chitwan Rhinos', url: 'https://placehold.co/1200x800/533483/ffffff?text=NPL+Match', thumbnailUrl: 'https://placehold.co/400x300/533483/ffffff?text=NPL+Match', caption: 'High-octane NPL clash between Pokhara and Chitwan', photographer: 'CricketHub', tags: ['npl', 'nepal', 'franchise'], matchId: 'match-005' },
  { title: 'Karan KC bowling yorker', url: 'https://placehold.co/1200x800/e94560/ffffff?text=Karan+KC', thumbnailUrl: 'https://placehold.co/400x300/e94560/ffffff?text=Karan+KC', caption: 'Karan KC delivers a perfect yorker', photographer: 'CricketHub', tags: ['nepal', 'player', 'bowling'], matchId: 'match-006' },
];

export class GalleryService {
  private seeded = false;

  async seed(): Promise<void> {
    if (!db.isConfigured || this.seeded) return;
    const count = await db.collection<Photo>('photos').countDocuments();
    if (count > 0) {
      this.seeded = true;
      return;
    }
    const docs = SEED_PHOTOS.map((p) => ({ ...p, uploadedAt: nowIso() }));
    await db.collection<Photo>('photos').insertMany(docs as Photo[]);
    this.seeded = true;
    logger.info('gallery', `Seeded ${docs.length} sample photos`);
  }

  async addPhoto(data: Omit<Photo, '_id' | 'uploadedAt'>): Promise<{ id: string }> {
    if (!db.isConfigured) throw new Error('Database not configured');
    const result = await db.collection<Photo>('photos').insertOne({
      ...data,
      uploadedAt: nowIso(),
    });
    logger.info('gallery', `Photo added: ${data.title}`);
    return { id: String(result.insertedId) };
  }

  async getPhotos(filter?: { tag?: string; matchId?: string; limit?: number }): Promise<Photo[]> {
    if (!db.isConfigured) return [];
    const query: Record<string, unknown> = {};
    if (filter?.tag) query.tags = filter.tag;
    if (filter?.matchId) query.matchId = filter.matchId;
    let cursor = db.collection<Photo>('photos').find(query).sort({ uploadedAt: -1 });
    if (filter?.limit) cursor = cursor.limit(filter.limit);
    return cursor.toArray();
  }

  async getPhotosByMatch(matchId: string): Promise<Photo[]> {
    return this.getPhotos({ matchId });
  }

  async getPhotosByTag(tag: string): Promise<Photo[]> {
    return this.getPhotos({ tag });
  }
}

export const galleryService = new GalleryService();
