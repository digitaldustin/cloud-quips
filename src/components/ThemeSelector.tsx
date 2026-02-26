import { useState, useRef, useEffect } from "react";
import { useTheme, THEMES, ThemeId } from "./ThemeProvider";
import { Palette, Check, ChevronDown } from "lucide-react";

export function ThemeSelector() {
    const { theme, setTheme, themeMeta } = useTheme();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Close on escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                id="theme-selector-trigger"
                onClick={() => setOpen(!open)}
                className="
          flex items-center gap-2 px-3 py-1.5 rounded-md text-xs
          bg-secondary/80 border border-border
          text-foreground hover:border-primary/50
          transition-all duration-200
          hover:shadow-md hover:shadow-primary/10
        "
                style={{ fontFamily: "var(--font-mono)" }}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <Palette className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">{themeMeta.emoji} {themeMeta.name}</span>
                <span className="sm:hidden">{themeMeta.emoji}</span>
                <ChevronDown
                    className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div
                    className="
            absolute right-0 top-full mt-2 z-50
            w-64 rounded-lg border border-border
            bg-card/95 backdrop-blur-xl
            shadow-2xl shadow-black/40
            overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-200
          "
                    role="listbox"
                    aria-label="Select theme"
                >
                    <div
                        className="px-3 py-2 border-b border-border text-xs text-muted-foreground uppercase tracking-widest"
                        style={{ fontFamily: "var(--font-mono)" }}
                    >
                        Choose Theme
                    </div>

                    <div className="py-1 max-h-[320px] overflow-y-auto">
                        {THEMES.map((t) => {
                            const isActive = theme === t.id;
                            return (
                                <button
                                    key={t.id}
                                    id={`theme-option-${t.id}`}
                                    role="option"
                                    aria-selected={isActive}
                                    onClick={() => {
                                        setTheme(t.id);
                                        setOpen(false);
                                    }}
                                    className={`
                    w-full flex items-center gap-3 px-3 py-2.5 text-left
                    transition-all duration-150 group
                    ${isActive
                                            ? "bg-primary/15 text-primary"
                                            : "text-foreground hover:bg-secondary/80"
                                        }
                  `}
                                >
                                    <span className="text-lg w-6 text-center flex-shrink-0">{t.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <div
                                            className="text-sm font-medium"
                                            style={{ fontFamily: "var(--font-mono)" }}
                                        >
                                            {t.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">
                                            {t.description}
                                        </div>
                                    </div>
                                    {isActive && (
                                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
