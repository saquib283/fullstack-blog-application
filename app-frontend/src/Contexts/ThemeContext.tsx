"use client";
import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>("system");

    // Apply theme class to <html>
    const applyTheme = (newTheme: Theme) => {
        const root = document.documentElement;
        const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        let actualTheme: "dark" | "light";
        if (newTheme === "system") {
            actualTheme = systemIsDark ? "dark" : "light";
        } else {
            actualTheme = newTheme;
        }

        root.classList.remove("dark", "light");
        root.classList.add(actualTheme);
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("theme", newTheme);
        applyTheme(newTheme);
    };

    useEffect(() => {
        const saved = localStorage.getItem("theme") as Theme | null;
        const initial = saved ?? "system";
        setThemeState(initial);
        applyTheme(initial);

        // React to system changes if in "system" mode
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
            const systemIsDark = media.matches;
            if (theme === "system") {
                applyTheme("system");
            }
        };
        media.addEventListener("change", handler);
        return () => media.removeEventListener("change", handler);
    }, []);

    return { theme, setTheme };
}
