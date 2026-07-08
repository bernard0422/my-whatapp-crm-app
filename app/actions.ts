"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseLineItems, totalFor } from "@/lib/crm/data";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createContact(formData: FormData) {
  const supabase = await createClient();
  const phone = value(formData, "phone");
  const name = value(formData, "name");

  if (!phone) throw new Error("Phone is required.");

  const { error } = await supabase.from("contacts").insert({
    phone,
    name: name || null,
    wa_profile_name: name || null,
    tags: ["manual"],
  });

  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/contacts");
  redirect("/contacts");
}

export async function createLead(formData: FormData) {
  const supabase = await createClient();
  const contactId = value(formData, "contact_id");
  const notes = value(formData, "notes");

  if (!contactId) throw new Error("Contact is required.");

  const { data: contact } = await supabase
    .from("contacts")
    .select("id")
    .eq("id", contactId)
    .single();

  if (!contact) throw new Error("Contact not found.");

  const { error } = await supabase.from("leads").insert({
    contact_id: contactId,
    status: "new",
    notes: notes || "Created from conversation",
    lead_score: 50,
    lead_score_source: "owner-created",
    lead_score_confidence: 1,
  });

  if (error) throw error;
  await supabase.from("audit_logs").insert({
    action: "lead_created",
    entity_type: "lead",
    payload_json: { contact_id: contactId, notes },
    risk_level: "medium",
  });

  revalidatePath("/");
  revalidatePath("/leads");
  revalidatePath(`/contacts/${contactId}`);
  redirect("/leads");
}

export async function convertLeadToOrder(formData: FormData) {
  const supabase = await createClient();
  const leadId = value(formData, "lead_id");
  const contactId = value(formData, "contact_id");
  const notes = value(formData, "notes");
  const lineItems = parseLineItems(formData);
  const total = totalFor(lineItems);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      contact_id: contactId,
      lead_id: leadId || null,
      status: "new",
      line_items: lineItems,
      total_amount: total,
      notes: notes || null,
    })
    .select("id")
    .single();

  if (error) throw error;

  if (leadId) {
    await supabase
      .from("leads")
      .update({ status: "converted" })
      .eq("id", leadId);
  }

  await supabase.from("audit_logs").insert({
    action: "order_created",
    entity_type: "order",
    entity_id: order.id,
    payload_json: { contact_id: contactId, lead_id: leadId, line_items: lineItems, total },
    risk_level: "high",
  });

  revalidatePath("/");
  revalidatePath("/leads");
  revalidatePath("/orders");
  if (contactId) revalidatePath(`/contacts/${contactId}`);
  redirect("/orders");
}

export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient();
  const orderId = value(formData, "order_id");
  const status = value(formData, "status");

  if (!["new", "confirmed", "fulfilled", "cancelled"].includes(status)) {
    throw new Error("Invalid order status.");
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw error;
  await supabase.from("audit_logs").insert({
    action: "order_status_updated",
    entity_type: "order",
    entity_id: orderId,
    payload_json: { status },
    risk_level: "medium",
  });

  revalidatePath("/");
  revalidatePath("/orders");
}

export async function createAutoReply(formData: FormData) {
  const supabase = await createClient();
  const keyword = value(formData, "keyword").toLowerCase();
  const responseText = value(formData, "response_text");

  if (!keyword || !responseText) throw new Error("Keyword and response are required.");

  const { error } = await supabase.from("auto_replies").insert({
    keyword,
    response_text: responseText,
    active: true,
  });

  if (error) throw error;
  revalidatePath("/settings/autoreplies");
}

export async function updateAutoReply(formData: FormData) {
  const supabase = await createClient();
  const id = value(formData, "id");
  const keyword = value(formData, "keyword").toLowerCase();
  const responseText = value(formData, "response_text");
  const active = formData.get("active") === "on";

  const { error } = await supabase
    .from("auto_replies")
    .update({ keyword, response_text: responseText, active })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/settings/autoreplies");
}

export async function deleteAutoReply(formData: FormData) {
  const supabase = await createClient();
  const id = value(formData, "id");
  const { error } = await supabase.from("auto_replies").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/settings/autoreplies");
}

export async function activateDemoSubscription() {
  const supabase = await createClient();
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const { error } = await supabase.from("subscriptions").insert({
    user_id: DEMO_USER_ID,
    stripe_customer_id: "demo_customer",
    stripe_subscription_id: "demo_subscription",
    status: "active",
    plan: "starter",
    current_period_end: periodEnd.toISOString(),
  });

  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/pricing");
  redirect("/");
}
