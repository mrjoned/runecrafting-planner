RUN ECRAFTING PLANNER — AIRTABLE EDITION

1. Keep AIRTABLE_TOKEN in Netlify Environment variables, scoped to Functions and Production.
2. Upload the entire contents of this folder as a deployment to your existing Netlify site.
3. Open https://glistening-conkies-9b85d8.netlify.app/. Your Squarespace iframe stays unchanged.
4. Check /.netlify/functions/enchantments on your site. It should return JSON (not an error).
5. The planner uses its bundled Version 14 data if the live request fails; check the browser console if edits don't appear.
6. Airtable results are cached for approximately 5 minutes per function instance.

Do not put your Airtable token in these files.
