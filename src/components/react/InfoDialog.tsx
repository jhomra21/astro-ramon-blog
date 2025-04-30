"use client" // Necessary for Radix UI components which use context/state

import * as React from "react"
import { useState, useRef, useEffect } from "react" // Import hooks
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger, // Import DialogClose if you want an explicit close button
} from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button" // No longer needed here
import { cn } from "@/lib/utils" // For combining class names
import { Copy, Check } from "lucide-react" // Import icons

interface InfoDialogProps {
  // children: React.ReactNode; // Removed children
  triggerText: string; // Text for the trigger button
  triggerClassName?: string; // Classes for the trigger button
  title: string; // The title shown in the dialog header
  contentLines: string[]; // An array of strings to display as content
  dialogClassName?: string; // Renamed className for clarity
}

export const InfoDialog: React.FC<InfoDialogProps> = ({ 
  // children, // Removed children
  triggerText,
  triggerClassName,
  title, 
  contentLines,
  dialogClassName // Use the renamed prop
}) => {
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false); // State to track URL copy status
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for timeout

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopyUrl = async (url: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      timeoutRef.current = setTimeout(() => {
        setCopiedUrl(false);
        timeoutRef.current = null;
      }, 2000); // Revert after 2 seconds
    } catch (err) {
      console.error("Failed to copy URL: ", err);
      setCopiedUrl(false); // Ensure state is reset on error
    }
  };

  return (
    <Dialog>
      {/* Apply classes directly to DialogTrigger, pass text as children */}
      <DialogTrigger 
        className={cn(triggerClassName)} // Apply classes here
        asChild={false} // Ensure it renders a button
      >
        {triggerText} {/* Text goes here */} 
        {/* Icon would need to be handled here too if re-added */}
      </DialogTrigger>
      <DialogContent className={cn("sm:max-w-[450px] bg-white dark:bg-zinc-900", dialogClassName)}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</DialogTitle>
          <DialogDescription asChild className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            {/* Use a div wrapper for DialogDescription content when using asChild */}
            <div>
              {contentLines.map((line, index) => {
                const firstColonIndex = line.indexOf(":");
                let label = "";
                let value = line;
                if (firstColonIndex > -1) {
                  label = line.substring(0, firstColonIndex).trim();
                  value = line.substring(firstColonIndex + 1).trim();
                }

                return (
                  <div key={index} className="flex items-start gap-3 py-1.5">
                    {label && (
                      <span className="w-16 shrink-0 text-right text-xs font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
                        {label}:
                      </span>
                    )}
                    {label.toLowerCase() === 'mcp url' ? (
                      <code className={`flex items-center justify-between flex-1 whitespace-pre-wrap break-words rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs font-mono text-zinc-800 dark:text-zinc-200 ${!label ? 'ml-[calc(4rem+0.75rem)]' : ''}`}>
                        <span className="mr-2">{value}</span> 
                        <button
                          onClick={() => handleCopyUrl(value)} 
                          aria-label="Copy URL"
                          className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors duration-150"
                        >
                          {/* Container for smooth icon transition - Use flex center */}
                          <span className="relative flex items-center justify-center w-3 h-3">
                            {/* Check Icon - Position absolutely */}
                            <Check className={cn(
                              "absolute transition-all duration-300 ease-in-out text-green-600 w-3 h-3",
                              copiedUrl ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-50 blur-sm"
                            )} />
                            {/* Copy Icon - Position absolutely */}
                            <Copy className={cn(
                              "absolute transition-all duration-300 ease-in-out w-3 h-3",
                              copiedUrl ? "opacity-0 scale-50 blur-sm" : "opacity-100 scale-100 blur-0"
                            )} />
                          </span>
                        </button>
                      </code>
                    ) : (
                      <code className={`flex-1 whitespace-pre-wrap break-words rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs font-mono text-zinc-800 dark:text-zinc-200 ${!label ? 'ml-[calc(4rem+0.75rem)]' : ''}`}>
                        {value}
                      </code>
                    )}
                  </div>
                );
              })}
            </div>
          </DialogDescription>
        </DialogHeader>
        {/* Optional: Add a footer with a close button */}
        {/* <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  )
} 