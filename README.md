# HD Road Service Website

Static business website for HD Road Service LLC, hosted with GitHub Pages.

## Structure

- `index.html`, `services.html`, `contact.html`, `photos.html` - public site pages
- `admin/` - password-protected content editor page
- `assets/css/` - shared, page-specific, admin, and legacy stylesheets
- `assets/js/site/` - public services content loader and Supabase config
- `assets/js/admin.js` - admin editor behavior
- `assets/data/services.json` - local fallback pricing/services content
- `img/` - site images and brand assets
- `deprecated-files/` - archived old pages kept for reference

## Content Editing

Pricing and services are managed through Supabase. Approved users can log in at `/admin/` and update the public services page without editing code.

The Supabase URL and publishable key live in `assets/js/site/site-config.js`. Do not add any secret service-role keys or admin allow-lists to the repository. Admin permissions should be enforced with Supabase row-level security policies, not browser-side JavaScript.
