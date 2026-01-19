# Refactoring-Vorschläge für Twitter Archiver

Dieser Dokument sammelt Vorschläge zur Verbesserung der Code-Qualität, Wartbarkeit und Performance des Twitter Archivers.

---

## 🏗️ Architektur & Organisation

### 1. Util vs. Composables Konsistenz
**Problem:** `UseSorting.js` liegt in `/util`, ist aber eigentlich ein Composable und folgt der Composable-Namenskonvention.

**Lösung:**
- Verschiebe `UseSorting.js` nach `/composables` und benenne es zu `useSorting.js` um (lowercase)
- Klare Trennung: `/util` = reine Helper-Funktionen ohne Vue-Reaktivität, `/composables` = Vue Composition API Funktionen

### 2. Export-Composable Aufteilen
**Problem:** `useExport.js` ist mit 555 Zeilen sehr groß und übernimmt zu viele Verantwortlichkeiten (JSON, CSV, Print, ZIP, Media Loading).

**Lösung:**
```
composables/
  export/
    useExport.js           # Hauptlogik & Koordination
    useExportJSON.js       # JSON Export
    useExportCSV.js        # CSV Export
    useExportPrint.js      # Print Funktionalität
    useMediaBundler.js     # ZIP + Media Handling
    exportHelpers.js       # Shared utilities
```

**Vorteile:**
- Bessere Testbarkeit einzelner Export-Typen
- Einfacheres Lazy-Loading (z.B. CSV-Export nur bei Bedarf)
- Klarer Single Responsibility

### 3. Constants Zentralisieren
**Problem:** Magic Strings und Werte sind über den Code verstreut (`SEARCH_DEBOUNCE_MS = 150`, Filter-Types, etc.)

**Lösung:**
```javascript
// constants/filters.js
export const FILTER_TYPES = {
  ALL: 'all',
  TWEETS: 'tweets',
  REPLIES: 'replies',
  RETWEETS: 'retweets',
  THREADS: 'threads',
  MEDIA: 'media',
  MEDIA_IMAGES: 'mediaImages',
  MEDIA_VIDEOS: 'mediaVideos',
};

// constants/ui.js
export const DEBOUNCE_TIMES = {
  SEARCH: 150,
  SCROLL: 100,
};

// constants/export.js
export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  ZIP: 'zip',
};
```

---

## 🎯 Code-Qualität

### 4. Type Safety mit JSDoc verbessern
**Problem:** Inkonsistente JSDoc-Dokumentation, fehlende Type-Definitionen.

**Lösung:**
```javascript
// Erstelle types.js für wiederverwendbare Type-Definitionen
/**
 * @typedef {Object} Tweet
 * @property {string} id
 * @property {string} full_text
 * @property {Date} created_at
 * @property {number} likes
 * @property {number} retweets
 * @property {boolean} is_thread
 * @property {string|null} in_reply_to_status_id
 * @property {MediaItem[]} media
 */

/**
 * @typedef {Object} MediaItem
 * @property {string} type - 'photo' | 'video' | 'animated_gif'
 * @property {string} data - Data URL or blob URL
 * @property {Function} [getBlob] - Lazy loading function
 */
```

### 5. Error Handling Vereinheitlichen
**Problem:** Verschiedene Error-Handling-Patterns (try-catch, console.warn, throw).

**Lösung:**
```javascript
// composables/useErrorHandler.js
export function useErrorHandler() {
  const errors = ref([]);
  
  function handleError(error, context, options = {}) {
    const { silent = false, showToast = true } = options;
    
    const errorEntry = {
      message: error.message,
      context,
      timestamp: new Date(),
      stack: error.stack,
    };
    
    errors.value.push(errorEntry);
    
    if (!silent) {
      Logger.error(context, error);
    }
    
    if (showToast) {
      // Show user-friendly error toast
    }
    
    return errorEntry;
  }
  
  return { errors, handleError };
}
```

### 6. Magic Numbers entfernen
**Problem:** Hardcodierte Werte ohne Erklärung.

**Beispiele:**
```javascript
// useExport.js - Zeile 522
setTimeout(() => { window.print(); }, 100);  // Warum 100ms?
setTimeout(() => { printableTweetIds.value = new Set(); }, 1000);  // Warum 1000ms?

// useInfiniteScroll.js
const INITIAL_BATCH_SIZE = 50;  // Gut dokumentiert
const LOAD_MORE_BATCH = 30;     // Gut dokumentiert
```

**Lösung:**
```javascript
// constants/timing.js
export const PRINT_DELAYS = {
  BEFORE_DIALOG: 100,  // Browser braucht Zeit für DOM-Update
  AFTER_DIALOG: 1000,  // Warten auf Dialog-Close (user can cancel)
};
```

---

## ⚡ Performance

### 7. Memoization für teure Berechnungen
**Problem:** Filter- und Such-Operationen werden bei jedem Re-Render neu berechnet.

**Lösung:**
```javascript
import { computed, shallowRef } from 'vue';

// Cache für Filter-Ergebnisse
const filterCache = new Map();

function getCacheKey(tweets, filterType, searchTerm, sortBy) {
  return `${tweets.length}-${filterType}-${searchTerm}-${sortBy}`;
}

const filteredData = computed(() => {
  const key = getCacheKey(
    data.value.tweets, 
    filterType.value, 
    searchTerm.value,
    sortBy.value
  );
  
  if (filterCache.has(key)) {
    return filterCache.get(key);
  }
  
  const result = applyFiltersInternal();
  filterCache.set(key, result);
  return result;
});
```

### 8. Bidirektionales Scrollen optimieren
**Problem:** Der aktuelle Infinite-Scroll-Mechanismus funktioniert gut, könnte aber bei sehr großen Archives noch optimiert werden.

**Lösung:**
- Verbesserte Scroll-Position-Recovery nach Batch-Load
- Intelligenteres Pre-Loading (z.B. bei schnellem Scrollen mehr laden)
- Optional: Tweets außerhalb des Viewports aus DOM entfernen (aber ohne Virtual Scroller)
- Intersection Observer für bessere Scroll-Performance nutzen

**Hinweis:** Virtual Scrolling wurde bewusst NICHT implementiert, da es bei Tweets mit unterschiedlichen Höhen (Media) zu Flickering und Sprüngen führt.

### 9. Web Worker für Daten-Verarbeitung
**Problem:** Große ZIP-Dateien blockieren den Main Thread beim Parsing.

**Lösung:**
```javascript
// workers/archiveProcessor.worker.js
self.onmessage = async (e) => {
  const { zipData, options } = e.data;
  
  try {
    const result = await ProcessData(zipData, {
      ...options,
      onProgress: (progress) => {
        self.postMessage({ type: 'progress', data: progress });
      }
    });
    
    self.postMessage({ type: 'complete', data: result });
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
};
```

---

## 🧪 Testbarkeit

### 10. Reine Funktionen extrahieren
**Problem:** Viele Funktionen sind schwer testbar, da sie direkt auf reactive refs zugreifen.

**Lösung:**
```javascript
// Vorher (in useExport.js)
function sanitiseTweetForExport(tweet, translate) {
  // ... benutzt t() direkt
}

// Nachher - reine Funktion
// utils/tweetSanitizer.js
export function sanitizeTweet(tweet, translations) {
  return {
    id: tweet.id,
    text: stripHtml(tweet.full_text),
    // ...
  };
}

// Im Composable
function sanitiseTweetForExport(tweet) {
  const translations = {
    tweet: t('export.types.tweet'),
    retweet: t('export.types.retweet'),
    reply: t('export.types.reply'),
  };
  return sanitizeTweet(tweet, translations);
}
```

### 11. Test-Utilities erstellen
**Lösung:**
```javascript
// tests/fixtures/tweetFactory.js
export function createMockTweet(overrides = {}) {
  return {
    id: '123456789',
    full_text: 'Test tweet',
    created_at: new Date('2023-01-01'),
    likes: 10,
    retweets: 5,
    media: [],
    is_thread: false,
    ...overrides,
  };
}

// tests/helpers/vueTestUtils.js
export function mountWithI18n(component, options = {}) {
  return mount(component, {
    global: {
      plugins: [i18n],
      ...options.global,
    },
  });
}
```

---

## 🎨 UI/UX Code

### 12. Shared Component Library
**Problem:** Wiederholende UI-Patterns (Buttons, Inputs, Modals) sind nicht abstrahiert.

**Lösung:**
```
components/
  ui/
    BaseButton.vue       # Wiederverwendbarer Button mit Variants
    BaseInput.vue        # Standard Input mit Icons
    BaseModal.vue        # Modal Wrapper
    BaseCheckbox.vue     # Checkbox mit Label
    BaseDropdown.vue     # Dropdown Menu
```

**Beispiel:**
```vue
<!-- BaseButton.vue -->
<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary, secondary, danger
  size: { type: String, default: 'md' },         // sm, md, lg
  loading: Boolean,
  disabled: Boolean,
});
</script>

<template>
  <button
    :class="[
      'base-button',
      `base-button--${variant}`,
      `base-button--${size}`,
      { 'base-button--loading': loading }
    ]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="spinner" />
    <slot v-else />
  </button>
</template>
```

### 13. Composable für Modal Management
**Problem:** Modal-State ist über verschiedene Components verstreut.

**Lösung:**
```javascript
// composables/useModal.js
export function useModal() {
  const isOpen = ref(false);
  const modalData = ref(null);
  
  function openModal(data) {
    modalData.value = data;
    isOpen.value = true;
  }
  
  function closeModal() {
    isOpen.value = false;
    // Delayed cleanup for animations
    setTimeout(() => {
      modalData.value = null;
    }, 300);
  }
  
  // ESC key handler
  onMounted(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && isOpen.value) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handler);
    onUnmounted(() => window.removeEventListener('keydown', handler));
  });
  
  return { isOpen, modalData, openModal, closeModal };
}
```

---

## 📦 Dependency Management

### 14. Bundle Size Optimierung
**Aktionen:**
- Lazy-load zip.js nur wenn Export mit Media gewählt wird ✅ (bereits implementiert)
- Tree-shaking für vue-i18n nutzen (nur verwendete Locales)
- Prüfen ob alle Tailwind-Klassen wirklich genutzt werden (purge config)

**Bundle Analysis:**
```bash
npm run build -- --mode analyze
# Nutze vite-plugin-visualizer um Bundle zu analysieren
```

### 15. Dependency Updates & Security
**Empfehlungen:**
- Regelmäßige `npm audit` Checks
- Dependabot oder Renovate Bot einrichten
- Lock-File commiten (package-lock.json)

---

## 🔐 Security & Data Privacy

### 16. Sensitive Data Handling
**Problem:** User-Daten werden im Browser verarbeitet - gut! Aber einige Best Practices fehlen.

**Empfehlungen:**
```javascript
// Blob URLs nach Verwendung aufräumen
function cleanupBlobUrl(url) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

// Beim Unmount der App alle Blob URLs clearen
onUnmounted(() => {
  if (data.value.tweets) {
    data.value.tweets.forEach(tweet => {
      if (tweet.media) {
        tweet.media.forEach(item => {
          if (item.release) item.release();
          cleanupBlobUrl(item.data);
        });
      }
    });
  }
});
```

### 17. Content Security Policy
**Lösung:**
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self'; 
               style-src 'self' 'unsafe-inline';
               img-src 'self' blob: data:;">
```

---

## 📝 Dokumentation

### 18. README erweitern
**Fehlende Sections:**
- Architecture Overview (Diagram der Component-Struktur)
- Development Guide (Setup, Testing, Building)
- API Documentation (Composables & Utils)
- Troubleshooting Section
- Contributing Guidelines

### 19. Inline Code Comments
**Beispiele für fehlende Dokumentation:**
```javascript
// useInfiniteScroll.js - warum diese Batch-Sizes?
const INITIAL_BATCH_SIZE = 50;  // Gut für First Paint, nicht zu viel
const LOAD_MORE_BATCH = 30;     // Balance zwischen Performance und UX

// useExport.js - warum wird t() außerhalb von sanitiseTweetForExport aufgerufen?
// Antwort: t() muss im Composable-Scope sein, nicht in Helper-Funktion

// style.css - warum margin-top: -1px?
// Antwort: Border-Collapse für konsistente Linien bei Print
```

---

## 🚀 Prioritäten-Empfehlung

### Quick Wins (1-2 Tage):
1. ✅ Constants zentralisieren (#3)
2. ✅ Magic Numbers entfernen (#6)
3. ✅ UseSorting.js verschieben (#1)
4. ✅ README erweitern (#18)

### Medium (3-5 Tage):
5. ✅ useExport aufteilen (#2)
6. ✅ Error Handling vereinheitlichen (#5)
7. ✅ Type Safety verbessern (#4)
8. ✅ Base Components erstellen (#12)

### Long-term (1-2 Wochen):
9. ✅ Web Worker Integration (#9)
10. ✅ Virtual Scrolling (#8)
11. ✅ Memoization (#7)
12. ✅ Comprehensive Testing (#10, #11)

---

## 📊 Metrics & Monitoring

### 20. Performance Monitoring hinzufügen
```javascript
// utils/performance.js
export function measurePerformance(label, fn) {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  if (duration > 100) {
    console.warn(`Performance: ${label} took ${duration.toFixed(2)}ms`);
  }
  
  return result;
}

// Usage in useFilters
function applyFilters() {
  return measurePerformance('applyFilters', () => {
    // ... existing logic
  });
}
```

---

## 💡 Fazit

Der Code ist bereits sehr gut strukturiert! Die wichtigsten Verbesserungspotenziale liegen in:

1. **Modularisierung** - Große Composables aufteilen
2. **Typsicherheit** - Bessere JSDoc/TypeScript
3. **Performance** - Für sehr große Archives optimieren
4. **Testbarkeit** - Reine Funktionen extrahieren
5. **Wartbarkeit** - Constants & Error Handling vereinheitlichen

Die meisten Vorschläge sind optional und sollten basierend auf konkreten Anforderungen (Archive-Größe, User-Feedback, Team-Größe) priorisiert werden.
