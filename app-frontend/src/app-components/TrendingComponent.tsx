"use client";
import Image from "next/image";
import Link from "next/link";
import { ThumbsUp, Share2, Eye } from "lucide-react";


const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });


import useFetch from "@/hooks/useFetch";
import type { GetAllBlogsResponse } from '../types/blog';

export default function TrendingComponent() {
    const {data,error,loading} = useFetch<GetAllBlogsResponse>("/blogs/getAllblogs");
    console.log("Data :",data?.data);


    if(loading){
        return <h1>Loading....</h1>
    }
    if(error){
        return <h1>Error</h1>
    }

    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 py-6">
            {data?.data.map((blog) => (
                <Link key={blog._id} href={`/blogs/${blog.slug}`} className="group">
                    <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 border border-border bg-card text-card-foreground">
                        <div className="relative h-52 w-full">
                            <Image
                                src={blog.thumbnail.url}
                                alt={blog.thumbnail.alt}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                        </div>
                        <div className="p-5 flex flex-col gap-3">
                            <h2 className="font-semibold text-lg leading-snug group-hover:text-primary transition-colors">
                                {blog.title}
                            </h2>

                            <p className="text-sm text-muted-foreground">
                                By{" "}
                                <span className="font-medium text-foreground mx-2">{blog.author.fullname}</span> 
                                {formatDate(blog.createdAt)}
                            </p>

                            <p className="text-base leading-relaxed text-foreground/90 line-clamp-3">
                                {blog.shortDescription}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-3 border-t border-border mt-auto">
                                <div className="flex items-center gap-1">
                                    <Eye size={16} /> {blog.views.toLocaleString()}
                                </div>
                                <div className="flex items-center gap-1">
                                    <ThumbsUp size={16} /> {blog.likes.length}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Share2 size={16} /> {blog.shares.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>

        
        
    );
}

