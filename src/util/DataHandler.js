import Logger from "./Logger";

export async function ProcessData(zipData) {
  try {
    ZIP_DATA = zipData;

    // Validate the ZIP data structure
    if (!zipData || !zipData.files) {
      throw new Error("Invalid ZIP data structure");
    }

    // List all files in the ZIP for debugging
    const fileList = Object.keys(zipData.files);
    console.log("Files in ZIP archive:", fileList);

    // Check for required data directory
    const dataFiles = fileList.filter((f) => f.startsWith("data/"));
    if (dataFiles.length === 0) {
      throw new Error(
        "No data directory found in ZIP archive. This may not be a valid Twitter archive.",
      );
    }

    console.log("Data files found:", dataFiles);

    // Verify this looks like a Twitter archive by checking for essential files
    const requiredFiles = ["data/account.js", "data/profile.js"];
    const tweetFile = fileList.some(
      (f) => f === "data/tweet.js" || f === "data/tweets.js",
    );

    if (!tweetFile) {
      throw new Error(
        "No tweet data file found. Expected 'data/tweet.js' or 'data/tweets.js'.",
      );
    }

    const missingRequired = requiredFiles.filter(
      (file) => !fileList.includes(file),
    );
    if (missingRequired.length > 0) {
      console.warn("Missing some expected files:", missingRequired);
      // Don't throw error for missing profile files as they might be optional in some archives
    }

    return {
      user: await getUser(),
      tweets: await getTweets(),
    };
  } catch (error) {
    LOGGER.error("Failed to process ZIP data:", error);
    throw error; // Re-throw to be handled by the calling component
  }
}

const LOGGER = new Logger("DataHandler");
let ZIP_DATA;
let ACCOUNT_ID;

async function fixJson(json) {
  try {
    if (!json || json.trim().length === 0) {
      throw new Error("Empty JSON content");
    }

    let makeArr = json.split(/\r?\n|\r|\n/g);

    if (makeArr.length === 0) {
      throw new Error("No content found in file");
    }

    makeArr.shift();
    makeArr.unshift("[");

    const jsonContent = makeArr.join(" ");
    console.log("Parsing JSON content, length:", jsonContent.length);

    const makeObj = JSON.parse(jsonContent);

    if (!Array.isArray(makeObj) || makeObj.length === 0) {
      throw new Error("Parsed JSON is not a valid array or is empty");
    }

    const getKey = Object.keys(makeObj[0])[0];
    makeArr = makeObj.map((item) => ({ ...item[`${getKey}`] }));
    return makeArr.length > 1 ? makeArr : makeArr[0];
  } catch (error) {
    LOGGER.error("Failed to parse JSON:", error);
    console.log(
      "Raw JSON content:",
      json ? json.substring(0, 500) + "..." : "null",
    );
    throw new Error(`JSON parsing failed: ${error.message}`);
  }
}

async function getFileFromZip(fileName, mediaType, isOptional = false) {
  try {
    const mediaExtensions = ["jpg", "png", "gif", "jpeg", "jiff", "mp4"];
    const fileLocation = `data/${fileName}`;
    let extension = fileName.split(".").pop();

    // Check if file exists in ZIP
    if (!ZIP_DATA.files[fileLocation]) {
      if (isOptional) {
        LOGGER.warn(`Optional file not found in ZIP: ${fileLocation}`);
        return null; // Return null for optional files instead of throwing
      } else {
        throw new Error(`File not found in ZIP: ${fileLocation}`);
      }
    }

    if (mediaExtensions.includes(extension)) {
      const untypedBlob = await ZIP_DATA.files[fileLocation].async("blob");
      const mediaBlob = new Blob([untypedBlob], { type: mediaType });
      return URL.createObjectURL(mediaBlob);
    } else {
      const rawData = await ZIP_DATA.files[fileLocation].async("string");
      console.log(
        "Processing file:",
        fileName,
        "Size:",
        rawData.length,
        "chars",
      );
      return await fixJson(rawData);
    }
  } catch (error) {
    LOGGER.error("Failed to get file from zip data", fileName, "Error", error);
    if (isOptional) {
      LOGGER.warn(`Skipping optional file due to error: ${fileName}`);
      return null;
    }
    throw error; // Re-throw for critical files
  }
}

async function getTweets() {
  // Check for both possible tweet file names
  const tweetFileExists = ZIP_DATA.file("data/tweet.js");
  const tweetsFileExists = ZIP_DATA.file("data/tweets.js");

  if (!tweetFileExists && !tweetsFileExists) {
    throw new Error(
      "No tweet data file found in archive. Expected 'tweet.js' or 'tweets.js' in data folder.",
    );
  }

  const tweetsFile = tweetFileExists ? "tweet.js" : "tweets.js";
  console.log("Using tweets file:", tweetsFile);

  const fileName = tweetsFile.substring(0, tweetsFile.lastIndexOf("."));
  const tweets = await getFileFromZip(tweetsFile);

  if (!Array.isArray(tweets)) {
    throw new Error("Tweet data is not in expected array format");
  }

  console.log("Processing", tweets.length, "tweets");

  for (let tweet of tweets) {
    // check for links and media in the tweet
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
    if (tweet.extended_entities) {
      tweet.media = await resolveMediaLinks(
        tweet.id,
        tweet.extended_entities.media,
        fileName,
      );
      tweet.full_text = tweet.full_text.replaceAll(
        tweet.extended_entities.media[0].url,
        "",
      );
    }

    // check if the tweet contains child tweets (aka threads) :)
    tweet.is_thread = checkForThread(tweets, tweet);
  }

  return tweets.map((tweet) => {
    return {
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
    };
  });
}

function resolveShortendLinks(text, urls) {
  urls.forEach((entity) => {
    text = text.replaceAll(
      entity.url,
      entity
        ? `<a class="text-orange-600" href="${entity.expanded_url}">${entity.expanded_url}</a>`
        : "<!BROKEN LINK!>",
    );
  });

  return text;
}

async function resolveMediaLinks(tweetId, media, fileName) {
  const resolvedMedia = [];
  for await (const entity of media) {
    let mediaName = "";
    let mediaType = "";
    switch (entity.type) {
      case "animated_gif":
      case "video":
        mediaName = entity.video_info.variants[0].url
          .split("/")
          .pop()
          .split("?")[0];
        mediaType = "video/mp4";
        break;
      case "photo":
      default:
        mediaName = entity.media_url.split("/").pop();
        mediaType = "image/png";
        break;
    }

    if (tweetId == "1507852341671870476" || tweetId == "1432010755428298752") {
      LOGGER.log(
        await getFileFromZip(
          `${fileName}_media/${tweetId}-${mediaName}`,
          mediaType,
          true, // Mark as optional
        ),
      );
    }

    // Mark media files as optional - if they don't exist, skip them instead of crashing
    const mediaData = await getFileFromZip(
      `${fileName}_media/${tweetId}-${mediaName}`,
      mediaType,
      true, // Mark as optional
    );

    // Only add media if it was successfully loaded
    if (mediaData) {
      resolvedMedia.push({
        type: entity.type,
        data: mediaData,
      });
    } else {
      LOGGER.warn(`Skipping missing media for tweet ${tweetId}: ${mediaName}`);
    }
  }

  return resolvedMedia;
}

function checkForThread(tweets, origin) {
  // Check if there are replies to this tweet (downwards)
  const hasReplies =
    tweets.filter(
      (tweet) =>
        tweet.in_reply_to_user_id === ACCOUNT_ID &&
        tweet.in_reply_to_status_id === origin.id,
    ).length > 0;

  // Check if this tweet is replying to another own tweet (upwards)
  const isReplyToOwnTweet =
    origin.in_reply_to_user_id === ACCOUNT_ID &&
    tweets.some((tweet) => tweet.id === origin.in_reply_to_status_id);

  return hasReplies || isReplyToOwnTweet;
}

async function getUser() {
  const account = await getAccount();
  ACCOUNT_ID = account.accountId;
  const profile = await getProfile();

  return {
    account,
    profile,
  };
}

async function getAccount() {
  return await getFileFromZip("account.js");
}

async function getProfile() {
  const profile = await getFileFromZip("profile.js");
  const file = profile.avatarMediaUrl
    .split("/")
    .pop()
    .split("#")[0]
    .split("?")[0];
  profile.Image = await getFileFromZip(
    `profile_media/${ACCOUNT_ID}-${file}`,
    "image/png",
  );

  return profile;
}
