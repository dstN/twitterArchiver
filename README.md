# Twittr_Archivr

Reads a Twitter/X data export and lets you search and browse it in your
browser. The archive is never uploaded anywhere.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dstN/twitterArchiver)

Live at [twittrarchivr.vercel.app](https://twittrarchivr.vercel.app).

## What it does

- Unzips and parses the export locally. Nothing is sent to a server, because
  there is no server to send it to.
- Full-text search across tweets, updating as you type.
- Filters for media, replies, retweets and threads.
- Threads are reassembled and shown in order.
- Photos and videos from the archive are viewable inline.
- Export to JSON or CSV, or print.
- Light and dark theme.
- English and German.

## Stack

- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite 8 (Rolldown-based)
- **Styling**: Tailwind CSS 4 (CSS-first config, no `tailwind.config.js`)
- **Internationalization**: vue-i18n
- **Icons**: FontAwesome
- **Archive Processing**: zip.js

## Development

Requires Node.js 24 or newer, and npm.

```bash
git clone https://github.com/dstN/twitterArchiver.git
cd twitterArchiver
npm install
npm run dev     # http://localhost:3000
```

To build and check the production output:

```bash
npm run build
npm run preview
```

Deployment to Vercel happens automatically on push.

## Documentation

- [Meta Tags & SEO Setup](META_SETUP_GUIDE.md)

## Contributing

Issues and pull requests are welcome.

## License

MIT.

## Disclaimer

An unofficial tool, not affiliated with Twitter/X. It reads the archive you
download from your own account.
