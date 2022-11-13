export async function fixJSON(json) {
  json = json.split(/\r?\n|\r|\n/g);
  json.shift();
  json.unshift("[");
  json = JSON.parse(json.join(" "));
  return json;
}

export async function getData(zipData, fileName) {
  const folder = "data";
  let data;
  try {
    data = await zipData.files[`${folder}/${fileName}`].async("string");
    data = await fixJSON(data);
    return data;
  } catch (e) {
    console.log(`Error with ${fileName}: `, e);
  }
}
