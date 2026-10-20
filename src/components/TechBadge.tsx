import { cn } from "@/lib/utils";

interface TechBadgeProps {
  tech: string;
  tooltip: string;
}

const techColors = new Map(Object.entries({
  "React": "hover:bg-sky-500 hover:border-sky-500 border-sky-500/50 text-sky-700 dark:border-sky-400/50 dark:text-sky-400",
  "TypeScript": "hover:bg-blue-500 hover:border-blue-500 border-blue-500/50 text-blue-600 dark:border-blue-400/50 dark:text-blue-400",
  "FFMPEG": "hover:bg-green-500 hover:border-green-500 border-green-500/50 text-green-700 dark:border-green-400/50 dark:text-green-400",
  "Solid.js": "hover:bg-[#2C4F7C] hover:border-[#2C4F7C] border-[#2C4F7C]/50 text-[#2C4F7C] dark:border-blue-400/50 dark:text-blue-400",
  "Hono.js": "hover:bg-[#E26A3D] hover:border-[#E26A3D] border-[#E26A3D]/50 text-orange-700 dark:border-orange-400/50 dark:text-orange-400",
  "Three.js": "hover:bg-violet-600 hover:border-violet-600 border-violet-600/50 text-violet-600 dark:border-violet-400/50 dark:text-violet-400",
  "D3.js": "hover:bg-violet-500 hover:border-violet-500 border-violet-500/50 text-violet-600 dark:border-violet-400/50 dark:text-violet-400",
  "WebGL": "hover:bg-red-900 hover:border-red-900 border-red-900/50 text-red-900 dark:border-red-400/50 dark:text-red-400",
  "Cloudflare": "hover:bg-[#F6821F] hover:border-[#F6821F] border-[#F6821F]/50 text-orange-700 dark:border-orange-400/50 dark:text-orange-400",
  "Supabase": "hover:bg-emerald-500 hover:border-emerald-500 border-emerald-500/50 text-emerald-700 dark:border-emerald-400/50 dark:text-emerald-400",
  "Fal.ai": "hover:bg-violet-500 hover:border-violet-500 border-violet-500/50 text-violet-600 dark:border-violet-400/50 dark:text-violet-400",
  "Together AI": "hover:bg-[#4385BE] hover:border-[#4385BE] border-[#4385BE]/50 text-blue-700 dark:border-blue-400/50 dark:text-blue-400",
  "Real-time": "hover:bg-emerald-500 hover:border-emerald-500 border-emerald-500/50 text-emerald-700 dark:border-emerald-400/50 dark:text-emerald-400",
}));

const defaultColorClasses = "border-zinc-500/50 text-zinc-500 hover:bg-zinc-500 hover:border-zinc-500 dark:border-zinc-400/50 dark:text-zinc-400";

export default function TechBadge({ tech, tooltip }: TechBadgeProps) {
  const colorClasses = techColors.get(tech) ?? defaultColorClasses;

  return (
    <div className="group relative inline-block" data-tech-badge>
      <span
        className={cn(
          "inline-flex items-center px-2 py-1 text-xs font-mono tracking-tight border bg-white/5 dark:bg-black/5",
          "transition-colors duration-150 hover:text-white cursor-default",
          colorClasses
        )}
      >
        {tech}
      </span>
      <div data-tooltip className="pointer-events-none absolute bottom-full left-1/2 mb-1 ml-(--tooltip-shift) -translate-x-1/2 translate-y-1 opacity-0 transition-[opacity,translate] duration-150 ease-out group-hover:translate-y-0 group-hover:opacity-100 z-50">
        <div className="bg-zinc-900 dark:bg-zinc-800 text-zinc-100 px-2 py-1 text-xs font-mono rounded-none shadow-lg w-max max-w-64 text-center text-balance border border-zinc-700/50">
          {tooltip}
        </div>
        <div className="absolute left-1/2 ml-[calc(var(--tooltip-shift)*-1)] -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-800"></div>
      </div>
    </div>
  );
} 