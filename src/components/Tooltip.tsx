import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import LucideIcon from "@/components/LucideIcon";
import { cn } from "@/lib/utils";

interface TooltipProps {
  triggerText?: string;
  tooltipContent?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  icon?: string;
  className?: string;
  "data-tech"?: string;
}

export default function TooltipDefault({
  triggerText = "Hover me",
  tooltipContent = "This is a default tooltip",
  variant = "outline",
  icon,
  className,
  "data-tech": dataTech,
}: TooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={variant} 
            className={cn(
              "transition-all duration-200",
              className
            )}
            data-tech={dataTech}
          >
            {icon && <LucideIcon name={icon as any} className="w-4 h-4" />}
            {triggerText}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 