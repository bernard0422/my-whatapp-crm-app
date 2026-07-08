import { createLead, convertLeadToOrder } from "@/app/actions";
import { contactLabel, currency, getContactDetail } from "@/lib/crm/data";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { contact, messages, leads, orders } = await getContactDetail(id);
  const latestLead = leads.find((lead) => lead.status !== "converted");

  return (
    <main className="space-y-6">
      <section className="page-heading">
        <div>
          <p className="eyebrow">{contact.phone}</p>
          <h1>{contactLabel(contact)}</h1>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="section-heading">
            <h2>Conversation</h2>
          </div>
          <div className="thread">
            {messages.map((message) => (
              <div className={`bubble ${message.direction}`} key={message.id}>
                <span>{message.body}</span>
                <small>{new Date(message.created_at).toLocaleString()}</small>
              </div>
            ))}
            {!messages.length ? <div className="empty">No messages yet.</div> : null}
          </div>
        </div>

        <div className="panel stack">
          <div>
            <h2>Create lead</h2>
            <form action={createLead} className="stack compact">
              <input type="hidden" name="contact_id" value={contact.id} />
              <textarea name="notes" placeholder="What does this customer want?" />
              <button className="button" type="submit">
                Create lead
              </button>
            </form>
          </div>

          <div>
            <h2>Convert to order</h2>
            <form action={convertLeadToOrder} className="stack compact">
              <input type="hidden" name="contact_id" value={contact.id} />
              <input type="hidden" name="lead_id" value={latestLead?.id ?? ""} />
              <input name="item_name" defaultValue="Nasi Lemak" required />
              <div className="split">
                <input name="item_qty" type="number" min="1" defaultValue="2" required />
                <input name="item_price" type="number" min="0" step="0.01" defaultValue="8" required />
              </div>
              <textarea name="notes" placeholder="Delivery notes" />
              <button className="button" type="submit">
                Convert to order
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Orders</h2>
        </div>
        <div className="table-list">
          {orders.map((order) => (
            <div className="table-row" key={order.id}>
              <span>
                <strong>{order.status}</strong>
                <small>{order.notes || "No notes"}</small>
              </span>
              <span>{currency(order.total_amount)}</span>
            </div>
          ))}
          {!orders.length ? <div className="empty">No orders for this contact.</div> : null}
        </div>
      </section>
    </main>
  );
}
