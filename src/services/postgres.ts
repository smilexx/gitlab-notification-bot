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

export const createChat = async (chatId: string, hash: string) => {
    const {rows: [chat]} = await pool.query('INSERT INTO chats(chat_id, hash) VALUES($1, $2) RETURNING *', [chatId, hash]);

    return chat;
}

export const getChat = async (chatId: string) => {
    const {rows: [chat]} = await pool.query(`SELECT * FROM chats WHERE chat_id like '${chatId}'`);

    return chat;
}

export const getChatByHash = async (hash: string) => {
    const {rows: [chat]} = await pool.query(`SELECT * FROM chats WHERE hash like '${hash}'`);

    return chat;
}

export const getBranches = async (chatId: string) => {
    const {rows = []} = await pool.query(`SELECT * FROM branches WHERE chat_id like '${chatId}'`)

    return rows;
}

export const createBranch = async (chatId: string, branch: string) => {
    const {rows: [result]} = await pool.query('INSERT INTO branches(chat_id, branch) VALUES($1, $2) RETURNING *', [chatId, branch]);

    return result;
}
