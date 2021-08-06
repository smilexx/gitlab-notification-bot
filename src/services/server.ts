import express from "express";

import {BOT_TOKEN, PORT} from "../config";
import {processUpdate, sendMessage} from "./telegram";
import {getStatus} from "../utils";
import {getChatByHash} from "./postgres";
import {logger} from "./logger";

const getBuild = ({
                      name,
                      status,
                      started_at,
                      finished_at
                  }) => `${getStatus(status)}: ${name}`

export const startServer = async () => {
    const app = express();

    app.use(express.json());

    app.post(`/bot${BOT_TOKEN}`, (req, res) => {
        processUpdate(req.body);
        res.sendStatus(200);
    });

    app.post(`/notify/:hash`, async (req, res) => {
        logger.debug(req.body);

        const {body} = req;
        const {project, user, commit, builds, object_attributes} = body || {};

        const {rows: [chat]} = await getChatByHash(req.params.hash);

        logger.debug(chat);

        if (chat && object_attributes.status !== 'pending') {
            const text = [
                `📽: ${project?.name}`,
                `👨‍💻: ${user?.name}`,
                `🎋: ${object_attributes?.ref}`,
                `💿: ${commit?.message}`,
                '',
                // `⏲: ${getDuration(object_attributes?.created_at, object_attributes?.finished_at)}`,
                ...builds.map(getBuild)
            ]

            await sendMessage(chat?.chat_id, text.join('\n'));
        }

        res.sendStatus(200);
    });

    app.listen(PORT);
}
