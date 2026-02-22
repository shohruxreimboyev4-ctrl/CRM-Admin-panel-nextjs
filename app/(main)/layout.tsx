export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#020617]">
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
        <main className="flex-1 relative overflow-y-auto">
          <div className="py-4 px-2 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
