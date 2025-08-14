import { connect } from "@lancedb/lancedb";
import { Field, Schema, Utf8, Float32, FixedSizeList, List } from "apache-arrow";
import { embed } from "./emb";

export type Row = {
    id: string;          // unique key
    text: string;        // source text
    vector: number[];    // 384-d embedding (column MUST be named "vector")
    url?: string;
    labels?: string[];
    updatedAt?: string;
};

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, "../.ragdb");
const TABLE_NAME = "items";

export async function openTable() {
    const db = await connect(DB_DIR);

    // Create if missing — with an explicit Arrow schema
    try {
        return await db.openTable(TABLE_NAME);
    } catch {
        const dim = 384; // all-MiniLM-L6-v2
        const schema = new Schema([
            new Field("id", new Utf8(), false),
            new Field("text", new Utf8(), true),
            new Field("vector", new FixedSizeList(dim, new Field("item", new Float32(), true)), false),
            new Field("url", new Utf8(), true),
            new Field("labels", new List(new Field("item", new Utf8(), true)), true),
            new Field("updatedAt", new Utf8(), true),
        ]);
        // Create an empty table with the schema
        // (JS SDK supports createEmptyTable / createTable with schema)
        // @ts-ignore - both exist across versions; one will work.
        return (await (db.createEmptyTable?.(TABLE_NAME, schema) ?? db.createTable(TABLE_NAME, { schema })));
    }
}

/** Insert or replace by id (simple upsert via delete+add). */
export async function upsertItems(items: Array<Omit<Row, "vector"> & { vector?: number[] }>) {
    const table = await openTable();

    // delete existing ids first
    const ids = items.map((i) => i.id.replace(/'/g, "''"));
    if (ids.length) {
        await table.delete(`id IN (${ids.map((id) => `'${id}'`).join(",")})`);
    }

    // ensure vectors present
    const rows: Row[] = [];
    for (const it of items) {
        const vec = it.vector ?? (await embed(it.text));
        rows.push({ ...it, vector: vec } as Row);
    }
    console.log("Rows to insert:", rows);
    const res = await table.add(rows);

    console.log("Upserted:", res);

    // optional: build an ANN index for speed later (defaults are fine)
    // await table.createIndex("vector");
}

/** Search top-K nearest by cosine distance. Lower _distance = closer. */
export async function searchTopK(query: string, k = 5) {
    const table = await openTable();
    const q = await embed(query);

    const results = await (table.search(q) as any)
        .distanceType("cosine") // correct API
        .select(["id", "text", "url", "labels", "updatedAt"]) // _distance is auto-added
        .limit(k)
        .toArray();

    // expose a friendly similarity in [0,1] (cosine distance ≈ 1 - cosine similarity)
    return results.map((r: any) => ({
        id: r.id,
        text: r.text,
        url: r.url,
        labels: r.labels,
        updatedAt: r.updatedAt,
        distance: r._distance,
        similarity: 1 - r._distance,
    }));
}
