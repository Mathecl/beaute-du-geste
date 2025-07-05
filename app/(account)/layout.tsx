interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
