export default function SectionTitle({ children, accent = '#52525b' }) {
  return (
    <h2 className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
      <span
        className="inline-block h-3 w-0.5 rounded-full"
        style={{ backgroundColor: accent }}
      />
      {children}
    </h2>
  );
}
