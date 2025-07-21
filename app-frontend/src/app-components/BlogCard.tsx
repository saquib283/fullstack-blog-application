import React from 'react';
import { Heart, Eye, Share2 } from 'lucide-react';

type Author = {
    name: string;
    avatar: string;
};

type BlogCardProps = {
    image: string;
    title: string;
    content: string;
    category: string;
    tags?: string[];
    author: Author;
    date: string | Date;
    likes: number;
    views: number;
    shares: number;
};

const BlogCard: React.FC<BlogCardProps> = ({
    image,
    title,
    content,
    category,
    tags = [],
    author,
    date,
    likes,
    views,
    shares,
}) => {
    const formattedDate =
        typeof date === 'string'
            ? new Date(date).toLocaleDateString()
            : date.toLocaleDateString();

    return (
        <div className="max-w-md mx-auto rounded-2xl overflow-hidden shadow-lg bg-card text-card-foreground transition hover:shadow-2xl duration-300 border border-border">
            <img
                src={image}
                alt={title}
                className="w-full h-56 object-contain"
            />
            <div className="p-6 space-y-4">
                <div className="flex flex-wrap justify-between items-center">
                    <span className="text-xs px-3 py-1 rounded-full bg-accent text-accent-foreground font-semibold uppercase">
                        {category}
                    </span>
                    <span className="text-xs text-muted-foreground">{formattedDate}</span>
                </div>

                <h2 className="text-xl font-bold font-poppins text-primaryGradient">
                    {title}
                </h2>

                <p className="text-sm text-muted-foreground line-clamp-3 font-roboto">
                    {content}
                </p>

                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {tags.map((tag, i) => (
                        <span
                            key={i}
                            className="px-2 py-1 rounded-full bg-muted hover:bg-accent hover:text-accent-foreground transition duration-200"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <img
                            src={author.avatar}
                            alt={author.name}
                            className="w-8 h-8 rounded-full object-contain"
                        />
                        <span className="font-medium">{author.name}</span>
                    </div>
                    <div className="flex gap-4 items-center text-muted-foreground text-xs">
                        <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Share2 className="w-4 h-4" />
                            <span>{shares}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
