import "./globals.css";

export const metadata = {
  title: "BetPro Wallet Test",
  description: "Standalone test app for BetPro deposit/withdraw automation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">{children}</body>
    </html>
  );
}
