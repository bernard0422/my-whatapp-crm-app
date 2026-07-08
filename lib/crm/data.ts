import { createClient } from "@/lib/supabase/server";

export type Contact = {
  id: string;
  phone: string;
  name: string | null;
  wa_profile_name: string | null;
  tags: string[] | null;
  created_at: string;
};

export type Message = {
  id: string;
  contact_id: string | null;
  direction: "inbound" | "outbound";
  body: string | null;
  wa_message_id: string | null;
  replied_by_rule: string | null;
  created_at: string;
};

export type Lead = {
  id: string;
  contact_id: string | null;
  status: string;
  notes: string | null;
  lead_score: number | null;
  created_at: string;
  contacts?: Pick<Contact, "id" | "name" | "phone"> | null;
};

export type Order = {
  id: string;
  contact_id: string | null;
  lead_id: string | null;
  status: string;
  line_items: LineItem[] | null;
  total_amount: number | null;
  notes: string | null;
  created_at: string;
  contacts?: Pick<Contact, "id" | "name" | "phone"> | null;
};

export type AutoReply = {
  id: string;
  keyword: string;
  response_text: string;
  active: boolean;
  created_at: string;
};

export type Subscription = {
  id: string;
  status: string;
  plan: string;
  current_period_end: string | null;
  created_at: string;
};

export type LineItem = {
  name: string;
  qty: number;
  price: number;
};

export async function getDashboardData() {
  const supabase = await createClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const [
    messagesResult,
    contactsResult,
    leadsResult,
    ordersResult,
    subscriptionResult,
  ] = await Promise.all([
    supabase
      .from("messages")
      .select("*")
      .gte("created_at", start.toISOString())
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("leads")
      .select("*")
      .neq("status", "converted")
      .order("lead_score", { ascending: false, nullsFirst: false }),
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const contacts = (contactsResult.data ?? []) as Contact[];
  const byId = new Map(contacts.map((contact) => [contact.id, contact]));

  const errors = [
    messagesResult.error,
    contactsResult.error,
    leadsResult.error,
    ordersResult.error,
    subscriptionResult.error,
  ].filter(Boolean);

  if (errors.length) {
    console.warn("[crm/dashboard]", errors.map((error) => error?.message).join(" | "));
  }

  return {
    messages: (messagesResult.data ?? []).map((message) => ({
      ...message,
      contacts: byId.get(message.contact_id ?? "") ?? null,
    })),
    contacts: contactsResult.data ?? [],
    leads: (leadsResult.data ?? []).map((lead) => ({
      ...lead,
      contacts: byId.get(lead.contact_id ?? "") ?? null,
    })),
    orders: (ordersResult.data ?? []).map((order) => ({
      ...order,
      contacts: byId.get(order.contact_id ?? "") ?? null,
    })),
    subscription: subscriptionResult.data?.[0] ?? null,
    errors,
  };
}

export async function getContacts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Contact[];
}

export async function getContactDetail(id: string) {
  const supabase = await createClient();
  const [contact, messages, leads, orders] = await Promise.all([
    supabase.from("contacts").select("*").eq("id", id).single(),
    supabase
      .from("messages")
      .select("*")
      .eq("contact_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("leads")
      .select("*")
      .eq("contact_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("*")
      .eq("contact_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (contact.error) throw contact.error;
  return {
    contact: contact.data as Contact,
    messages: (messages.data ?? []) as Message[],
    leads: (leads.data ?? []) as Lead[],
    orders: (orders.data ?? []) as Order[],
  };
}

export async function getLeads() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  const contactIds = [...new Set((data ?? []).map((lead) => lead.contact_id).filter(Boolean))];
  const contacts = contactIds.length
    ? await supabase.from("contacts").select("id, name, phone").in("id", contactIds)
    : { data: [] };
  const byId = new Map((contacts.data ?? []).map((contact) => [contact.id, contact]));
  return (data ?? []).map((lead) => ({
    ...lead,
    contacts: byId.get(lead.contact_id ?? "") ?? null,
  })) as Lead[];
}

export async function getOrders() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  const contactIds = [...new Set((data ?? []).map((order) => order.contact_id).filter(Boolean))];
  const contacts = contactIds.length
    ? await supabase.from("contacts").select("id, name, phone").in("id", contactIds)
    : { data: [] };
  const byId = new Map((contacts.data ?? []).map((contact) => [contact.id, contact]));
  return (data ?? []).map((order) => ({
    ...order,
    contacts: byId.get(order.contact_id ?? "") ?? null,
  })) as Order[];
}

export async function getAutoReplies() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("auto_replies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as AutoReply[];
}

export function currency(amount: number | null | undefined) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(Number(amount ?? 0));
}

export function contactLabel(contact?: Pick<Contact, "name" | "phone"> | null) {
  if (!contact) return "Unknown contact";
  return contact.name || contact.phone;
}

export function parseLineItems(formData: FormData): LineItem[] {
  const name = String(formData.get("item_name") ?? "").trim();
  const qty = Number(formData.get("item_qty") ?? 0);
  const price = Number(formData.get("item_price") ?? 0);

  if (!name || qty <= 0 || price < 0) {
    throw new Error("Add an item name, quantity, and price.");
  }

  return [{ name, qty, price }];
}

export function totalFor(items: LineItem[]) {
  return items.reduce((sum, item) => sum + item.qty * item.price, 0);
}
