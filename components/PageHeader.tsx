export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <h1 className="font-serif text-3xl">{title}</h1>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
        <div className="gold-line mt-4 w-24" />
      </div>
      {action}
    </div>
  );
}
