<script setup>
import JSZip from "jszip";
import * as dataHandling from "../service/dataHandling";
import { ref } from "vue";

const props = defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
});

const validFile = ref(true);
const dragOver = ref(false);
const emit = defineEmits(["load", "payloadEvent"]);

async function extractZipFile(e) {
  const arrayBuffer = e.target.result;
  const jszip = new JSZip();
  const zipData = await jszip.loadAsync(arrayBuffer);
  let data = {};

  //#region Get Data
  const tweetfile = zipData.file("data/tweet.js") ? "tweet.js" : "tweets.js";
  data.tweets = await dataHandling.getData(zipData, tweetfile, true);

  data.profile = await dataHandling.getData(zipData, "profile.js");

  data.account = await dataHandling.getData(zipData, "account.js");
  //#endregion

  //#region Get Profile Pic
  const userId = data.account.accountId;
  const file = data.profile.avatarMediaUrl
    .split("/")
    .pop()
    .split("#")[0]
    .split("?")[0];
  const fileName = `${userId}-${file}`;
  const profileImage = await dataHandling.getData(
    zipData,
    `profile_media/${fileName}`
  );
  data.profile.profileImage = profileImage;
  //#endregion

  emit("load", false);
  emit("payloadEvent", data);
}

function changed(e) {
  const validFileTypes = ["application/zip", "application/x-zip-compressed"];
  let file;
  if (e.srcElement.files != undefined && [...e.srcElement.files].length) {
    file = [...e.srcElement.files];
  } else {
    file = [...e.dataTransfer.files];
  }

  file = file[0];
  const fileType = file.type;
  if (!validFileTypes.includes(fileType)) {
    validFile.value = false;
    dragOver.value = false;
    return;
  }

  validFile.value = true;
  emit("load", true);
  const fileReader = new FileReader();
  fileReader.addEventListener("loadend", extractZipFile);
  fileReader.readAsArrayBuffer(file);
}

function checkDrop(e) {
  e.preventDefault();
}

function resetDrop(e) {
  dragOver.value = !dragOver.value;
  e.preventDefault();
}
</script>

<template>
  <main
    class="flex min-h-screen flex-col items-center justify-center gap-4 font-sans"
    :class="isLoading ? 'blur-sm' : ''"
  >
    <h1 class="font-display">twittr_Archivr</h1>
    <label
      @dragenter="resetDrop"
      @dragover="checkDrop"
      @drop.prevent="changed"
      @dragleave="resetDrop"
      for="dropzone-file"
      :class="validFile ? 'border-blue-400' : 'border-red-400'"
      class="dropLabel mx-auto flex min-h-[170px] w-full max-w-lg cursor-pointer flex-col rounded-xl border-2 border-dashed bg-white p-6 text-center"
    >
      <div
        class="flex h-full min-h-full grow flex-col items-center justify-center"
        v-if="dragOver"
      >
        <h2
          class="font-display text-xl font-medium tracking-wide text-gray-700"
        >
          YES please DROP IT! 🤤
        </h2>
      </div>
      <div
        class="flex h-full min-h-full grow flex-col items-center justify-center"
        v-else-if="!validFile"
      >
        <h2
          class="font-display text-xl font-medium tracking-wide text-gray-700"
        >
          Oh Dang! You picked a falsy file. Please pick the
          <strong>ZIP-File</strong> you downloaded from Twitter directly without
          touching it.
        </h2>
      </div>
      <div
        class="flex h-full min-h-full grow flex-col items-center justify-between"
        v-else
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="m-auto h-10 w-10 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <h2
          class="font-display text-xl font-medium tracking-wide text-gray-700"
        >
          Twitter Archive
        </h2>

        <p class="tracking-wide text-gray-500">
          Select or drag & drop your file (ZIP only).
        </p>
      </div>

      <input
        @change="changed"
        id="dropzone-file"
        accept=".zip, application/zip"
        type="file"
        class="sr-only"
      />
    </label>
  </main>
</template>
