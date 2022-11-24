async function fixJSON(json) {
  let makeArr = json.split(/\r?\n|\r|\n/g);
  makeArr.shift();
  makeArr.unshift("[");
  const makeObj = JSON.parse(makeArr.join(" "));
  const getKey = Object.keys(makeObj[0])[0];
  makeArr = makeObj.map((item) => ({ ...item[`${getKey}`] }));
  return makeArr.length > 1 ? makeArr : makeArr[0];
}

async function tweetHandler(data) {
  const regex =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gm;
  for (let [tweet, index] of data) {
    console.log(index);
    const result = tweet.full_text.matchAll(regex);
    for (const match of result) {
      const url = match[0];
      const entitiesUrls = tweet.entities.urls;
      const extendedEntities = tweet.extended_entities;
      //if (entitiesUrls.length && extendedEntities != undefined) {

      //}
      if (entitiesUrls.length) {
        // URLs exist - is NOT Media
        for (const entity of entitiesUrls) {
          if (url === entity.url) {
            if (tweet.extended_entities != undefined) {
              // URL exist - AND has media
              tweet.full_text = tweet.full_text.replaceAll(url, "");
              console.log(tweet.extended_entities);
            } else {
              // URL exist ONLY
              tweet.full_text = tweet.full_text.replaceAll(
                url,
                entity.expanded_url
              );
            }
          }
        }
      } else {
        // URL <IS> Media
      }
    }
  }
  return data;
}

export async function getData(zipData, fileName, tweets = false) {
  let ext = fileName.split(".");
  ext = ext[ext.length - 1].toLowerCase();
  const media = ["jpg", "png", "gif", "jpeg", "jiff", "mp4"];
  const fileLocation = `data/${fileName}`;
  let data;
  try {
    if (media.indexOf(ext) !== -1) {
      data = await zipData.files[fileLocation].async("blob");
      data = URL.createObjectURL(data);
      return data;
    } else {
      data = await zipData.files[fileLocation].async("string");
      data = await fixJSON(data);
      if (tweets) {
        data = await tweetHandler(data);
      }
      return data;
    }
  } catch (e) {
    console.error(`Error with ${fileLocation}: `, e);
  }
}
