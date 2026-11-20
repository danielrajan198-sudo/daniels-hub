# Daniel's Hub

A personal library of AI tools, agent skills, guides and PDFs.

This is the public homepage, built with plain HTML, CSS and JavaScript.
There is no build step and nothing to install.

## Files

| File | What it does |
| --- | --- |
| `index.html` | Homepage |
| `browse.html` | Browse page: all four categories and the curated collections |
| `category.html` | One page for every category, opened as `category.html?c=ai` |
| `collection.html` | One page for every collection, opened as `collection.html?c=best-ai-websites` |
| `about.html`, `saved.html` | Pages reached from the hamburger menu |
| `admin/index.html` | Placeholder admin page. It has no login yet |
| `css/style.css` | The Frost Glass look. Colours are at the top of the file |
| `js/ui.js` | Shared pieces: icons, resource cards, hamburger menu |
| `js/app.js` | Homepage: search and the hidden admin link |
| `js/browse.js` | Browse page |
| `js/category.js` | Category pages |
| `js/collection.js` | Collection pages |
| `js/config.js` | Settings, including the secret phrase that reveals the Admin Login link |
| `js/data.js` | **Sample** categories, resources and collections. The dashboard will replace this later |
| `assets/logo.svg` | Logo for the website header |
| `assets/favicon.svg` | Simplified logo for the browser tab |
| `assets/app-icon.svg` | Logo for a future Android app icon |

## Status

- Homepage, Browse page, category pages, collection pages, search, menu and resource cards: done, using sample data.
- The hidden Admin Login link only reveals a link. It is not security. Real protection will come from Supabase sign-in and database rules.
- Admin dashboard, login, database and PDF storage: not built yet.

## Collections

A collection is a named group of resources. It is defined in `js/data.js` under `collections`
as a list of resource ids. It never copies a resource, so a resource stays in its own category
and can also appear in any number of collections. An id that does not exist is skipped.
`accent` picks the card colour: `violet`, `teal` or `sunset`.

## Fresh drops

The homepage list shows only resources whose `date` (the publication date, `YYYY-MM-DD`) is
today or in the previous 6 days, by the visitor's calendar day. Older resources drop off by
themselves but stay in their category, collections and search. A resource with a missing or
invalid `date`, or one dated in the future, is never shown as fresh. Do not change `date` when
editing a resource.

## Updating files safely (cache note)

Phones keep copies of CSS and JavaScript for several minutes. Every page therefore loads them as
`css/style.css?v=BUILD` and `js/app.js?v=BUILD`. When you change any CSS or JS file, change `BUILD`
in all the HTML files and in `js/ui.js`. The footer shows the build number; if it says
"refresh to update", the phone is still using old files.
