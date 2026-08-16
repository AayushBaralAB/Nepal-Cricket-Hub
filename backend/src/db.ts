import { MongoClient, Db, Collection, Document } from 'mongodb';
import { config } from './config';

/**
 * MongoDB access wrapper.
 *
 * The app connects lazily on startup via `connect()` (see jobs/bootstrap.ts).
 * Services read/write through `db.collection('...')` and never touch a raw
 * client, keeping the rest of the codebase independent of the driver API.
 */
export class MongoDatabase {
  private client: MongoClient | null = null;
  private mongoDb: Db | null = null;

  /** Whether MONGO_URL is present in the environment. */
  get isConfigured(): boolean {
    return Boolean(config.mongo.url);
  }

  /** Whether the client has successfully connected. */
  get isConnected(): boolean {
    return Boolean(this.mongoDb);
  }

  async connect(): Promise<void> {
    if (!this.isConfigured || this.mongoDb) return;
    this.client = new MongoClient(config.mongo.url, { serverSelectionTimeoutMS: 5000 });
    await this.client.connect();
    this.mongoDb = this.client.db(config.mongo.dbName || 'nepal_cricket_hub');
    await this.ensureIndexes();
  }

  /** Underlying Mongo `Db` handle (throws if not connected). */
  get raw(): Db {
    if (!this.mongoDb) throw new Error('MongoDB is not connected — call db.connect() first.');
    return this.mongoDb;
  }

  collection<T extends Document = Document>(name: string): Collection<T> {
    return this.raw.collection<T>(name);
  }

  async close(): Promise<void> {
    await this.client?.close().catch(() => undefined);
    this.client = null;
    this.mongoDb = null;
  }

  private async ensureIndexes(): Promise<void> {
    if (!this.mongoDb) return;
    const db = this.mongoDb;
    await Promise.all([
      db.collection('matches').createIndex({ externalId: 1 }, { unique: true }),
      db.collection('matches').createIndex({ status: 1 }),
      db.collection('matches').createIndex({ startTime: 1 }),
      db.collection('teams').createIndex({ externalId: 1 }, { unique: true }),
      db.collection('teams').createIndex({ slug: 1 }, { unique: true }),
      db.collection('series').createIndex({ externalId: 1 }, { unique: true }),
      db.collection('series').createIndex({ slug: 1 }, { unique: true }),
      db.collection('players').createIndex({ externalId: 1 }, { unique: true }),
      db.collection('players').createIndex({ slug: 1 }, { unique: true }),
      db.collection('news').createIndex({ originalGuid: 1 }),
      db.collection('news').createIndex({ slug: 1 }),
      db.collection('news').createIndex({ publishedAt: -1 }),
      db.collection('news').createIndex({ category: 1 }),
      db.collection('news_sources').createIndex({ url: 1 }, { unique: true }),
      db.collection('users').createIndex({ email: 1 }, { unique: true }),
      db.collection('site_settings').createIndex({ key: 1 }, { unique: true }),
      db.collection('sync_status').createIndex({ job: 1 }, { unique: true }),
      db.collection('points_table').createIndex({ seriesId: 1, teamId: 1 }, { unique: true }),
      db.collection('player_statistics').createIndex({ playerId: 1, format: 1 }, { unique: true }),
      db.collection('api_logs').createIndex({ createdAt: -1 }),
    ]);
  }
}

export const db = new MongoDatabase();
