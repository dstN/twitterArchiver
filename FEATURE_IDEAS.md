## Export Enhancements

- **Media Manifest Preview**: Before downloading, show a modal that lists media
  files slated for export (name, size, type) so users can confirm contents.
- **Export Queueing / Download All**: Allow stacking multiple export jobs (e.g.,
  JSON+ZIP and CSV+ZIP) and provide a single combined download trigger when they
  finish.
- **Configurable Media Naming**: Offer patterns for media filenames (tweet date,
  ID, original name) to match different archiving workflows.
- **Additional Formats**: Generate Markdown bundles (with front matter) or
  self-contained HTML exports to streamline blog imports or sharing.

## Filtering & Search

- **Saved Filter Presets**: Let users save and reapply their favorite
  filter/search combinations (e.g., “2022 replies with media”).
- **Search Chips / Structured Query**: Enhance the search UI with chips for
  hashtags, mentions, date ranges, and media flags for quicker complex queries.

## Performance & Processing

- **Web Worker Pipeline**: Move heavy filtering/sorting into a worker to keep
  the UI responsive with very large archives.
- **Streaming Archive Handling**: Leverage zip.js streaming APIs to handle
  large archives without exhausting browser memory.

## UX Extras

- **Media Export Summary**: After exporting, show a toast or panel summarizing
  media counts/types and any skipped files.
- **Progress Indicators**: Add granular progress for long-running tasks
  (parsing, media fetching, zip generation) beyond the current spinner.
