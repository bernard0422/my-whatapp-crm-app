import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhatsApp CRM",
  description: "A WhatsApp-native CRM for small business orders",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = [
    ["/", "Dashboard"],
    ["/contacts", "Contacts"],
    ["/leads", "Leads"],
    ["/orders", "Orders"],
    ["/settings/autoreplies", "Auto-replies"],
    ["/pricing", "Pricing"],
  ];

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="app-shell">
          <aside className="sidebar">
            <div className="brand">
              <span>WA</span>
              <strong>WhatsApp CRM</strong>
            </div>
            <nav>
              {nav.map(([href, label]) => (
                <a href={href} key={href}>
                  {label}
                </a>
              ))}
            </nav>
          </aside>
          <div className="main-shell">{children}</div>
        </div>
      </body>
    </html>
  );
}
