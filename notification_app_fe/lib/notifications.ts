import { Log } from "./logger";

const ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ0aGlydWNoZWx2YW4uMjAyMkB2aXRzdHVkZW50LmFjLmluIiwiZXhwIjoxNzc4OTMwNTA3LCJpYXQiOjE3Nzg5Mjk2MDcsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiJmZTRkNDE4NS1jMGRlLTRmOWItODkyYi0yZDdmMGRiZjM1MjMiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJ0aGlydWNoZWx2YW4iLCJzdWIiOiJiOTA5MjY0MC0yNDhiLTQzZTYtYmMzMS00ZGIzM2E1Mzc1MTgifSwiZW1haWwiOiJ0aGlydWNoZWx2YW4uMjAyMkB2aXRzdHVkZW50LmFjLmluIiwibmFtZSI6InRoaXJ1Y2hlbHZhbiIsInJvbGxObyI6IjIybWlhMTE3OCIsImFjY2Vzc0NvZGUiOiJTZkZ1V2ciLCJjbGllbnRJRCI6ImI5MDkyNjQwLTI0OGItNDNlNi1iYzMxLTRkYjMzYTUzNzUxOCIsImNsaWVudFNlY3JldCI6InB6aEFCcUZocnFtV3dCekEifQ.0KXVEmClIsB4CgTQiEHu2fLsBz7cDThzyu1oRt7o8TE";

const BASE_URL = "/api/notify";

export interface Notification {
  ID: string;
  Type: "Placement" | "Result" | "Event";
  Message: string;
  Timestamp: string;
}

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function calculatePriorityScore(notification: Notification): number {
  const typeWeight = TYPE_WEIGHT[notification.Type] || 0;
  const timestamp = new Date(notification.Timestamp).getTime();
  const now = Date.now();
  const ageInMinutes = (now - timestamp) / (1000 * 60);
  const recencyScore = Math.max(0, 100 - ageInMinutes * 0.1);
  return typeWeight * 40 + recencyScore;
}

export async function fetchNotifications(params?: {
  limit?: number;
  page?: number;
  notification_type?: string;
}): Promise<Notification[]> {
  await Log("frontend", "info", "api", "Fetching notifications from API");

 const params_str = new URLSearchParams();
if (params?.limit) params_str.set("limit", String(params.limit));
if (params?.page) params_str.set("page", String(params.page));
if (params?.notification_type) params_str.set("notification_type", params.notification_type);
const queryString = params_str.toString();
const url = `${BASE_URL}${queryString ? "?" + queryString : ""}`;

  try {
   const response = await fetch(url, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      cache: "no-store",
    });

    if (!response.ok) {
      await Log("frontend", "error", "api", `Notification fetch failed: ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    await Log(
      "frontend",
      "info",
      "api",
      `Successfully fetched ${data.notifications?.length ?? 0} notifications`
    );
    return data.notifications ?? [];
  } catch (err) {
    await Log("frontend", "fatal", "api", `Critical failure fetching notifications: ${err}`);
    throw err;
  }
}

export function getTopNByPriority(notifications: Notification[], n: number): Notification[] {
  return [...notifications]
    .map((notif) => ({ ...notif, score: calculatePriorityScore(notif) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}