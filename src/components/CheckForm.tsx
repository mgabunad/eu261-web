"use client";

import { useState } from "react";
import {
  checkFlight,
  type Claim,
  type DisruptionType,
  type Options,
  type Result,
} from "@/lib/api";

// Quick-fill flights so you can test with one click.
const EXAMPLES: { label: string; claim: Claim }[] = [
  {
    label: "Rome → Cairo (EgyptAir, 3h30 delay)",
    claim: {
      departure_country: "IT",
      arrival_country: "EG",
      airline_code: "MS",
      distance_km: 2100,
      disruption_type: "delay",
      delay_hours: 3,
      delay_minutes: 30,
      circumstance_code: "none",
    },
  },
];

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900";

export default function CheckForm({ options }: { options: Options }) {
  // One state object holds every field of the form.
  const [claim, setClaim] = useState<Claim>({
    departure_country: "",
    arrival_country: "",
    airline_code: "",
    distance_km: 0,
    disruption_type: "delay",
    delay_hours: 0,
    delay_minutes: 0,
    notice_days: 0,
    boarding_type: "involuntary",
    circumstance_code: "none",
  });
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Updates a single field and keeps the rest unchanged.
  function update<K extends keyof Claim>(key: K, value: Claim[K]) {
    setClaim((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Only send the fields that matter for the chosen disruption type.
      const payload: Claim = {
        departure_country: claim.departure_country,
        arrival_country: claim.arrival_country,
        airline_code: claim.airline_code,
        distance_km: Number(claim.distance_km),
        disruption_type: claim.disruption_type,
        circumstance_code: claim.circumstance_code,
      };
      if (claim.disruption_type === "delay") {
        payload.delay_hours = Number(claim.delay_hours);
        payload.delay_minutes = Number(claim.delay_minutes);
      }
      if (claim.disruption_type === "cancellation") {
        payload.notice_days = Number(claim.notice_days);
      }
      if (claim.disruption_type === "denied_boarding") {
        payload.boarding_type = claim.boarding_type;
      }
      setResult(await checkFlight(payload));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => setClaim({ ...claim, ...ex.claim })}
              className="rounded-full border border-blue-300 px-3 py-1 text-sm text-blue-700 hover:bg-blue-50"
            >
              {ex.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Departure country
            <select
              className={inputClass}
              value={claim.departure_country}
              onChange={(e) => update("departure_country", e.target.value)}
              required
            >
              <option value="">Select…</option>
              {options.countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium">
            Arrival country
            <select
              className={inputClass}
              value={claim.arrival_country}
              onChange={(e) => update("arrival_country", e.target.value)}
              required
            >
              <option value="">Select…</option>
              {options.countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium">
            Airline
            <select
              className={inputClass}
              value={claim.airline_code}
              onChange={(e) => update("airline_code", e.target.value)}
              required
            >
              <option value="">Select…</option>
              {options.airlines.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium">
            Distance (km)
            <input
              type="number"
              min={1}
              max={20000}
              className={inputClass}
              value={claim.distance_km || ""}
              onChange={(e) => update("distance_km", Number(e.target.value))}
              required
            />
          </label>

          <label className="block text-sm font-medium">
            What happened?
            <select
              className={inputClass}
              value={claim.disruption_type}
              onChange={(e) =>
                update("disruption_type", e.target.value as DisruptionType)
              }
            >
              <option value="delay">Delay</option>
              <option value="cancellation">Cancellation</option>
              <option value="denied_boarding">Denied boarding</option>
            </select>
          </label>

          <label className="block text-sm font-medium">
            Airline&apos;s stated reason
            <select
              className={inputClass}
              value={claim.circumstance_code}
              onChange={(e) => update("circumstance_code", e.target.value)}
            >
              {options.circumstances.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Extra fields that appear depending on the disruption type */}
        {claim.disruption_type === "delay" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Arrival delay (hours)
              <input
                type="number"
                min={0}
                max={72}
                className={inputClass}
                value={claim.delay_hours ?? 0}
                onChange={(e) => update("delay_hours", Number(e.target.value))}
              />
            </label>
            <label className="block text-sm font-medium">
              Arrival delay (minutes)
              <input
                type="number"
                min={0}
                max={59}
                className={inputClass}
                value={claim.delay_minutes ?? 0}
                onChange={(e) =>
                  update("delay_minutes", Number(e.target.value))
                }
              />
            </label>
          </div>
        )}

        {claim.disruption_type === "cancellation" && (
          <label className="block text-sm font-medium">
            Days of notice before departure
            <input
              type="number"
              min={0}
              max={365}
              className={inputClass}
              value={claim.notice_days ?? 0}
              onChange={(e) => update("notice_days", Number(e.target.value))}
            />
          </label>
        )}

        {claim.disruption_type === "denied_boarding" && (
          <label className="block text-sm font-medium">
            Boarding type
            <select
              className={inputClass}
              value={claim.boarding_type}
              onChange={(e) =>
                update(
                  "boarding_type",
                  e.target.value as "involuntary" | "voluntary",
                )
              }
            >
              <option value="involuntary">Involuntary</option>
              <option value="voluntary">Voluntary</option>
            </select>
          </label>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Checking…" : "Check eligibility"}
        </button>
      </form>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-red-700">{error}</p>
      )}

      {result && <ResultCard result={result} />}
    </div>
  );
}

// Shows the verdict, the amount, and the rule-by-rule steps.
function ResultCard({ result }: { result: Result }) {
  return (
    <section className="space-y-4 rounded-lg border border-gray-200 p-5">
      <div>
        <p
          className={`text-2xl font-bold ${
            result.eligible ? "text-green-700" : "text-red-700"
          }`}
        >
          {result.eligible
            ? `Eligible: ${result.symbol}${result.amount}`
            : "Not eligible"}
        </p>
        {result.rule_set_name && (
          <p className="text-sm text-gray-500">{result.rule_set_name}</p>
        )}
        <p className="mt-2">{result.reason}</p>
      </div>

      <ol className="space-y-2">
        {result.steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span
              className={`font-bold ${
                step.passed === true
                  ? "text-green-600"
                  : step.passed === false
                    ? "text-red-600"
                    : "text-gray-400"
              }`}
            >
              {step.passed === true ? "✓" : step.passed === false ? "✗" : "•"}
            </span>
            <span>
              <strong>{step.title}</strong> {step.detail}
            </span>
          </li>
        ))}
      </ol>

      {result.notes.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
          {result.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      )}
    </section>
  );
}