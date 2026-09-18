import { memo } from "react";
import { cn } from "@/lib/utils";

interface MdbFooterProps {
    className?: string;
}

export const MdbFooter = memo(function MdbFooter({ className }: MdbFooterProps) {
    return (
        <div
            className={cn(
                "flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-muted-foreground text-center",
                className
            )}>
            <span>This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
            <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <img src="https://cdn.simpleicons.org/themoviedatabase" alt="TMDB" className="h-4 w-4" />
                <span className="font-medium">TMDB</span>
            </a>
        </div>
    );
});
