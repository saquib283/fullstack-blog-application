
"use client";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "../Contexts/ThemeContext";
import { useState, useEffect, JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";

const themeOrder = ["light", "dark", "system"] as const;

const themeIcons: Record<(typeof themeOrder)[number], JSX.Element> = {
    light: <Sun className="w-5 h-5 text-yellow-500" />,
    dark: <Moon className="w-5 h-5 text-indigo-500" />,
    system: <Laptop className="w-5 h-5 text-gray-700 dark:text-gray-200" />,
};

export const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const [currentTheme, setCurrentTheme] = useState<"light" | "dark" | "system">(theme || "system");

    const handleClick = () => {
        const currentIndex = themeOrder.indexOf(currentTheme);
        const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
        setCurrentTheme(nextTheme);
        setTheme(nextTheme);
    };

    useEffect(() => {
        if (theme && theme !== currentTheme) {
            setCurrentTheme(theme);
        }
    }, [theme]);

    return (
        <button
            onClick={handleClick}
            aria-label={`Current theme: ${currentTheme}`}
            title={`Theme: ${currentTheme}`}
            className="relative p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentTheme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {themeIcons[currentTheme]}
                </motion.div>
            </AnimatePresence>
        </button>
    );
};
