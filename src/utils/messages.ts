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
        case 'error':
            return '🛑'
        default:
            return status;
    }

}
