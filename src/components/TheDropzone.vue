<script setup>
import * as dataHandler from "../util/DataHandler";
import { ZipValidator } from "../util/ZipValidator";
import { ref } from "vue";

const props = defineProps({
  isLoading: Boolean,
});

const validFile = ref(true);
const dragOver = ref(false);
const emit = defineEmits(["load", "payloadEvent"]);

function extractFilesFromEvent(event) {
  if (event?.type === "change" && event.target?.files) {
    return Array.from(event.target.files);
  }

  if (event?.dataTransfer?.files?.length) {
    return Array.from(event.dataTransfer.files);
  }

  if (event?.target?.files) {
    return Array.from(event.target.files);
  }

  return [];
}

async function extractZipFile(e) {
  try {
    const arrayBuffer = e.target.result;

    // Add validation for the array buffer
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("Empty or invalid file content");
    }

    // Validate ZIP structure before processing
    const validation = await ZipValidator.validateZipStructure(arrayBuffer);

    if (!validation.isValid) {
      throw new Error(`Invalid ZIP file: ${validation.errors.join(", ")}`);
    }

    // Lazy load JSZip only when needed (reduces initial bundle size)
    const JSZip = (await import("jszip")).default;
    const jszip = new JSZip();

    // Try loading with different options for better compatibility
    const zipData = await jszip.loadAsync(arrayBuffer, {
      checkCRC32: false, // Disable CRC32 check which can cause issues with some zip files
      optimizedBinaryString: false,
      createFolders: false,
    });

    const data = await dataHandler.ProcessData(zipData);

    emit("load", false);
    emit("payloadEvent", data);
  } catch (error) {
    console.error("Error processing ZIP file:", error);

    // Provide user-friendly error messages
    let errorMessage = "Failed to process the ZIP file. ";

    if (
      error.message.includes("Corrupted zip") ||
      error.message.includes("central dir")
    ) {
      errorMessage +=
        "The ZIP file appears to be corrupted or incomplete. Please try re-downloading your Twitter archive.";
    } else if (error.message.includes("Can't find end of central directory")) {
      errorMessage +=
        "The ZIP file structure is invalid. This may happen if the download was interrupted.";
    } else if (error.message.includes("Invalid ZIP file")) {
      errorMessage +=
        error.message +
        " This might not be a valid ZIP file or it may be corrupted.";
    } else {
      errorMessage += error.message;
    }

    // Set invalid file state and show error
    validFile.value = false;
    alert(errorMessage);

    emit("load", false);
  }
}

function handleFileSelection(event) {
  const validFileTypes = ["application/zip", "application/x-zip-compressed"];
  const files = extractFilesFromEvent(event);
  const file = files[0];

  dragOver.value = false;

  if (!file) {
    validFile.value = false;
    return;
  }

  const fileType = file.type;
  if (!validFileTypes.includes(fileType)) {
    validFile.value = false;
    return;
  }

  validFile.value = true;
  emit("load", true);
  const fileReader = new FileReader();
  fileReader.addEventListener("loadend", extractZipFile);
  fileReader.readAsArrayBuffer(file);
}

function handleDragOver(event) {
  event.preventDefault();
}

function handleDragEnter(event) {
  dragOver.value = true;
  event.preventDefault();
}

function handleDragLeave(event) {
  if (
    event.currentTarget &&
    event.relatedTarget &&
    event.currentTarget.contains(event.relatedTarget)
  ) {
    return;
  }

  dragOver.value = false;
  event.preventDefault();
}
</script>

<template>
  <main
    class="flex min-h-screen flex-col items-center justify-center gap-5 p-6 font-sans"
    :class="isLoading ? 'blur-sm' : ''"
  >
    <h1 class="font-display text-gray-900 dark:text-orange-600">
      {{ $t("title") }}
    </h1>

    <!-- Introduction Section -->
    <div
      class="mb-1 w-full max-w-lg rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <h2 class="mb-3 font-display text-lg text-gray-300">
        {{ $t("dropzone.introduction.title") }}
      </h2>
      <p class="mb-4 text-sm text-gray-600 dark:text-gray-300">
        {{ $t("dropzone.introduction.description") }}
      </p>
      <ul class="mb-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <li
          v-for="(feature, index) in $tm('dropzone.introduction.features')"
          :key="index"
        >
          {{ feature }}
        </li>
      </ul>
    </div>

    <label
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @drop.prevent="handleFileSelection"
      @dragleave="handleDragLeave"
      for="dropzone-file"
      :class="
        validFile
          ? 'border-orange-600 dark:border-orange-600'
          : 'border-red-400 dark:border-red-500'
      "
      class="dropLabel mx-auto flex min-h-[170px] w-full max-w-lg cursor-pointer flex-col rounded-xl border-2 border-dashed bg-white p-6 text-center dark:bg-gray-800"
    >
      <div
        class="flex h-full min-h-full grow flex-col items-center justify-center"
        v-if="dragOver"
      >
        <h2
          class="font-display text-xl font-medium tracking-wide text-gray-700 dark:text-gray-300"
        >
          {{ $t("dropzone.drop") }}
        </h2>
      </div>
      <div
        class="flex h-full min-h-full grow flex-col items-center justify-center"
        v-else-if="!validFile"
      >
        <h2
          class="font-display text-xl font-medium tracking-wide text-gray-700 dark:text-gray-300"
          v-html="$t('dropzone.invalidFile')"
        />
      </div>
      <div
        class="flex h-full min-h-full grow flex-col items-center justify-between"
        v-else
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="m-auto h-10 w-10 text-orange-600 dark:text-orange-600"
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
          class="font-display text-xl font-medium tracking-wide text-gray-700 dark:text-gray-300"
        >
          {{ $t("dropzone.archive") }}
        </h2>

        <p class="tracking-wide text-gray-500 dark:text-gray-400">
          {{ $t("dropzone.hint") }}
        </p>
      </div>

      <input
        @change="handleFileSelection"
        id="dropzone-file"
        accept=".zip, application/zip"
        type="file"
        class="sr-only"
      />
    </label>
  </main>
</template>
