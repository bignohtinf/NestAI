'use client';

interface SectionHeaderProps {
  icon: string;
  title: string;
  description?: string;
  subtitle?: string;
}

export const SectionHeader = ({ icon, title, description, subtitle }: SectionHeaderProps) => {
  return (
    <div className="mb-6 pb-4 border-b border-border/50">
      <div className="flex items-start gap-3">
        <span className="text-4xl">{icon}</span>
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
          {description && (
            <p className="text-sm md:text-base text-muted-foreground mt-2">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};
