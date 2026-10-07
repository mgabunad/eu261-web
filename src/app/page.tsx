import { Suspense } from "react";
import type { Metadata } from "next";
import CheckForm from "@/components/CheckForm";
import { getOptions } from "@/lib/api";

// Sets the browser tab title (replaces "Create Next App").
export const metadata: Metadata = {
  title: "EU261 Flight Compensation Checker",
  description:
    "Next.js + TypeScript frontend for a Laravel EU261/UK261 eligibility API.",
};

// Server component that loads the dropdown lists from Laravel.
// It is wrapped in <Suspense> below, so the rest of the page
// shows immediately while this data is being fetched.
async function FormLoader() {
  try {
    const options = await getOptions();
    return <CheckForm options={options} />;
  } catch {
    return (
      <p className="rounded-md bg-red-50 p-3 text-red-700">
        Could not reach the Laravel API. Make sure `php artisan serve` and MySQL
        (XAMPP) are running.
      </p>
    );
  }
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">
            EU261 / UK261 Flight Compensation Checker
          </h1>
          <p className="text-gray-600">
            A Next.js (React + TypeScript) frontend that calls a Laravel JSON
            API. The eligibility rules run in the Laravel backend.
          </p>
        </header>

        <Suspense fallback={<p className="text-gray-500">Loading form…</p>}>
          <FormLoader />
        </Suspense>
      </div>
    </main>
  );
}