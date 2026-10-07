// Types that describe the JSON returned by the Laravel API,
// plus the two functions that call it.

export type Country = { code: string; name: string };
export type Airline = { code: string; name: string };
export type Circumstance = { code: string; label: string };

export type Options = {
  countries: Country[];
  airlines: Airline[];
  circumstances: Circumstance[];
};

export type DisruptionType = "delay" | "cancellation" | "denied_boarding";

export type Claim = {
  departure_country: string;
  arrival_country: string;
  airline_code: string;
  distance_km: number;
  disruption_type: DisruptionType;
  delay_hours?: number;
  delay_minutes?: number;
  notice_days?: number;
  boarding_type?: "involuntary" | "voluntary";
  circumstance_code: string;
};

export type Step = {
  title: string;
  passed: boolean | null;
  detail: string;
};

export type Result = {
  rule_set_name: string | null;
  covered: boolean;
  eligible: boolean;
  amount: number;
  symbol: string;
  reason: string;
  steps: Step[];
  notes: string[];
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

/** Loads the dropdown lists. Called on the server when the page is built. */
export async function getOptions(): Promise<Options> {
  const res = await fetch(`${API_URL}/options`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Could not load options (HTTP ${res.status})`);
  }
  return res.json();
}

/** Sends one flight claim to Laravel. Called from the browser form. */
export async function checkFlight(claim: Claim): Promise<Result> {
  const res = await fetch(`${API_URL}/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(claim),
  });

  if (res.status === 422) {
    // Laravel validation error: { message, errors: { field: [msg] } }
    const body = await res.json();
    const first = Object.values(body.errors as Record<string, string[]>)[0];
    throw new Error(first?.[0] ?? body.message ?? "Please check the form.");
  }
  if (!res.ok) {
    throw new Error(`The server returned an error (HTTP ${res.status}).`);
  }
  return res.json();
}