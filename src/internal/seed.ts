// seed.ts
import { upsertItems } from "./ragdb";

const docs = [
    {
        id: "1",
        text: "Multiplication precedence bug: 2+3*4 returns 20 instead of 14",
        url: "local://issue/1",
        labels: ["parser", "precedence"],
        updatedAt: new Date().toISOString(),
    },
    {
        id: "2",
        text: "Division by zero returns Infinity, expected RangeError",
        url: "local://issue/2",
        labels: ["edge-case"],
        updatedAt: new Date().toISOString(),
    },
    {
        id: "3",
        text: "Square root of negative numbers: define NaN vs throw",
        url: "local://issue/3",
        labels: ["math"],
        updatedAt: new Date().toISOString(),
    },
];

await upsertItems(docs);
console.log("Seeded", docs.length, "items.");
