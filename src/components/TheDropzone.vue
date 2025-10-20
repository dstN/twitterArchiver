<script setup>
import JSZip from "jszip";
import * as dataHandler from "../util/DataHandler";
import { ZipValidator } from "../util/ZipValidator";
import { ref } from "vue";

const props = defineProps({
  isLoading: Boolean,
});

const validFile = ref(true);
const dragOver = ref(false);
const emit = defineEmits(["load", "payloadEvent"]);

async function extractZipFile(e) {
  try {
    const arrayBuffer = e.target.result;

    // Add validation for the array buffer
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("Empty or invalid file content");
    }

    console.log("File size:", arrayBuffer.byteLength, "bytes");

    // Validate ZIP structure before processing
    const validation = await ZipValidator.validateZipStructure(arrayBuffer);
    console.log(ZipValidator.formatValidationReport(validation));

    if (!validation.isValid) {
      throw new Error(`Invalid ZIP file: ${validation.errors.join(", ")}`);
    }

    if (validation.warnings.length > 0) {
      console.warn("ZIP validation warnings:", validation.warnings);
    }

    const jszip = new JSZip();

    // Try loading with different options for better compatibility
    const zipData = await jszip.loadAsync(arrayBuffer, {
      checkCRC32: false, // Disable CRC32 check which can cause issues with some zip files
      optimizedBinaryString: false,
      createFolders: false,
    });

    console.log(
      "ZIP loaded successfully, files found:",
      Object.keys(zipData.files).length,
    );

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
    <h1 class="font-display text-gray-900 dark:text-orange-600">
      {{ $t("title") }}
    </h1>
    <label
      @dragenter="resetDrop"
      @dragover="checkDrop"
      @drop.prevent="changed"
      @dragleave="resetDrop"
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
        @change="changed"
        id="dropzone-file"
        accept=".zip, application/zip"
        type="file"
        class="sr-only"
      />
    </label>
  </main>
</template>
