import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "SeatSure — Event Booking",
  description: "ระบบจองอีเวนต์ที่ป้องกันการจองเกินด้วย PostgreSQL transaction",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>
        <Nav />
        {children}
        <footer className="footer"><div className="shell">SeatSure · General admission event booking demo</div></footer>
      </body>
    </html>
  );
}
