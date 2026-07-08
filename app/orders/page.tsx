import { updateOrderStatus } from "@/app/actions";
import { contactLabel, currency, getOrders } from "@/lib/crm/data";

const statuses = ["new", "confirmed", "fulfilled"] as const;

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <main className="space-y-6">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Fulfillment</p>
          <h1>Orders</h1>
        </div>
      </section>

      <section className="board">
        {statuses.map((status) => (
          <div className="board-column" key={status}>
            <h2>{status}</h2>
            {orders
              .filter((order) => order.status === status)
              .map((order) => (
                <article className="order-card" key={order.id}>
                  <div>
                    <strong>{contactLabel(order.contacts)}</strong>
                    <p>{order.notes || "No notes"}</p>
                  </div>
                  <div className="items">
                    {(order.line_items ?? []).map((item, index) => (
                      <span key={`${order.id}-${index}`}>
                        {item.qty} x {item.name} @ {currency(item.price)}
                      </span>
                    ))}
                  </div>
                  <strong>{currency(order.total_amount)}</strong>
                  <form action={updateOrderStatus} className="status-actions">
                    <input type="hidden" name="order_id" value={order.id} />
                    {statuses.map((next) => (
                      <button
                        className={next === order.status ? "chip active" : "chip"}
                        disabled={next === order.status}
                        key={next}
                        name="status"
                        value={next}
                        type="submit"
                      >
                        {next}
                      </button>
                    ))}
                  </form>
                </article>
              ))}
            {!orders.some((order) => order.status === status) ? (
              <div className="empty small">No {status} orders.</div>
            ) : null}
          </div>
        ))}
      </section>
    </main>
  );
}
