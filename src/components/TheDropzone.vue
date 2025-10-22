<script setup>
import * as dataHandler from "../util/DataHandler";
import { ZipValidator } from "../util/ZipValidator";
import { ZipArchive } from "../util/ZipArchive";
import { onBeforeUnmount, ref } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faMagnifyingGlass,
  faFileArrowDown,
  faShareNodes,
  faShieldHalved,
  faGaugeHigh,
} from "@fortawesome/free-solid-svg-icons";

const SOFT_ARCHIVE_WARNING_BYTES = 10 * 1024 * 1024 * 1024; // 10GB soft warning threshold
const LAZY_MEDIA_THRESHOLD_BYTES = 750 * 1024 * 1024; // ~750MB - above this lazily hydrate media
let currentArchive = null;

const props = defineProps({
  isLoading: Boolean,
});

const validFile = ref(true);
const dragOver = ref(false);
const emit = defineEmits(["load", "payloadEvent", "progress"]);
const featureIcons = [
  faMagnifyingGlass,
  faFileArrowDown,
  faShareNodes,
  faShieldHalved,
  faGaugeHigh,
];

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

async function processArchiveFile(file) {
  if (!file || file.size === 0) {
    throw new Error("Empty or invalid file content");
  }

  const validation = await ZipValidator.validateZipStructure(file);

  if (!validation.isValid) {
    throw new Error(`Invalid ZIP file: ${validation.errors.join(", ")}`);
  }

  if (validation.fileSize > SOFT_ARCHIVE_WARNING_BYTES) {
    console.warn(
      `Large archive detected (${(validation.fileSize / (1024 * 1024 * 1024)).toFixed(2)} GB). Processing may take a while.`,
    );
  }

  const preferLazyMedia = validation.fileSize >= LAZY_MEDIA_THRESHOLD_BYTES;

  const previousArchive = currentArchive;
  const progressState = {
    entry: 0,
    tweets: 0,
    media: 0,
    finalize: 0,
    label: "Loading archive",
    detail: "Scanning entries...",
  };

  function publishProgress(overrides = {}) {
    if (overrides.label) progressState.label = overrides.label;
    if (overrides.detail) progressState.detail = overrides.detail;
    const percent = Math.round(
      progressState.entry * 45 +
        progressState.tweets * 45 +
        progressState.media * 5 +
        progressState.finalize * 5,
    );
    emit("progress", {
      percent: Math.min(99, Math.max(0, percent)),
      label: progressState.label,
      detail: progressState.detail,
    });
  }

  const archive = await ZipArchive.fromBlob(file, {
    onProgress(progress, total) {
      const safeTotal = typeof total === "number" && total > 0 ? total : null;
      const safeProgress =
        typeof progress === "number" && progress >= 0 ? progress : 0;
      if (safeTotal) {
        progressState.entry = safeTotal
          ? Math.min(1, safeProgress / safeTotal)
          : progressState.entry;
      } else {
        progressState.entry = Math.min(1, safeProgress / 100);
      }
      publishProgress({
        label: "Loading archive",
        detail: safeTotal
          ? `Reading entry ${Math.min(safeProgress + 1, safeTotal)} of ${safeTotal}`
          : "Scanning entries...",
      });
    },
  });
  currentArchive = archive;

  publishProgress({
    label: "Processing timeline",
    detail: "Preparing tweets...",
  });

  try {
    const dataset = await dataHandler.ProcessData(archive, {
      lazyMedia: preferLazyMedia,
      onProgress: ({ stage, current = 0, total = 0, media, status }) => {
        switch (stage) {
          case "profile": {
            publishProgress({
              label: "Loading profile",
              detail: "Preparing account details...",
            });
            break;
          }
          case "tweets": {
            progressState.tweets =
              total > 0 ? Math.min(1, current / total) : current > 0 ? 1 : 0;
            if (media && media.total) {
              progressState.media = Math.min(
                1,
                media.total ? media.current / media.total : 1,
              );
            }
            const tweetDetail =
              total > 0
                ? `Processing tweets ${Math.min(current, total)} / ${total}`
                : "Processing tweets...";
            const mediaDetail =
              media && media.total
                ? ` | Media ${Math.min(media.current, media.total)} / ${media.total}`
                : preferLazyMedia
                  ? " | Media will load on demand"
                  : "";
            const patienceNote = preferLazyMedia
              ? " • Huge archive detected, this step can take a minute. Please keep the tab open."
              : "";
            publishProgress({
              label: "Processing timeline",
              detail: `${tweetDetail}${mediaDetail}${patienceNote}`,
            });
            break;
          }
          case "validation": {
            publishProgress({
              label: "Validating archive",
              detail: "Structure looks good...",
            });
            break;
          }
          case "finalizing": {
            progressState.finalize = 1;
            publishProgress({
              label: "Finalizing data",
              detail: status === "complete" ? "Wrapping up..." : "Finalizing...",
            });
            break;
          }
          default:
            break;
        }
      },
    });

    dataset.__archiveMetadata = {
      lazyMedia: preferLazyMedia,
      fileSize: validation.fileSize,
    };

    if (previousArchive) {
      setTimeout(() => {
        previousArchive
          .close()
          .catch((err) =>
            console.warn("Failed to close previous archive instance", err),
          );
      }, 0);
    }

    return dataset;
  } catch (error) {
    await archive.close();
    currentArchive = previousArchive ?? null;
    emit("progress", null);
    throw error;
  }
}

async function handleFileSelection(event) {
  const validFileTypes = ["application/zip", "application/x-zip-compressed"];
  const files = extractFilesFromEvent(event);
  const file = files[0];

  dragOver.value = false;

  if (!file) {
    validFile.value = false;
    return;
  }

  const fileType = file.type;
  if (fileType && !validFileTypes.includes(fileType)) {
    validFile.value = false;
    return;
  }

  if (file.size > SOFT_ARCHIVE_WARNING_BYTES) {
    console.warn(
      `Archive size ${(file.size / (1024 * 1024 * 1024)).toFixed(
        2,
      )} GB exceeds the soft limit. Extraction will continue but may take a while.`,
    );
  }

  emit("progress", {
    percent: 0,
    label: "Starting import",
    detail: "Validating archive...",
  });
  emit("load", true);
  try {
    const data = await processArchiveFile(file);
    validFile.value = true;
    emit("payloadEvent", data);
    emit("progress", {
      percent: 100,
      label: "Archive ready",
      detail: "Tweets loaded successfully.",
    });
  } catch (error) {
    console.error("Error processing ZIP file:", error);

    let errorMessage = "Failed to process the ZIP file. ";

    if (
      error.message?.includes("Corrupted zip") ||
      error.message?.includes("central dir")
    ) {
      errorMessage +=
        "The ZIP file appears to be corrupted or incomplete. Please try re-downloading your Twitter archive.";
    } else if (error.message?.includes("Can't find end of central directory")) {
      errorMessage +=
        "The ZIP file structure is invalid. This may happen if the download was interrupted.";
    } else if (error.message?.includes("Invalid ZIP file")) {
      errorMessage +=
        error.message +
        " This might not be a valid ZIP file or it may be corrupted.";
    } else {
      errorMessage += error.message ?? "Unknown error.";
    }

    validFile.value = false;
    alert(errorMessage);
  } finally {
    emit("load", false);
    setTimeout(() => emit("progress", null), 400);
  }
}

onBeforeUnmount(async () => {
  if (currentArchive) {
    await currentArchive.close();
    currentArchive = null;
  }
});

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
          class="flex items-start gap-3"
        >
          <FontAwesomeIcon
            :icon="featureIcons[index % featureIcons.length]"
            class="mt-0.5 h-4 w-4 text-orange-600 dark:text-orange-600"
          />
          <span class="text-left">
            {{ feature }}
          </span>
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
