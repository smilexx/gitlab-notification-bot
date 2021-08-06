import express from 'express'

import {bot, logger, startBot} from './services';
import {BOT_TOKEN, PORT} from './config'

const getStatus = (status: string) => {
    switch (status) {
        case 'created':
            return '⏸';
        case 'canceled':
            return '⏹';
        case 'pending':
            return '🕙'
        case 'running':
            return '▶️'
        case 'success':
            return '✅'
        case 'error':
            return '🛑'
        default:
            return status;
    }

}

const main = async () => {
    // await connectDatabase();
    await startBot();

    const app = express();

    app.use(express.json());

    app.post(`/bot${BOT_TOKEN}`, (req, res) => {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    });

    app.post(`/notify/:chatId`, (req, res) => {
        const {body} = req;
        const {project, user, commit, builds, object_attributes} = body || {};

        if (object_attributes.status !== 'pending') {
            const text = [
                `📽: ${project?.name}`,
                `👨‍💻: ${user?.name}`,
                `🎋: ${object_attributes?.ref}`,
                `💿: ${commit?.message}`,
                '',
                ...builds.map(({name, status}) => `${getStatus(status)}: ${name}`)
            ]

            bot.sendMessage(req.params.chatId.toString(), text.join('\n'));
        }

        res.sendStatus(200);
    });

    app.listen(PORT);
}

main().catch((e) => {
    logger.error(e);

    process.exit(1);
});
