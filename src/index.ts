import {connectDatabase, logger, startBot,} from './services';

const main = async () => {
    await connectDatabase();
    await startBot();
}

main().catch((e) => {
    logger.error(e);

    process.exit(1);
});
