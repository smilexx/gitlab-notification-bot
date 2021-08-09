import express from "express";

import {BOT_TOKEN, PORT} from "../config";
import {processUpdate, sendMessage} from "./telegram";
import {getStatus} from "../utils";
import {getBranches, getChatByHash} from "./postgres";
import {logger} from "./logger";
import {__, includes, pipe, prop} from "ramda";

const getBuild = ({
                      id,
                      name,
                      status,
                      started_at,
                      finished_at
                  }, {web_url}) => `${getStatus(status)}: <a href="${web_url}/-/jobs/${id}">${name}</a>`

const isNotifyStatus = pipe(prop('status'), includes(__, ['success', 'failed']))

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

        const chat = await getChatByHash(req.params.hash);

        const branches = await getBranches(chat?.chat_id);

        if (branches.length > 0 && !branches.find(({branch}) => object_attributes?.ref.search(branch) > -1)) {
            res.sendStatus(200);
            return null;
        }

        logger.debug(chat);

        if (chat && isNotifyStatus(object_attributes)) {
            const text = [
                getStatus(object_attributes.status),
                `📽: ${project?.name}`,
                `👨‍💻: ${user?.name}`,
                `🎋: ${object_attributes?.ref}`,
                `💿: ${commit?.message}`,
                '',
                // `⏲: ${getDuration(object_attributes?.created_at, object_attributes?.finished_at)}`,
                ...builds.map((build) => getBuild(build, project)),
                '',
                `${project?.web_url}/pipelines/${object_attributes?.id}`
            ]

            await sendMessage(chat?.chat_id, text.join('\n'));
        }

        res.sendStatus(200);
    });

    app.listen(PORT);
}
