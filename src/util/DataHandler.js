export async function ProcessData(zipData) {
  ZIP_DATA = zipData;
  return {
    tweets: await getTweets(),
    user: await getUser()
  };
}

let ZIP_DATA;

async function fixJson(json) {
  let makeArr = json.split(/\r?\n|\r|\n/g);
  makeArr.shift();
  makeArr.unshift("[");
  const makeObj = JSON.parse(makeArr.join(" "));
  const getKey = Object.keys(makeObj[0])[0];
  makeArr = makeObj.map((item) => ({ ...item[`${getKey}`] }));
  return makeArr.length > 1 ? makeArr : makeArr[0];
}

async function getFileFromZip(fileName) {
  const mediaExtensions = ["jpg", "png", "gif", "jpeg", "jiff", "mp4"];
  const fileLocation = `data/${fileName}`;
  let extension = fileName.split(".").pop();

  if (mediaExtensions.includes(extension)) {
    const rawData = await ZIP_DATA.files[fileLocation].async("blob");
    return URL.createObjectURL(rawData);
  } else {
    const rawData = await ZIP_DATA.files[fileLocation].async("string");
    return await fixJson(rawData);
  }
}

async function getTweets() {
  const tweetsFile = ZIP_DATA.file("data/tweet.js") ? "tweet.js" : "tweets.js";
  const tweets = await getFileFromZip(tweetsFile);

  const regex =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gm;

  for (let tweet of tweets) {
    const result = tweet.full_text.matchAll(regex);

    for (const match of result) {
      if (tweet.entities.urls.length) {
        tweet.full_text = resolveShortendLinks(tweet.full_text, tweet.entities.urls, match[0]);
      } else {
        resolveMediaLinks();
      }
    }
  }

  console.log(tweets[0])

  return tweets;
}

function resolveShortendLinks(text, urls, urlMatch) {
  const entity = urls.find(obj => obj.url === urlMatch);
  text = text.replaceAll(
    urlMatch,
    entity ? entity.expanded_url : '!!!LINK COULD NOT BE RESOLVED!!!'
  );

  return text;
}

function resolveMediaLinks() {
  //TODO
}

async function getUser() {
  const account = await getAccount();
  const profile = await getProfile(account.accountId)

  return {
    account,
    profile
  }
}

async function getAccount() {
  return await getFileFromZip("account.js");
}

async function getProfile(id) {
  const profile = await getFileFromZip("profile.js");
  const file = profile.avatarMediaUrl.split("/").pop().split("#")[0].split("?")[0];
  profile.Image = await getFileFromZip(`profile_media/${id}-${file}`);

  return profile;
}
