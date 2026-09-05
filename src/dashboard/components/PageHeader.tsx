interface PageHeaderProps {
  title: string;
  description: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-[#0F3952]">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </header>
  );
}
