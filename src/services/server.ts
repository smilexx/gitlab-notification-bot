import express from "express";

import {BOT_TOKEN, PORT} from "../config";
import {processUpdate, sendMessage} from "./telegram";
import {getStatus} from "../utils";
import {intervalToDuration, parseISO} from 'date-fns'

const getDuration = (startDate: string, endDate: string) => intervalToDuration({
    start: parseISO(startDate), end: parseISO(endDate)
})

const getBuild = ({
                      name,
                      status,
                      started_at,
                      finished_at
                  }) => `${getStatus(status)}: ${name} ${started_at && finished_at ? `(${getDuration(started_at, finished_at)})` : ''}`

export const startServer = async () => {
    const app = express();

    app.use(express.json());

    app.post(`/bot${BOT_TOKEN}`, (req, res) => {
        processUpdate(req.body);
        res.sendStatus(200);
    });

    app.post(`/notify/:chatId`, async (req, res) => {
        const {body} = req;
        const {project, user, commit, builds, object_attributes} = body || {};

        if (object_attributes.status !== 'pending') {
            const text = [
                `📽: ${project?.name}`,
                `👨‍💻: ${user?.name}`,
                `🎋: ${object_attributes?.ref}`,
                `💿: ${commit?.message}`,
                '',
                `⏲: ${getDuration(object_attributes?.created_at, object_attributes?.finished_at)}`,
                ...builds.map(getBuild)
            ]

            await sendMessage(req.params.chatId.toString(), text.join('\n'));
        }

        res.sendStatus(200);
    });

    app.listen(PORT);
}
