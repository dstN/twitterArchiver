import Logger from "./Logger";
import { getFileFromZip, fileExistsInZip } from "./ZipFileReader";
import { resolveMediaLinks, resolveShortendLinks } from "./MediaHandler";

const LOGGER = new Logger("TweetProcessor");

/**
 * Extracts and processes all tweets from the archive
 *
 * @param {import("./ZipArchive").ZipArchive} zipData - The loaded ZipArchive instance
 * @param {string} accountId - User's account ID for thread detection
 * @param {{lazyMedia?: boolean, onProgress?: Function}} [options]
 * @returns {Promise<Array>} Array of processed tweet objects
 * @throws {Error} If tweet file not found or data is invalid
 */
export async function getTweets(zipData, accountId, options = {}) {
  const { lazyMedia = false, onProgress } = options;

  // Check for both possible tweet file names
  const tweetFileExists = fileExistsInZip(zipData, "data/tweet.js");
  const tweetsFileExists = fileExistsInZip(zipData, "data/tweets.js");

  if (!tweetFileExists && !tweetsFileExists) {
    throw new Error(
      "No tweet data file found in archive. Expected 'tweet.js' or 'tweets.js' in data folder.",
    );
  }

  const tweetsFile = tweetFileExists ? "tweet.js" : "tweets.js";
  const fileName = tweetsFile.substring(0, tweetsFile.lastIndexOf("."));
  const tweets = await getFileFromZip(zipData, tweetsFile);

  if (!Array.isArray(tweets)) {
    throw new Error("Tweet data is not in expected array format");
  }

  const totalTweets = tweets.length;
  const totalMedia = tweets.reduce(
    (sum, tweet) => sum + (tweet.extended_entities?.media?.length || 0),
    0,
  );

  let processedTweets = 0;
  let processedMedia = 0;

  const emitProgress = () => {
    if (typeof onProgress !== "function") return;
    onProgress({
      stage: "tweets",
      current: processedTweets,
      total: totalTweets,
      media: {
        current: processedMedia,
        total: totalMedia,
      },
    });
  };

  emitProgress();

  // Process each tweet
  for (let tweet of tweets) {
    // Resolve shortened links
    if (
      tweet.entities &&
      tweet.entities.urls &&
      tweet.entities.urls.length &&
      !tweet.full_text.startsWith("RT")
    ) {
      tweet.full_text = resolveShortendLinks(
        tweet.full_text,
        tweet.entities.urls,
      );
      tweet.has_link = true;
    }

    // Resolve media links
    if (tweet.extended_entities) {
      tweet.media = await resolveMediaLinks(
        zipData,
        tweet.id,
        tweet.extended_entities.media,
        fileName,
        {
          lazy: lazyMedia,
          onMediaProcessed: () => {
            processedMedia += 1;
            if (
              typeof onProgress === "function" &&
              (processedMedia === totalMedia || processedMedia % 25 === 0)
            ) {
              emitProgress();
            }
          },
        },
      );
      // Remove media URL from tweet text
      tweet.full_text = tweet.full_text.replaceAll(
        tweet.extended_entities.media[0].url,
        "",
      );
    }

    // Check if tweet is part of a thread
    tweet.is_thread = checkForThread(tweets, tweet, accountId);

    processedTweets += 1;
    if (
      typeof onProgress === "function" &&
      (processedTweets === totalTweets || processedTweets % 50 === 0)
    ) {
      emitProgress();
    }

    if (lazyMedia && processedTweets % 250 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  emitProgress();

  // Return normalized tweet objects
  return tweets.map((tweet) => ({
    id: tweet.id,
    created_at: new Date(tweet.created_at),
    likes: Number(tweet.favorite_count),
    retweets: Number(tweet.retweet_count),
    is_thread: tweet.is_thread,
    full_text: tweet.full_text,
    has_link: !!tweet.has_link,
    media: tweet.media,
    in_reply_to_user_id: tweet.in_reply_to_user_id,
    in_reply_to_status_id: tweet.in_reply_to_status_id,
  }));
}

/**
 * Checks if a tweet is part of a thread (has replies or is a reply to own tweet)
 *
 * @param {Array} allTweets - All tweets in the archive
 * @param {Object} originTweet - The tweet to check
 * @param {string} accountId - User's account ID
 * @returns {boolean} True if tweet is part of a thread
 */
function checkForThread(allTweets, originTweet, accountId) {
  // Check if there are replies to this tweet (downwards)
  const hasReplies =
    allTweets.filter(
      (tweet) =>
        tweet.in_reply_to_user_id === accountId &&
        tweet.in_reply_to_status_id === originTweet.id,
    ).length > 0;

  // Check if this tweet is replying to another own tweet (upwards)
  const isReplyToOwnTweet =
    originTweet.in_reply_to_user_id === accountId &&
    allTweets.some((tweet) => tweet.id === originTweet.in_reply_to_status_id);

  return hasReplies || isReplyToOwnTweet;
}
