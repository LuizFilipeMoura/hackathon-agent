// emb.ts
import {pipeline} from "@xenova/transformers";
import {saveJsonToFile} from "./agent";

// (Optional) run fully offline after first download by pinning a local folder:
// env.localModelPath = "./models"; // then prefetch below and keep the files.
// Tips: env.backends.onnx.wasm.numThreads = 4; // tune CPU threads

let _pipe: any;

async function getPipe() {
    if (_pipe) return _pipe;
    // All‑MiniLM‑L6‑v2 = 384‑dim sentence embeddings, fast & solid
    _pipe = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    return _pipe;
}

/** Returns a normalized embedding vector for a single string */
export async function embed(text: string): Promise<number[]> {
    const pipe = await getPipe();
    // The pipeline supports pooling/normalize options for sentence embeddings
    const output = await pipe(text, {pooling: "mean", normalize: true});
    // output is a TypedArray
    return Array.from(output.data as Float32Array);
}



// export function cosine(a: number[], b: number[]) {
//     let dot = 0, na = 0, nb = 0;
//     for (let i = 0; i < a.length; i++) {
//         dot += a[i] * b[i];
//         na += a[i] * a[i];
//         nb += b[i] * b[i];
//     }
//     return dot / (Math.sqrt(na) * Math.sqrt(nb));
// }
//
// const jsons = [
//     {id: 1, title: "Multiplication precedence bug", body: "2+3*4 returns 20 instead of 14"},
//     {id: 2, title: "Division by zero returns Infinity", body: "divide(5,0) should throw RangeError"},
//     {id: 3, title: "Square root negative", body: "sqrt(-1) should return NaN or throw"}
// ];
//
// async function main() {
//     const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
//
//     // Embed the dataset
//     const embedded = [];
//     for (const item of jsons) {
//         const text = `${item.title}\n\n${item.body}`;
//         const output = await extractor(text, { pooling: "mean", normalize: true });
//         embedded.push({ ...item, embedding: Array.from(output.data as Float32Array) });
//     }
//
//     // Example query
//     const query = "order of operations wrong in addition and multiplication";
//     const queryOutput = await extractor(query, { pooling: "mean", normalize: true });
//     const queryEmbedding = Array.from(queryOutput.data as Float32Array);
//
//     // Compare query to each item
//     const scored = embedded
//         .map(doc => ({
//             id: doc.id,
//             title: doc.title,
//             score: cosine(queryEmbedding, doc.embedding)
//         }))
//         .sort((a, b) => b.score - a.score);
//
//     console.log(`Query: "${query}"\n`);
//     console.log("Similarity scores:");
//     for (const s of scored) {
//         console.log(`ID ${s.id} — ${s.title} → ${s.score.toFixed(3)}`);
//     }
// }
//
// main();
