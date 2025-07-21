import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Linkedin } from "lucide-react";
import logo from "../../public/logo.png"; // Replace with your logo

export const Footer = () => {
    return (
        <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 ">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm text-gray-600 dark:text-gray-400">

                <div>
                    <Link href="/" className="flex items-center gap-2 mb-4">
                        <Image src={logo} alt="logo" height={40} width={40} />
                        <span className="font-bold text-lg text-gray-800 dark:text-white">
                            StoryNest
                        </span>
                    </Link>
                    <p className="text-sm">
                        Where stories take flight. Your daily dose of creative writing,
                        tech, and inspiration.
                    </p>
                </div>

                <div>
                    <h4 className="text-gray-800 dark:text-white font-semibold mb-3">Explore</h4>
                    <ul className="space-y-2">
                        <li><Link href="/" className="hover:underline">Home</Link></li>
                        <li><Link href="/about" className="hover:underline">About</Link></li>
                        <li><Link href="/newsletter" className="hover:underline">Newsletter</Link></li>
                        <li><Link href="/contact" className="hover:underline">Contact</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-gray-800 dark:text-white font-semibold mb-3">Account</h4>
                    <ul className="space-y-2">
                        <li><Link href="/signin" className="hover:underline">Sign In</Link></li>
                        <li><Link href="/signup" className="hover:underline">Sign Up</Link></li>
                        <li><Link href="/profile" className="hover:underline">My Profile</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-gray-800 dark:text-white font-semibold mb-3">Connect</h4>
                    <div className="flex space-x-4">
                        <Link href="https://twitter.com" target="_blank" aria-label="Twitter">
                            <Twitter className="h-5 w-5 hover:text-blue-500" />
                        </Link>
                        <Link href="https://github.com" target="_blank" aria-label="GitHub">
                            <Github className="h-5 w-5 hover:text-gray-800 dark:hover:text-white" />
                        </Link>
                        <Link href="https://linkedin.com" target="_blank" aria-label="LinkedIn">
                            <Linkedin className="h-5 w-5 hover:text-blue-700" />
                        </Link>
                    </div>
                </div>
            </div>


            <div className="text-center text-xs text-gray-500 dark:text-gray-600 py-4 border-t border-gray-100 dark:border-gray-800">
                © {new Date().getFullYear()} StoryNest. All rights reserved.
            </div>
        </footer>
    );
};
