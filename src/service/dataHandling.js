async function fixJSON(json) {
  json = json.split(/\r?\n|\r|\n/g);
  json.shift();
  json.unshift("[");
  json = JSON.parse(json.join(" "));
  return json;
}

export async function getData(zipData, fileName) {
  let ext = fileName.split(".");
  ext = ext[ext.length - 1].toLowerCase();
  const media = ["jpg", "png", "gif", "jpeg", "jiff", "mp4"];
  const fileLocation = `data/${fileName}`;
  let data;
  if (media.indexOf(ext) !== -1) {
    try {
      data = await zipData.files[fileLocation].async("blob");
      data = URL.createObjectURL(data);
      return data;
    } catch (e) {
      console.error(`Error with ${fileLocation}:`, e);
    }
  } else {
    try {
      data = await zipData.files[fileLocation].async("string");
      return await fixJSON(data);
    } catch (e) {
      console.error(`Error with ${fileLocation}: `, e);
    }
  }
}
