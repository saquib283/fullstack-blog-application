"use client";
import { getAllCategories } from "@/api/blogs/categories";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen } from "lucide-react";
import { useEffect, useState } from "react";

const Spinner = () => (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
);

interface Category {
    _id: string;
    name: string;
    subCategories: string[];
}

function SidebarCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const res = await getAllCategories();
                console.log(res.data.data);
                if (res?.data) {
                    setCategories(res.data.data);
                }
            } catch (error) {
                console.error("Failed to load categories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="space-y-2 p-4">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2 font-roboto">
                    <FolderOpen /> Categories
                </h2>
                <ul className="space-y-1 text-sm">
                    {loading ? (
                        <li className="flex items-center gap-2 text-white">
                            <Spinner />
                            <span>Loading categories...</span>
                        </li>
                    ) : categories.length > 0 ? (
                        categories.map((item) => (
                            <li
                                key={item._id}
                                className="flex items-center gap-2 bg-tagsbg p-2 rounded text-white cursor-pointer"
                            >
                                {item.name}
                            </li>
                        ))
                    ) : (
                        <li className="text-white">No categories found.</li>
                    )}
                </ul>
            </CardContent>
        </Card>
    );
}

export default SidebarCategories;
