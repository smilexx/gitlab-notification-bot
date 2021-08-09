export const getStatus = (status: string) => {
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
        case 'failed':
            return '🛑'
        default:
            return status;
    }

}
