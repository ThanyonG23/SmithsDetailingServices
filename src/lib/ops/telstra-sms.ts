/* Telstra Messaging API v3 sender for Smiths.

   The single compliance checkpoint for the Australian Spam Act 2003: every
   outbound SMS (a) checks the opt-out ledger and (b) carries a "Reply STOP"
   footer. Opt-outs are captured by /api/telstra/inbound when people reply STOP.

   Ported from the ServHQ integration, adapted to the Smiths `postgres` client. */

import { isUnsubscribed, normalisePhone } from "./sms-db";

let cachedToken: { token: string; expires: number } | null = null;
let cachedVirtualNumber: string | null = null;

const AUTH_URL = "https://products.api.telstra.com/v2/oauth/token";
const SEND_URL = "https://products.api.telstra.com/messaging/v3/messages";
const VN_URL = "https://products.api.telstra.com/messaging/v3/virtual-numbers";

const STOP_FOOTER = " Reply STOP to opt out.";

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) return cachedToken.token;

  const clientId = process.env.TELSTRA_CLIENT_ID;
  const clientSecret = process.env.TELSTRA_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Telstra API credentials not configured");

  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) throw new Error(`Telstra auth failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  cachedToken = { token: data.access_token, expires: Date.now() + ((data.expires_in || 3600) - 60) * 1000 };
  return data.access_token;
}

async function getVirtualNumber(token: string): Promise<string> {
  if (cachedVirtualNumber) return cachedVirtualNumber;

  const fetchRes = await fetch(`${VN_URL}?limit=1&offset=0`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "content-language": "en-au" },
  });
  if (fetchRes.ok) {
    const data = await fetchRes.json();
    const list = data.virtualNumbers || data.virtual_numbers || data.items || [];
    if (Array.isArray(list) && list.length > 0) {
      const vn = list[0].virtualNumber || list[0].virtual_number || list[0].number || "";
      if (vn) return (cachedVirtualNumber = vn);
    }
  }

  const assignRes = await fetch(VN_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "content-language": "en-au",
    },
    body: JSON.stringify({
      replyCallbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://smithsdetailingservices.com.au"}/api/telstra/inbound`,
      tags: ["smiths-crm"],
    }),
  });
  if (assignRes.ok) {
    const data = await assignRes.json();
    const vn = data.virtualNumber || data.virtual_number || "";
    if (vn) return (cachedVirtualNumber = vn);
  }
  throw new Error("Could not get or assign Telstra virtual number");
}

export type SendResult = { success: boolean; messageId?: string; error?: string; blocked?: "opted_out" };

export async function sendSMS(to: string, body: string): Promise<SendResult> {
  try {
    const phone = normalisePhone(to);

    // Spam Act: never send to opted-out phones.
    if (await isUnsubscribed(phone)) return { success: false, blocked: "opted_out" };

    const token = await getAccessToken();
    const fromNumber = await getVirtualNumber(token);

    // Keep body + footer within a single 160-char segment.
    const maxBodyLen = 160 - STOP_FOOTER.length;
    const fullBody = `${body.slice(0, maxBodyLen)}${STOP_FOOTER}`;

    const res = await fetch(SEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "content-language": "en-au",
      },
      body: JSON.stringify({ to: [phone], from: fromNumber, messageContent: fullBody }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, messageId: data.messageId || data.messages?.[0]?.messageId };
    }
    const errText = await res.text();
    if (res.status === 401) {
      cachedToken = null;
      cachedVirtualNumber = null;
    }
    return { success: false, error: `${res.status}: ${errText.slice(0, 200)}` };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "send error" };
  }
}
