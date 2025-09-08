import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.HTMLAttributes<HTMLDivElement>;

function Calendar({
  className,
  ...props
}: CalendarProps) {
  return (
    <div
      className={cn("p-3 border rounded-md", className)}
      {...props}
    >
      <div className="text-center text-sm text-muted-foreground">
        Calendar component placeholder - install react-day-picker for full functionality
      </div>
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
