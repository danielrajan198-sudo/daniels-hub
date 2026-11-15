# Daniel's Hub

A personal library of AI tools, agent skills, guides and PDFs.

This is the public homepage, built with plain HTML, CSS and JavaScript.
There is no build step and nothing to install.

## Files

| File | What it does |
| --- | --- |
| `index.html` | Homepage |
| `category.html` | One page for every category, opened as `category.html?c=ai` |
| `about.html`, `saved.html` | Pages reached from the hamburger menu |
| `admin/index.html` | Placeholder admin page. It has no login yet |
| `css/style.css` | The Frost Glass look. Colours are at the top of the file |
| `js/ui.js` | Shared pieces: icons, resource cards, hamburger menu |
| `js/app.js` | Homepage: search and the hidden admin link |
| `js/category.js` | Category pages |
| `js/config.js` | Settings, including the secret phrase that reveals the Admin Login link |
| `js/data.js` | **Sample** categories and resources. The dashboard will replace this later |
| `assets/logo.svg` | Logo for the website header |
| `assets/favicon.svg` | Simplified logo for the browser tab |
| `assets/app-icon.svg` | Logo for a future Android app icon |

## Status

- Homepage, category pages, search, menu and resource cards: done, using sample data.
- The hidden Admin Login link only reveals a link. It is not security. Real protection will come from Supabase sign-in and database rules.
- Admin dashboard, login, database and PDF storage: not built yet.
