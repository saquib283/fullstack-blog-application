export function timeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) {
        return Math.floor(interval) + (Math.floor(interval) === 1 ? " year ago" : " years ago");
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + (Math.floor(interval) === 1 ? " month ago" : " months ago");
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + (Math.floor(interval) === 1 ? " day ago" : " days ago");
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + (Math.floor(interval) === 1 ? " hour ago" : " hours ago");
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + (Math.floor(interval) === 1 ? " minute ago" : " minutes ago");
    }
    return Math.floor(seconds) + (Math.floor(seconds) === 1 ? " second ago" : " seconds ago");
}