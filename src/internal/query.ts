// query.ts
import { searchTopK } from "./ragdb";

const query = "order of operations wrong with addition and multiplication";
const hits = await searchTopK(query, 5);

console.log("Query:", query);
for (const h of hits) {
    console.log(`- ${h.id}  score=${h.similarity?.toFixed(3)}  ${h.url ?? ""}`);
    console.log(`  ${h.text.slice(0, 120)}\n`);
}
