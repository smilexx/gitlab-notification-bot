import {connectDatabase, logger, startBot, startServer} from './services';

const main = async () => {
    await connectDatabase();
    await startBot();
    await startServer();
}

main().catch((e) => {
    logger.error(e);

    process.exit(1);
});
