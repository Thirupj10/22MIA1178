const ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ0aGlydWNoZWx2YW4uMjAyMkB2aXRzdHVkZW50LmFjLmluIiwiZXhwIjoxNzc4OTI4MTQ4LCJpYXQiOjE3Nzg5MjcyNDgsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiJkMDkzZjU0Yi1iY2RlLTQ1YTUtYWRmOC1kYTkyMTkyODU0NjAiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJ0aGlydWNoZWx2YW4iLCJzdWIiOiJiOTA5MjY0MC0yNDhiLTQzZTYtYmMzMS00ZGIzM2E1Mzc1MTgifSwiZW1haWwiOiJ0aGlydWNoZWx2YW4uMjAyMkB2aXRzdHVkZW50LmFjLmluIiwibmFtZSI6InRoaXJ1Y2hlbHZhbiIsInJvbGxObyI6IjIybWlhMTE3OCIsImFjY2Vzc0NvZGUiOiJTZkZ1V2ciLCJjbGllbnRJRCI6ImI5MDkyNjQwLTI0OGItNDNlNi1iYzMxLTRkYjMzYTUzNzUxOCIsImNsaWVudFNlY3JldCI6InB6aEFCcUZocnFtV3dCekEifQ._GKfk5OXex8ujs4xXIgZVzdGGB_YTnUZErOZhJG2fMc";

const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";

type Stack = "frontend" | "backend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
type Package =
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style"
  | "auth"
  | "config"
  | "middleware"
  | "utils";

export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<void> {
  try {
    const response = await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        stack,
        level,
        package: pkg,
        message,
      }),
    });
    const data = await response.json();
    console.log(`[LOG] ${level.toUpperCase()} | ${stack} | ${pkg} | ${message}`, data);
  } catch (error) {
    console.error("[LOG ERROR] Failed to send log:", error);
  }
}