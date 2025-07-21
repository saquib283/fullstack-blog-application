
export interface Blog {
  _id: string;
  title: string;
  shortDescription: string;
  slug: string;
  thumbnail: {
    url: string;
    alt: string;
    caption: string;
  };
  content: {
    time?: number;
    blocks: Array<{
      id: string;
      type: string;
      data: any; 
    }>;
  };
  metaTitle?: string;
  metaDescription?: string;
  allowComments: boolean;
  pendingComments: string[];
  hideLikes: boolean;
  author: {
    fullname: string;
    _id: string;
    name: string;
    email: string;
  };
  tags: string[];
  comments: string[];
  likes: string[];
  shares: string[];
  viewBy: Array<{
    user: string;
    interactionTime: number;
  }>;
  views: number;
  status: 'draft' | 'published' | 'archived';
  category: {
    _id: string;
    name: string;
  };
  subCategories: string[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}




export interface GetAllBlogsResponse {
  success: boolean;
  count: number;
  data: Blog[];
}




// src/types/index.ts

export interface UserForComment {
    _id: string;
    fullname: string;
    profilePicture?: string; // Make optional if it might not always be present or needed
    username?: string; // Add if you have it and might use it
    email?: string; // Add if you have it and might use it
}

export interface CommentType { // Naming it `CommentType` to avoid conflict with `Comment` if it exists elsewhere
    _id: string;
    user: UserForComment; // This is the populated user object
    content: string;
    likes: string[]; // Array of user _ids who liked the comment
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export interface BlogType { // Interface for your main blog object
    _id: string;
    thumbnail: {
        url: string;
        alt: string;
        caption: string;
    };
    title: string;
    shortDescription: string;
    content: any; // You might want a more specific type for content later
    metaTitle: string;
    metaDescription: string;
    allowComments: boolean;
    pendingComments: any[]; // Define a proper type if you handle pending comments
    hideLikes: boolean;
    author: {
        _id: string;
        username: string;
        email: string;
        fullname: string;
    };
    tags: string[];
    comments: CommentType[]; // <--- THIS IS THE CRUCIAL PART!
    likes: string[];
    shares: string[];
    views: number;
    status: string;
    category: {
        _id: string;
        name: string;
    };
    subCategories: string[];
    viewBy: string[];
    slug: string;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}