import {Pool} from "pg";
import {DATABASE_URL} from "../config";

export const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export const connectDatabase = async () => {
    await pool.connect();
}
