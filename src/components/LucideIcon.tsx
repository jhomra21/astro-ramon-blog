import * as icons from 'lucide-react';
import type { LucideProps, LucideIcon as LucideIconType } from 'lucide-react';

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: keyof typeof icons;
}

export default function LucideIcon({ name, ...props }: IconProps) {
  const Icon = icons[name] as LucideIconType;

  if (!Icon) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return <Icon {...props} />;
} 