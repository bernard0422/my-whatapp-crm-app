import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const index = line.indexOf("=");
  if (index > 0 && !line.startsWith("#")) {
    env[line.slice(0, index)] = line.slice(index + 1).replace(/^"|"$/g, "");
  }
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

for (const table of [
  "contacts",
  "messages",
  "leads",
  "orders",
  "auto_replies",
  "subscriptions",
]) {
  const { data, error } = await supabase.from(table).select("*").limit(1);
  console.log(table, error ? error.message : `ok ${data.length}`);
}

const start = new Date();
start.setHours(0, 0, 0, 0);

const dashboardChecks = {
  todayMessages: supabase
    .from("messages")
    .select("*")
    .gte("created_at", start.toISOString())
    .order("created_at", { ascending: false })
    .limit(8),
  recentContacts: supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6),
  openLeads: supabase
    .from("leads")
    .select("*")
    .neq("status", "converted")
    .order("lead_score", { ascending: false, nullsFirst: false }),
  recentOrders: supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false }),
  latestSubscription: supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1),
};

for (const [name, query] of Object.entries(dashboardChecks)) {
  const { data, error } = await query;
  console.log(name, error ? error.message : `ok ${data.length}`);
}
