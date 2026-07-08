import {
  createAutoReply,
  deleteAutoReply,
  updateAutoReply,
} from "@/app/actions";
import { getAutoReplies } from "@/lib/crm/data";

export default async function AutoRepliesPage() {
  const rules = await getAutoReplies();

  return (
    <main className="space-y-6">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Automation</p>
          <h1>Auto-replies</h1>
        </div>
      </section>

      <section className="panel">
        <form action={createAutoReply} className="inline-form">
          <input name="keyword" placeholder="price" required />
          <input name="response_text" placeholder="Reply text" required />
          <button className="button" type="submit">
            Add rule
          </button>
        </form>
      </section>

      <section className="panel">
        {rules.length ? (
          <div className="stack">
            {rules.map((rule) => (
              <form action={updateAutoReply} className="rule-row" key={rule.id}>
                <input type="hidden" name="id" value={rule.id} />
                <input name="keyword" defaultValue={rule.keyword} required />
                <input name="response_text" defaultValue={rule.response_text} required />
                <label className="toggle">
                  <input name="active" type="checkbox" defaultChecked={rule.active} />
                  Active
                </label>
                <button className="button secondary" type="submit">
                  Save
                </button>
                <button
                  className="button danger"
                  formAction={deleteAutoReply}
                  type="submit"
                >
                  Delete
                </button>
              </form>
            ))}
          </div>
        ) : (
          <div className="empty">Add your first rule.</div>
        )}
      </section>
    </main>
  );
}
