import Link from "next/link";
import { createContact } from "@/app/actions";
import { getContacts } from "@/lib/crm/data";

export default async function ContactsPage() {
  const contacts = await getContacts();

  return (
    <main className="space-y-6">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Customers</p>
          <h1>Contacts</h1>
        </div>
      </section>

      <section className="panel">
        <form action={createContact} className="inline-form">
          <input name="name" placeholder="Customer name" />
          <input name="phone" placeholder="+60123456789" required />
          <button className="button" type="submit">
            Add contact
          </button>
        </form>
      </section>

      <section className="panel">
        {contacts.length ? (
          <div className="table-list">
            {contacts.map((contact) => (
              <Link className="table-row" href={`/contacts/${contact.id}`} key={contact.id}>
                <span>
                  <strong>{contact.name || contact.wa_profile_name || "Unnamed"}</strong>
                  <small>{contact.phone}</small>
                </span>
                <span>{contact.tags?.join(", ") || "No tags"}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty">No contacts yet.</div>
        )}
      </section>
    </main>
  );
}
