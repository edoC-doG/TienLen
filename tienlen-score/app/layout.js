import './globals.css';

export const metadata = {
  title: 'Tiến Lên - Tính Điểm',
  description: 'Ứng dụng tính điểm bài Tiến Lên Miền Nam',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <meta name="theme-color" content="#166534" />
      </head>
      <body>{children}</body>
    </html>
  );
}
