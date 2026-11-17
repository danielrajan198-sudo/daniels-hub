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

## Updating files safely (cache note)

Phones keep copies of CSS and JavaScript for several minutes. Every page therefore loads them as
`css/style.css?v=BUILD` and `js/app.js?v=BUILD`. When you change any CSS or JS file, change `BUILD`
in all the HTML files and in `js/ui.js`. The footer shows the build number; if it says
"refresh to update", the phone is still using old files.
