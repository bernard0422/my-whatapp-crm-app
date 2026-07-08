import Link from "next/link";
import { contactLabel, currency, getDashboardData } from "@/lib/crm/data";

export default async function Home() {
  const { messages, contacts, leads, orders, subscription, errors } =
    await getDashboardData();

  const revenue = orders
    .filter((order) => order.status === "fulfilled")
    .reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);

  const activeSubscription = subscription?.status === "active";

  return (
    <main className="space-y-6">
      {errors.length > 0 ? (
        <section className="notice danger">
          Something went wrong loading live CRM data. Check Supabase env vars and table
          access.
        </section>
      ) : null}

      <section className="hero-band">
        <div>
          <p className="eyebrow">WhatsApp CRM</p>
          <h1>Orders, replies, and follow-ups in one working dashboard.</h1>
        </div>
        <div className={activeSubscription ? "pill success" : "pill warning"}>
          {activeSubscription ? "Starter active" : "Trial mode"}
        </div>
      </section>

      {!activeSubscription ? (
        <section className="notice">
          <span>Your 7-day trial is running. Subscribe to keep automations on.</span>
          <Link href="/pricing" className="button secondary">
            View pricing
          </Link>
        </section>
      ) : null}

      <section className="metric-grid">
        <article className="metric">
          <span>Today&apos;s messages</span>
          <strong>{messages.length}</strong>
        </article>
        <article className="metric">
          <span>Open leads</span>
          <strong>{leads.length}</strong>
        </article>
        <article className="metric">
          <span>Fulfilled revenue</span>
          <strong>{currency(revenue)}</strong>
        </article>
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="section-heading">
            <h2>Live message feed</h2>
            <Link href="/contacts">Contacts</Link>
          </div>
          {messages.length ? (
            <div className="stack">
              {messages.map((message: any) => (
                <Link
                  className="row-link"
                  href={`/contacts/${message.contact_id}`}
                  key={message.id}
                >
                  <span>
                    <strong>{contactLabel(message.contacts)}</strong>
                    <small>{message.body}</small>
                  </span>
                  <em>{message.direction}</em>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty">Send your WhatsApp link to a customer.</div>
          )}
        </div>

        <div className="panel">
          <div className="section-heading">
            <h2>Hot leads</h2>
            <Link href="/leads">All leads</Link>
          </div>
          {leads.length ? (
            <div className="stack">
              {leads.slice(0, 5).map((lead: any) => (
                <Link className="row-link" href="/leads" key={lead.id}>
                  <span>
                    <strong>{contactLabel(lead.contacts)}</strong>
                    <small>{lead.notes || "No notes yet"}</small>
                  </span>
                  <em>{lead.lead_score ?? 0}</em>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty">Create a lead from any conversation.</div>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Order pipeline</h2>
          <Link href="/orders">Open board</Link>
        </div>
        <div className="mini-board">
          {["new", "confirmed", "fulfilled"].map((status) => (
            <div className="mini-column" key={status}>
              <h3>{status}</h3>
              {orders
                .filter((order) => order.status === status)
                .slice(0, 3)
                .map((order: any) => (
                  <div className="mini-card" key={order.id}>
                    <strong>{contactLabel(order.contacts)}</strong>
                    <span>{currency(order.total_amount)}</span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
