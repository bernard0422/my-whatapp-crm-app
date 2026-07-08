import Link from "next/link";
import { convertLeadToOrder } from "@/app/actions";
import { contactLabel, getLeads } from "@/lib/crm/data";

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <main className="space-y-6">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Pipeline</p>
          <h1>Leads</h1>
        </div>
      </section>

      <section className="panel">
        {leads.length ? (
          <div className="lead-grid">
            {leads.map((lead) => (
              <article className="lead-card" key={lead.id}>
                <div className="section-heading">
                  <div>
                    <h2>{contactLabel(lead.contacts)}</h2>
                    <p>{lead.notes || "No notes yet"}</p>
                  </div>
                  <span className="pill">{lead.status}</span>
                </div>
                <p>Score {lead.lead_score ?? 0}</p>
                <form action={convertLeadToOrder} className="stack compact">
                  <input type="hidden" name="lead_id" value={lead.id} />
                  <input type="hidden" name="contact_id" value={lead.contact_id ?? ""} />
                  <input name="item_name" defaultValue="Nasi Lemak" required />
                  <div className="split">
                    <input name="item_qty" type="number" min="1" defaultValue="2" required />
                    <input name="item_price" type="number" min="0" step="0.01" defaultValue="8" required />
                  </div>
                  <textarea name="notes" placeholder="Order notes" />
                  <button className="button" type="submit">
                    Convert to order
                  </button>
                </form>
                {lead.contact_id ? (
                  <Link href={`/contacts/${lead.contact_id}`}>Open conversation</Link>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">Open a contact conversation and create the first lead.</div>
        )}
      </section>
    </main>
  );
}
