import { ObjectId } from 'mongodb';

/**
 * Helpers for translating between Mongo documents and the camelCase domain
 * objects the REST API exposes.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyDoc = { _id: ObjectId } & Record<string, any>;

/** Convert a Mongo document's `_id` into a string `id` (top level only). */
export function toPlain<T extends AnyDoc>(doc: T): Omit<T, '_id'> & { id: string } {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id instanceof ObjectId ? _id.toHexString() : String(_id) };
}

export function toPlainMany<T extends AnyDoc>(docs: T[]): Array<Omit<T, '_id'> & { id: string }> {
  return docs.map(toPlain);
}

/** Build a Mongo `_id` filter, rejecting invalid ids with a clear message. */
export function idFilter(id: string): { _id: ObjectId } {
  if (!ObjectId.isValid(id)) {
    throw new Error(`Invalid document id: "${id}"`);
  }
  return { _id: new ObjectId(id) };
}
