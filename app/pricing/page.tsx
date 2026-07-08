import { activateDemoSubscription } from "@/app/actions";

export default function PricingPage() {
  return (
    <main className="space-y-6">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Starter</p>
          <h1>RM equivalent of $19 per month</h1>
        </div>
      </section>

      <section className="pricing-band">
        <div>
          <h2>WhatsApp CRM Starter</h2>
          <p>Keyword auto-replies, lead conversion, order board, and revenue tracking.</p>
          <strong>$19/mo</strong>
        </div>
        <form action="/api/stripe/checkout" method="post">
          <button className="button" type="submit">
            Subscribe with Stripe
          </button>
        </form>
        <form action={activateDemoSubscription}>
          <button className="button secondary" type="submit">
            Mark demo subscription active
          </button>
        </form>
      </section>
    </main>
  );
}
