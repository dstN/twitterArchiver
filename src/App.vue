<script setup>
import { ref } from "vue";
let validFile = ref(true);
let loading = ref(false);
function changed(e) {
  let file;
  let fileType;
  if (e.srcElement.files != undefined && [...e.srcElement.files].length) {
    file = [...e.srcElement.files];
  } else {
    file = [...e.dataTransfer.files];
  }
  file = file[0];
  fileType = file.type;
  if (fileType === "application/x-zip-compressed") {
    console.log(`${file} dropped`);
  } else {
    loading.value = true;
    console.log(loading.value);
    validFile.value = false;
  }
}
function checkDrop(e) {
  e.preventDefault();
}
</script>

<template>
  <div class="relative">
    <main class="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100 font-sans" :class="loading ? 'blur-sm' : ''">
      <h1 class="font-display">twittr_Archivr</h1>
      <label id="dropZone" @dragenter="checkDrop" @dragover="checkDrop" @drop.prevent="changed" for="dropzone-file" :class="validFile ? 'border-blue-400' : 'border-red-400'" class="mx-auto flex w-full max-w-lg cursor-pointer flex-col items-center rounded-xl border-2 border-dashed bg-white p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>

        <h2 class="mt-4 text-xl font-medium tracking-wide text-gray-700">Twitter Archive</h2>

        <p class="mt-2 tracking-wide text-gray-500">Select or drag & drop your file (ZIP only).</p>

        <input @change="changed" id="dropzone-file" accept=".zip, application/zip" type="file" class="hidden" />
      </label>
    </main>
    <div :class="loading ? 'z-10 opacity-100' : ''" class="absolute left-0 top-0 -z-10 flex min-h-screen min-w-full flex-col items-center justify-center gap-4 bg-white bg-opacity-30 font-sans">
      <div class="fixed top-0 right-0 z-50 flex h-screen w-screen items-center justify-center">
        <div class="h-32 w-32 animate-spin rounded-full border-t-2 border-b-2 border-blue-400"></div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
