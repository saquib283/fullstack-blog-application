"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Search, LogIn, LogOut, User, Edit,Pencil,NotebookPen } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import Image from "next/image";
import logo from "../../public/logo.png";
import avatar from "../../public/avatar.png";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { logout as logoutFn } from "../api/auth/authServices";

import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Searching for:", search);
    };

    const handleLogout = async () => {
        try {
            await logoutFn();
            logout();
            toast.success("Logged out successfully! ");
            router.push("/authentication");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Logout failed ");
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <AnimatePresence>
            <motion.nav
                key="navbar"
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -60, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Link
                                href="/"
                                className="text-xl font-bold flex items-center gap-2"
                            >
                                <motion.div
                                    whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Image src={logo} alt="logo" height={50} width={50} />
                                </motion.div>
                                <span className="font-ds text-xl font-bold text-primaryGradient">
                                    StoryNest
                                </span>
                            </Link>
                        </motion.div>

                        <motion.div
                            className="hidden sm:flex items-center gap-6"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            <form onSubmit={handleSearch} className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search..."
                                    className="pl-9 pr-4 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                                />
                            </form>

                            <Link
                                href="/"
                                className="relative group text-gray-700 dark:text-gray-300"
                            >
                                Newsletters
                                <span className="absolute left-0 -bottom-1 h-0.5 w-0 transition-all duration-300 group-hover:w-full [background-image:linear-gradient(90deg,_#ee0979_0%,_#ff6a00_100%)]" />
                            </Link>

                            {user?.username ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="focus:outline-none"
                                    >
                                        <Image
                                            src={user.profilePicture || avatar}
                                            alt={user.username}
                                            width={36}
                                            height={36}
                                            className="rounded-full border-2 border-orange-500 cursor-pointer"
                                        />
                                    </button>

                                    <AnimatePresence>
                                        {showDropdown && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg py-2 z-50"
                                            >   
                                                <Link
                                                    href="/write"
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    Write Blog
                                                </Link>
                                                <Link
                                                    href="/profile"
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <User className="w-4 h-4" />
                                                    Profile
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Logout
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link
                                    href="/authentication"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium [background-image:linear-gradient(90deg,_#ee0979_0%,_#ff6a00_100%)] hover:[background-image:linear-gradient(90deg,_#d9046d_0%,_#e95d00_100%)] text-white transition-colors shadow-md"
                                >
                                        <NotebookPen className="w-4 h-4" />

                                    Write Story

                                </Link>
                            )}
                            <ThemeToggle />
                        </motion.div>

                        <div className="sm:hidden flex items-center gap-2">
                            <ThemeToggle />
                            <button onClick={() => setOpen(!open)}>
                                {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            key="mobile-nav"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="sm:hidden px-4 pb-4 space-y-3 bg-white dark:bg-gray-900 overflow-hidden"
                        >
                            <form onSubmit={handleSearch} className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full pl-9 pr-4 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </form>

                            <Link href="/" className="block py-2 text-gray-700 dark:text-gray-300">
                                Newsletters
                            </Link>

                            {user?.username ? (
                                <div className="flex items-center gap-2 py-2">
                                    <Image
                                        src={user.profilePicture || avatar}
                                        alt={user.username}
                                        width={32}
                                        height={32}
                                        className="rounded-full border-2 border-orange-500"
                                    />
                                    <span className="text-gray-800 dark:text-white text-sm font-medium">
                                        {user.fullname.split(" ")[0]}
                                    </span>
                                </div>
                            ) : (
                                <Link
                                    href="/authentication"
                                    className="flex items-center justify-center gap-2 w-full py-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white text-sm font-medium hover:from-pink-600 hover:to-orange-600 transition-colors shadow-md"
                                >
                                    <NotebookPen className="w-4 h-4" />
                                    Write your story ...
                                </Link>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
        </AnimatePresence>
    );
};
