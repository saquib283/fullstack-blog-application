


import mongoose from "mongoose";
import dotenv from "dotenv";
import { Category } from "../models/category.model.js";


dotenv.config();

const categories = [
    {
        "name": "Entertainment",
        "subCategories": [
            "Celebrity News",
            "TV Shows",
            "Movies",
            "Music",
            "Red Carpet",
            "Reality TV",
            "Awards Shows",
            "Trailers & Sneak Peeks"
        ]
    },
    {
        "name": "Crime",
        "subCategories": [
            "True Crime",
            "Missing Persons",
            "Court Cases",
            "Celebrity Legal Issues",
            "Crime Documentaries",
            "Cold Cases",
            "Breaking Crime News"
        ]
    },
    {
        "name": "Shopping",
        "subCategories": [
            "Deals & Sales",
            "Celebrity Picks",
            "Beauty Products",
            "Fashion Finds",
            "Home Essentials",
            "Tech & Gadgets",
            "Gift Guides",
            "Amazon Must-Haves"
        ]
    },
    {
        "name": "Lifestyle",
        "subCategories": [
            "Health & Wellness",
            "Beauty",
            "Fashion",
            "Travel",
            "Food & Recipes",
            "Relationships",
            "Horoscopes",
            "Home & Living"
        ]
    },
    {
        "name": "Sports",
        "subCategories": [
            "Celebrity Athletes",
            "Game Highlights",
            "Sports News",
            "Olympics",
            "NFL/NBA/MLB Gossip",
            "Athlete Interviews",
            "Injuries & Comebacks",
            "Sports Fashion"
        ]
    },
    {
        "name": "Human Interest",
        "subCategories": [
            "Inspirational Stories",
            "Heroic Acts",
            "Viral Moments",
            "Feel-Good News",
            "Everyday Heroes",
            "Real-Life Drama",
            "Animal Stories",
            "Community Spotlights"
        ]
    },
    {
        "name": "Nature",
        "subCategories": [
            "Wildlife",
            "Environmental News",
            "Natural Disasters",
            "Climate Change",
            "Forests & Oceans",
            "Sustainable Living",
            "National Parks",
            "Nature Photography"
        ]
    },
    {
        "name": "Cars",
        "subCategories": [
            "Car Reviews",
            "Upcoming Models",
            "Car Shows & Events",
            "Electric Vehicles (EVs)",
            "Modifications & Tuning",
            "Maintenance Tips",
            "Luxury & Exotic Cars",
            "Industry News"
        ]
    },
    {
        "name": "Bikes",
        "subCategories": [
            "Motorcycle Reviews",
            "Electric Bikes (eBikes)",
            "Bike Maintenance",
            "Custom Builds",
            "Riding Gear & Accessories",
            "Biker Lifestyle",
            "Touring & Road Trips",
            "Motorbike News"
        ]
    },
    {
        "name": "Technology",
        "subCategories": [
            "Artificial Intelligence",
            "Startups",
            "Gadgets",
            "Software & Apps",
            "Big Tech News",
            "Cybersecurity",
            "Smartphones",
            "Tech Explainers"
        ]
    },
    {
        "name": "Gaming",
        "subCategories": [
            "Game Reviews",
            "PC & Console",
            "Mobile Games",
            "Esports",
            "Twitch & YouTube Streamers",
            "Gaming Gear",
            "Game Updates",
            "Indie Games"
        ]
    },
    {
        "name": "Politics",
        "subCategories": [
            "Elections",
            "Government Policies",
            "Political Debates",
            "International Relations",
            "Leaders & Politicians",
            "Scandals",
            "Bills & Laws",
            "Public Opinion"
        ]
    },
    {
        "name": "Finance",
        "subCategories": [
            "Personal Finance",
            "Investing",
            "Cryptocurrency",
            "Stock Market",
            "Real Estate",
            "Budgeting Tips",
            "Economic News",
            "Side Hustles"
        ]
    },
    {
        "name": "Education",
        "subCategories": [
            "Study Tips",
            "Online Courses",
            "EdTech",
            "College News",
            "Scholarships",
            "Student Life",
            "Career Advice",
            "Parenting & Learning"
        ]
    },
    {
        "name": "Science",
        "subCategories": [
            "Space & Astronomy",
            "Medical Breakthroughs",
            "Physics & Chemistry",
            "Climate Science",
            "Tech Innovations",
            "Nature & Wildlife",
            "Science Explainers",
            "Futurism"
        ]
    },
    {
        "name": "Food",
        "subCategories": [
            "Recipes",
            "Viral Foods",
            "Restaurant Reviews",
            "Healthy Eating",
            "Street Food",
            "Cooking Tips",
            "Food Challenges",
            "Cultural Cuisine"
        ]
    },
    {
        "name": "Health",
        "subCategories": [
            "Mental Health",
            "Fitness Tips",
            "Diseases & Treatments",
            "Diet & Nutrition",
            "Wellness Trends",
            "Medical News",
            "Sleep & Recovery",
            "Supplements"
        ]
    },
    {
        "name": "Travel",
        "subCategories": [
            "Destinations",
            "Travel Tips",
            "Adventure",
            "Luxury Travel",
            "Cultural Experiences",
            "Travel Vlogs",
            "Airlines & Hotels",
            "Travel News"
        ]
    },
    {
        "name": "Memes",
        "subCategories": [
            "Trending Memes",
            "Dank Memes",
            "Wholesome Memes",
            "Relatable",
            "Pet Memes",
            "TV Show Memes",
            "Meme Templates",
            "Roasts & Fails"
        ]
    },
    {
        "name": "Fashion",
        "subCategories": [
            "Street Style",
            "Celebrity Looks",
            "Runway Trends",
            "Style Guides",
            "DIY Fashion",
            "Sustainable Fashion",
            "Sneakers",
            "Accessories"
        ]
    }
]

const MONGO_URI = process.env.MONGO_URI;

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/MyDataBase', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        await Category.deleteMany(); // optional: clean old data
        await Category.insertMany(categories);
        console.log('Categories seeded successfully ✅');

        process.exit(0);
    } catch (err) {
        console.error('Seeding failed ❌', err);
        process.exit(1);
    }
};

seed();