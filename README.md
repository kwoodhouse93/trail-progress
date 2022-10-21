# Trail Progress

A web app for displaying stats and progress over a long distance trail based on a user's Strava activities.

## Getting Started

Run the development server:

```bash
npm run dev
```

Served on [http://localhost:3000](http://localhost:3000) by default.

## Deployment

Deployed on Vercel.

Should be visible at: https://trail-tracker.vercel.app/

## Other components

This repo alone only hosts the frontend and the API, as deployed to Vercel.

It requires a postgres database with PostGIS and a UUID extension, using the schema described in [`/schema`](https://github.com/kwoodhouse93/trail-progress/tree/main/schema).

It also depends on [kwoodhouse93/trail-progress-worker](https://github.com/kwoodhouse93/trail-progress-worker) to process Strava activities that are uploaded to postgres, and listen for Strava webhooks. See that repo for more details of that backend component.

Also of note is [kwoodhouse93/trail-factory](https://github.com/kwoodhouse93/trail-factory). This is not required for the app to work, but is designed to make it easier to upload new routes to the database by providing some basic GPX tools and the option to export the resulting track to postgres.
