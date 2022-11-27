import Logger from './Logger';

export async function ProcessData(zipData) {
  ZIP_DATA = zipData;
  return {
    user: await getUser(),
    tweets: await getTweets()
  };
}

const LOGGER = new Logger("DataHandler");
let ZIP_DATA;
let ACCOUNT_ID;

async function fixJson(json) {
  let makeArr = json.split(/\r?\n|\r|\n/g);
  makeArr.shift();
  makeArr.unshift("[");
  const makeObj = JSON.parse(makeArr.join(" "));
  const getKey = Object.keys(makeObj[0])[0];
  makeArr = makeObj.map((item) => ({ ...item[`${getKey}`] }));
  return makeArr.length > 1 ? makeArr : makeArr[0];
}

async function getFileFromZip(fileName, mediaType) {
  try {
    const mediaExtensions = ["jpg", "png", "gif", "jpeg", "jiff", "mp4"];
    const fileLocation = `data/${fileName}`;
    let extension = fileName.split(".").pop();

    if (mediaExtensions.includes(extension)) {
      const untypedBlob = await ZIP_DATA.files[fileLocation].async("blob");
      const mediaBlob = new Blob([untypedBlob], { type: mediaType })
      return URL.createObjectURL(mediaBlob)
    } else {
      const rawData = await ZIP_DATA.files[fileLocation].async("string");
      return await fixJson(rawData);
    }
  } catch (error) {
    LOGGER.error('Failed to get file from zip data', fileName, 'Error', error)
  }
}

async function getTweets() {
  const tweetsFile = ZIP_DATA.file("data/tweet.js") ? "tweet.js" : "tweets.js";
  const tweets = await getFileFromZip(tweetsFile);

  for (let tweet of tweets) {
    // check for links and media in the tweet
    if (tweet.entities.urls.length && !tweet.full_text.startsWith("RT")) {
      tweet.full_text = resolveShortendLinks(tweet.full_text, tweet.entities.urls);
    }
    if (tweet.extended_entities) {
      tweet.media = await resolveMediaLinks(tweet.id, tweet.extended_entities.media);
      tweet.full_text = tweet.full_text.replaceAll(tweet.extended_entities.media[0].url, "");
    }

    // check if the tweet contains child tweets (aka threads) :)
    tweet.is_thread = checkForThread(tweets, tweet);
  }

  return tweets.map((tweet => {
    return {
      id: tweet.id,
      created_at: new Date(tweet.created_at),
      is_thread: tweet.is_thread,
      full_text: tweet.full_text,
      media: tweet.media,
      in_reply_to_user_id: tweet.in_reply_to_user_id,
      in_reply_to_status_id: tweet.in_reply_to_status_id
    }
  }))
}

function resolveShortendLinks(text, urls) {
  urls.forEach(entity => {
    text = text.replaceAll(
      entity.url,
      entity ? `<a class="text-blue-400" href="${entity.expanded_url}">${entity.expanded_url}</a>` : '<!BROKEN LINK!>'
    );
  });

  return text;
}

async function resolveMediaLinks(tweetId, media) {
  const resolvedMedia = []
  for await (const entity of media) {
    let mediaName = "";
    let mediaType = "";
    switch (entity.type) {
      case "animated_gif":
      case "video":
        mediaName = entity.video_info.variants[0].url.split("/").pop().split("?")[0];
        mediaType = "video/mp4";
        break;
      case "photo":
      default:
        mediaName = entity.media_url.split("/").pop();
        mediaType = "image/png";
        break;
    }

    resolvedMedia.push({
      type: entity.type,
      data: await getFileFromZip(`tweet_media/${tweetId}-${mediaName}`, mediaType)
    });
  };

  return resolvedMedia;
}

function checkForThread(tweets, origin) {
  return tweets.filter(
    tweet => tweet.in_reply_to_user_id === ACCOUNT_ID && tweet.in_reply_to_status_id === origin.id
  ).length > 0
}

async function getUser() {
  const account = await getAccount();
  ACCOUNT_ID = account.accountId;
  const profile = await getProfile()

  return {
    account,
    profile
  }
}

async function getAccount() {
  return await getFileFromZip("account.js");
}

async function getProfile() {
  const profile = await getFileFromZip("profile.js");
  const file = profile.avatarMediaUrl.split("/").pop().split("#")[0].split("?")[0];
  profile.Image = await getFileFromZip(`profile_media/${ACCOUNT_ID}-${file}`, "image/png");

  return profile;
}