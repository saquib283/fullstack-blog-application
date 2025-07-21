"use client";
import { useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,

} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import facebook from "../../public/facebook.png";
import google from "../../public/google.svg";
import avatar from "../../public/avatar.svg";
import loginSchema from "@/schema/loginScema";
import registerSchema from "@/schema/registerSchema";
import { Eye, EyeOff, } from "lucide-react";
import { login, register } from "../api/auth/authServices";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/error";
import { useRouter } from 'next/navigation'

export default function AuthForm() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [data, setData] = useState({
        username: "",
        email: "",
        password: "",
        fullName: "",
        profilePicture: null as File | null,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;
        if (name === "profilePicture" && files) {
            setData((prev) => ({ ...prev, profilePicture: files[0] }));
        } else {
            setData((prev) => ({ ...prev, [name]: value }));
        }
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const router = useRouter();


    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const schema = isRegistering ? registerSchema : loginSchema;
        const result = schema.safeParse(data);

        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.errors.forEach((error) => {
                const field = error.path[0];
                fieldErrors[field as string] = error.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});

        try {
            if (isRegistering) {
                const formData = new FormData();
                formData.append("fullname", data.fullName);
                formData.append("email", data.email);
                formData.append("username", data.username);
                formData.append("password", data.password);
                if (data.profilePicture) {
                    formData.append("profilePicture", data.profilePicture);
                }

                const res = await register(formData);
                toast.success("Registered successfully!");
                console.log("Registered:", res);
                // Redirect logic here

            } else {
                const res = await login({
                    username: data.username,
                    password: data.password,
                });
                toast.success("Logged in successfully!");
                console.log("Logged in:", res);
                // Redirect logic here
                router.push("/");

            }

        } catch (error) {
            const message = getErrorMessage(error);
            toast.error(message || "Something went wrong");
            console.error("API Error:", error);
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-tr from-blue-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 font-poppins">
            <Card className="w-full max-w-md shadow-2xl border-none bg-white dark:bg-gray-900 rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-extrabold text-transparent bg-clip-text [background-image:linear-gradient(90deg,_#ee0979_0%,_#ff6a00_100%)] font-fredorka">
                        {isRegistering ? "Create an Account" : "Login to your account"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4 text-gray-700">
                        {isRegistering && (
                            <>
                                {/* Avatar Upload with Instagram-style border & animation */}
                                <div className="space-y-2 text-center">
                                    <div className="flex justify-center">
                                        <label className="cursor-pointer relative inline-block">
                                            <input
                                                id="profilePicture"
                                                type="file"
                                                name="profilePicture"
                                                accept="image/*"
                                                onChange={onChange}
                                                className="hidden"
                                            />
                                            <div
                                                className={`w-24 h-24 rounded-full p-[2px] 
                    bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 
                    ${data.profilePicture ? "animate-spin-slow" : ""}
                    transition-all duration-300 ease-in-out`}
                                            >
                                                <Image
                                                    src={
                                                        data.profilePicture
                                                            ? URL.createObjectURL(data.profilePicture)
                                                            : avatar
                                                    }
                                                    alt="Avatar"
                                                    width={96}
                                                    height={96}
                                                    className="rounded-full object-cover w-full h-full border-4 border-white dark:border-gray-900"
                                                />
                                            </div>
                                        </label>
                                    </div>
                                    {errors.profilePicture && (
                                        <p className="text-sm text-red-500 mt-2">{errors.profilePicture}</p>
                                    )}
                                </div>



                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="font-fredorka text-gray-700 dark:text-white">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        value={data.fullName}
                                        onChange={onChange}
                                        placeholder="John Doe"
                                        className="px-4 py-2 text-gray-800 dark:text-white font-fredorka"
                                    />
                                    {errors.fullName && (
                                        <p className="text-sm text-red-500">{errors.fullName}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="username" className="font-fredorka text-gray-700 dark:text-white">Username</Label>
                                    <Input
                                        id="username"
                                        name="username"
                                        value={data.username}
                                        onChange={onChange}
                                        placeholder="johndoe"
                                        autoComplete="off"
                                        className="px-4 py-2 dark:text-white focus-within:ring-1 focus-within:ring-orange-400"
                                    />
                                    {errors.username && (
                                        <p className="text-sm text-red-500">{errors.username}</p>
                                    )}
                                </div>

                                <div className="font-fredorka text-gray-700 space-y-2 dark:text-white">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="off"
                                        value={data.email}
                                        onChange={onChange}
                                        placeholder="john@example.com"
                                        className="px-4 py-2"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500">{errors.email}</p>
                                    )}
                                </div>
                            </>
                        )}

                        {!isRegistering && (
                            <div className="">
                                <Label htmlFor="username" className="font-fredorka text-gray-700 space-y-2 my-2 dark:text-white">Username or Email</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    autoComplete="off"
                                    value={data.username}
                                    onChange={onChange}
                                    placeholder="johndoe or john@example.com"
                                    className="px-4 py-2 dark:text-white focus:border-2 "
                                />
                                {errors.username && (
                                    <p className="text-sm text-red-500">{errors.username}</p>
                                )}
                            </div>
                        )}


                        <div className="space-y-1">
                            <Label htmlFor="password" className="font-fredoka text-gray-700 dark:text-white">
                                Password
                            </Label>

                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 transition-all duration-300 ">
                                <input
                                    id="password"
                                    name="password"
                                    autoComplete="new-password"
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={onChange}
                                    placeholder="••••••••"
                                    className="h-full flex-grow bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="text-gray-500 dark:text-gray-300 transition-transform duration-300 hover:scale-110 focus:outline-none"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    <span className="transition-all duration-200 ease-in-out">
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </span>
                                </button>
                            </div>

                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>



                        {!isRegistering && (
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() => alert("Redirect to forgot password page")}
                                    className="text-sm text-transparent bg-clip-text [background-image:linear-gradient(90deg,_#ee0979_0%,_#ff6a00_100%)] hover:underline transition-all duration-300"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full font-roboto bg-primaryGradient text-white font-semibold py-4 rounded-lg transition duration-200 cursor-pointer"
                        >
                            {isRegistering ? "Sign Up" : "Sign In"}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t dark:border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="px-2 bg-white dark:bg-gray-900 text-muted-foreground">or continue with</span>
                        </div>
                    </div>

                    {/* Social buttons */}
                    <div className="flex justify-center items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex items-center justify-center gap-2 hover:shadow-md transition "
                            onClick={() => alert("Login with Google")}
                        >
                            <Image src={google} alt="Google" className="w-5 h-5" height={50} width={50} />
                            Google
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex items-center justify-center gap-2 hover:shadow-md transition cursor-pointer"
                            onClick={() => alert("Login with Facebook")}
                        >
                            <Image src={facebook} alt="Facebook" className="w-5 h-5" height={50} width={50} />
                            Facebook
                        </Button>

                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        {isRegistering ? (
                            <>
                                Already have an account?{" "}
                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={() => setIsRegistering(false)}
                                    className="relative text-primaryGradient animated-underline cursor-pointer font-fredorka"
                                >
                                    Sign In
                                </Button>
                            </>
                        ) : (
                            <>
                                Don’t have an account?{" "}
                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={() => setIsRegistering(true)}
                                    className="relative text-primaryGradient animated-underline cursor-pointer font-fredorka"
                                >
                                    Create One
                                </Button>

                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
