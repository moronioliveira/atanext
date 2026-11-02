export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f8fb] text-[#102a43]">
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-[#c5eaf2] border-t-[#006d8f]"
          aria-hidden="true"
        />
        <p className="text-sm font-semibold">Carregando o planejamento...</p>
      </div>
    </main>
  );
}
