import { NextResponse } from "next/server";

const AUTH_URL = "http://4.224.186.213/evaluation-service/auth";
const NOTIF_URL = "http://4.224.186.213/evaluation-service/notifications";
const LOG_URL = "http://4.224.186.213/evaluation-service/logs";

async function getToken(): Promise<string> {
  const r = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "thiruchelvan.2022@vitstudent.ac.in",
      name: "Thiruchelvan",
      rollNo: "22MIA1178",
      accessCode: "SfFuWg",
      clientID: "b9092640-248b-43e6-bc31-4db33a537518",
      clientSecret: "pzhABqFhrqmWwBzA",
    }),
  });
  const data = await r.json();
  return data.access_token;
}

export async function GET(request: Request) {
  try {
    const token = await getToken();
    const { searchParams } = new URL(request.url);
    const url = new URL(NOTIF_URL);
    searchParams.forEach((v, k) => url.searchParams.set(k, v));

    const r = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await r.json();
    return NextResponse.json({ ...data, token });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = await getToken();
    const body = await request.json();
    const r = await fetch(LOG_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}