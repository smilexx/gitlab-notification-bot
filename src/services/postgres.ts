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

export const createChat = async (chatId: string, hash: string) =>
    pool.query('INSERT INTO chats(chat_id, hash) VALUES($1, $2) RETURNING *', [chatId, hash])

export const getChat = async (chatId: string) =>
    pool.query(`SELECT * FROM chats WHERE chat_id like '${chatId}'`)

export const getChatByHash = async (hash: string) =>
    pool.query(`SELECT * FROM chats WHERE hash like '${hash}'`)
