import './globals.css';

export const metadata = {
  title: 'DevFlow',
  description: 'Project management for dev teams',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}