async function fixJSON(json) {
  json = json.split(/\r?\n|\r|\n/g);
  json.shift();
  json.unshift("[");
  json = JSON.parse(json.join(" "));
  return json;
}

export async function getData(zipData, fileName) {
  const fileLocation = `data/${fileName}`;
  try {
    let data = await zipData.files[fileLocation].async("string");
    return await fixJSON(data);
  } catch (e) {
    console.error(`Error with ${fileLocation}: `, e);
  }
}
