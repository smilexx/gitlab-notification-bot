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

const notifyPipeline = async (chat: Record<string, any>, body: Record<string, any>) => {
    const {project, user, commit, builds, object_attributes} = body || {};

    const branches = await getBranches(chat?.chat_id);

    if (branches.length > 0 && !branches.find(({branch}) => object_attributes?.ref.search(branch) > -1)) {
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
}

const notifyTag = async (chat, body) => {
    const {ref, project, total_commits_count} = body || {};

    const tag = ref.split('/').pop();

    if (chat && total_commits_count > 0) {
        await sendMessage(chat?.chat_id, `${project?.name}: <a href="${project?.web_url}/-/tags/${tag}">${tag}</a>`);
    }
}

export const startServer = async () => {
    const app = express();

    app.use(express.json());

    app.post(`/bot${BOT_TOKEN}`, (req, res) => {
        logger.debug(req.body);

        processUpdate(req.body);
        res.sendStatus(200);
    });

    app.post(`/notify/:hash`, async (req, res) => {
        logger.debug(req.body);

        const {body} = req;
        const {object_kind} = body || {};

        const chat = await getChatByHash(req.params.hash);

        switch (object_kind) {
            case 'pipeline': {
                await notifyPipeline(chat, body)
                break;
            }

            case 'tag_push': {
                await notifyTag(chat, body);
                break;
            }
        }

        res.sendStatus(200);
    });

    app.listen(PORT);
}
