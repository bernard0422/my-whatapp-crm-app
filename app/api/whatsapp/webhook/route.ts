import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function verifySignature(rawBody: string, signature: string | null) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return true;
  if (!signature?.startsWith("sha256=")) return false;

  const expected = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")}`;

  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

async function sendWhatsApp(to: string, body: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return { ok: false, simulated: true, error: "WhatsApp env vars are not configured." };
  }

  const response = await fetch(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      }),
    },
  );

  if (!response.ok) {
    return { ok: false, simulated: false, error: await response.text() };
  }

  return { ok: true, simulated: false, data: await response.json() };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const supabase = await createClient();

  if (!verifySignature(rawBody, signature)) {
    await supabase.from("audit_logs").insert({
      action: "webhook_rejected",
      entity_type: "message",
      payload_json: { reason: "invalid_signature" },
      risk_level: "high",
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const payload = JSON.parse(rawBody);
  const value = payload.entry?.[0]?.changes?.[0]?.value;
  const inbound = value?.messages?.[0];
  const profile = value?.contacts?.[0]?.profile;
  const waId = value?.contacts?.[0]?.wa_id;

  if (!inbound?.from || !inbound?.text?.body) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const phone = inbound.from.startsWith("+") ? inbound.from : `+${inbound.from}`;
  const body = inbound.text.body;

  const existingContact = await supabase
    .from("contacts")
    .select("id")
    .eq("phone", phone)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const contactWrite = existingContact.data
    ? await supabase
        .from("contacts")
        .update({
          wa_profile_name: profile?.name ?? null,
          name: profile?.name ?? waId ?? null,
        })
        .eq("id", existingContact.data.id)
        .select("id")
        .single()
    : await supabase
        .from("contacts")
        .insert({
          phone,
          wa_profile_name: profile?.name ?? null,
          name: profile?.name ?? waId ?? null,
          tags: ["whatsapp"],
        })
        .select("id")
        .single();

  if (contactWrite.error) {
    return NextResponse.json({ error: contactWrite.error.message }, { status: 500 });
  }

  const contact = contactWrite.data;

  const { data: message, error: messageError } = await supabase
    .from("messages")
    .insert({
      contact_id: contact.id,
      direction: "inbound",
      body,
      wa_message_id: inbound.id ?? null,
    })
    .select("id")
    .single();

  if (messageError) {
    return NextResponse.json({ error: messageError.message }, { status: 500 });
  }

  const { data: rules } = await supabase
    .from("auto_replies")
    .select("*")
    .eq("active", true);

  const matchedRule = (rules ?? []).find((rule) =>
    body.toLowerCase().includes(String(rule.keyword).toLowerCase()),
  );

  if (matchedRule) {
    await supabase.from("audit_logs").insert({
      action: "autoreply_triggered",
      entity_type: "message",
      entity_id: message.id,
      payload_json: { keyword: matchedRule.keyword, contact_id: contact.id },
      risk_level: "high",
    });

    const sendResult = await sendWhatsApp(phone, matchedRule.response_text);
    await supabase.from("messages").insert({
      contact_id: contact.id,
      direction: "outbound",
      body: matchedRule.response_text,
      wa_message_id: sendResult.ok ? sendResult.data?.messages?.[0]?.id : null,
      replied_by_rule: matchedRule.id,
    });

    if (!sendResult.ok) {
      await supabase.from("audit_logs").insert({
        action: "whatsapp_send_failed",
        entity_type: "message",
        payload_json: {
          contact_id: contact.id,
          error: sendResult.error,
          simulated: sendResult.simulated,
        },
        risk_level: "high",
      });
    }
  }

  return NextResponse.json({ received: true, contact_id: contact.id });
}
