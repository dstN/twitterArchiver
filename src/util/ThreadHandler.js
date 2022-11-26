export function GetThread(accountId, tweets, originId) {
    const thread = { upwards: [], downwards: [] };
    let nextId = originId;

    // downwards the origin
    while (nextId) {
        const tweet = tweets.find(tweet => tweet.in_reply_to_user_id === accountId && tweet.in_reply_to_status_id === nextId);
        if (tweet) {
            nextId = tweet.id;
            thread.downwards.push(tweet);
        } else {
            nextId = undefined;
        }
    }

    // upwards the origin
    nextId = originId;
    do {
        const tweet = tweets.find(tweet => tweet.id === nextId);
        if (tweet) {
            nextId = tweet.in_reply_to_status_id;
            if (nextId === originId) continue;
            thread.upwards.push(tweet);
        } else {
            nextId = undefined;
        }
    } while (nextId);

    return thread;
}