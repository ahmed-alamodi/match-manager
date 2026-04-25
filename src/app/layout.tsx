export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The [locale]/layout.tsx owns the real <html> and <body> with lang/dir.
  // suppressHydrationWarning prevents React complaining about attribute mismatches.
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
