// db-info.ts
import {openTable} from "./ragdb";

(async () => {

    const tbl = await openTable();
    const count = await tbl.countRows();
    console.log(`\nTable: ${tbl} — rows: ${count}`);
})();
