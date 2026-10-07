# EU261 / UK261 Flight Compensation Checker: Next.js Frontend

A small Next.js (App Router) + React + TypeScript frontend for my EU261/UK261 flight-compensation eligibility checker. The eligibility rules run in a separate Laravel backend; this app is the user interface that talks to it through a JSON API.

This is a practice project I built to learn the Next.js + React side of a Laravel backend. I built it with AI assistance (Claude) while learning, and I can explain each file.

## How it works

```
Browser (React form)  -->  Laravel JSON API  -->  Rules engine (MySQL rules)
   Next.js app             POST /api/check         returns verdict + steps
```

- `src/app/page.tsx`: **server component**. Fetches the dropdown lists (`GET /api/options`) on the server and streams the form in with `<Suspense>`.
- `src/components/CheckForm.tsx`: **client component** (`"use client"`). Holds the form state with `useState`, posts the claim as JSON, and shows the verdict, the amount, and each rule step (✓ / ✗).
- `src/lib/api.ts`: TypeScript types for the API responses plus the two fetch functions, including handling of Laravel's 422 validation errors.

## Run it locally

1. Start the Laravel backend (the `eu261-checker` project) with MySQL running: `php artisan serve` (default http://127.0.0.1:8000).
2. In this project, create `.env.local`:
```
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```
3. Install and run:
```
   npm install
   npm run dev
```
4. Open http://localhost:3000 and click the "Rome → Cairo" example, then "Check eligibility" (expected result: €400).

## What I learned

- Server components vs client components in the Next.js App Router
- Streaming data with `<Suspense>` (and fixing the Next.js 16 "blocking route" warning)
- Typing API responses in TypeScript
- Calling a Laravel API from a separate frontend (JSON, validation errors, CORS)

## Tech

Next.js 16, React, TypeScript, Tailwind CSS. Backend: Laravel 12 + MySQL.