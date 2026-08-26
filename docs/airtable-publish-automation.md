# Airtable publishing automation

The website is already built from Airtable on every deployment. The remaining
one-time setup is to tell Vercel to deploy when an editor changes a published
article. It cannot be completed inside this repository because the deploy-hook
URL is a Vercel secret and must be created in the project's Vercel account.

1. In Vercel, open the iq.godaylii.com project, then **Settings → Git → Deploy
   Hooks → Create Hook**. Choose the production branch (`main`) and name it
   `Airtable articles publish`. Copy the generated URL; treat it as a secret.
2. In Airtable, open the article table and create an automation named
   `Publish articles to iq.godaylii.com`.
3. Use the **When record updated** trigger and watch only the content fields
   that change a rendered article: `Published`, `title`, `slug`, `date`,
   `modified`, `excerpt`, `content_html`, `thumbnail_image`, `featured_image`,
   `meta_description`, and `categories`.
4. Add a conditional group so it runs only when `Published` is checked.
5. Add a **Run script** action containing:

   ```js
   await fetch('PASTE_THE_VERCEL_DEPLOY_HOOK_URL_HERE', { method: 'POST' });
   ```

6. Turn the automation on. Edit one non-critical published article, wait for
   the Vercel deployment, and confirm its title/image changes on the live URL.

The build uses `ARTICLE_IMAGE_SOURCE=airtable`, so each production deployment
downloads the currently valid Airtable attachment URLs and publishes immutable,
self-hosted image files. Airtable's temporary attachment URLs are never placed
in public article HTML.

For a source-content audit, run `npm run audit-source` locally with the normal
`.env` file. It is deliberately read-only: it reports any WordPress posts that
are absent from published Airtable records rather than silently importing them.
