export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-8">
      <header className="mb-4 font-semibold text-indigo-600">Layout: (auth)</header>
      <main>{children}</main>
    </div>
  );
}
