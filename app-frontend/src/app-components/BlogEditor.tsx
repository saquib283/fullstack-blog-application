'use client';
import { useEffect, useRef, useState } from 'react';
import EditorJS, { ToolConstructable } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Table from '@editorjs/table';
import Paragraph from '@editorjs/paragraph';
import Underline from '@editorjs/underline';
import AlignmentTune from 'editor-js-alignment-tune';
import Strikethrough from '@sotaproject/strikethrough';
import Annotation from 'editorjs-annotation';
import TextVariantTune from '@editorjs/text-variant-tune';
import IndentTune from 'editorjs-indent-tune';
import Title from "title-editorjs";
import ColorPicker from 'editorjs-color-picker';
import Alert from 'editorjs-alert';
import Delimiter from "@coolbytes/editorjs-delimiter";
import Marker from '@editorjs/marker';
import ChangeCase from 'editorjs-change-case';
import { UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { saveBlog } from '@/api/blogs/blog-services';
import { getAllCategories } from '@/api/blogs/categories';

type BlogCategory = {
    _id: string;
    name: string;
    subCategories: string[];
};

let editor: EditorJS | null = null;

export default function BlogEditor() {
    const editorRef = useRef<HTMLDivElement>(null);
    const [title, setTitle] = useState('');
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [editorjsLoaded, setEditorjsLoaded] = useState<boolean>(false);
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');


    const [error, setError] = useState({
        title: '',
        thumbnail: '',
        shortDescription: '',
        content: '',
        category: '',
        subCategory: '',
        metaTitle: '',
        metaDescription: ''
    });

    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [shortDescription, setShortDescription] = useState('');

    useEffect(() => {
        if (!editor) {
            editor = new EditorJS({
                holder: editorRef.current?.id ?? 'editorjs',
                autofocus: true,
                inlineToolbar: true,
                tools: {
                    header: {
                        class: Header as any,
                        inlineToolbar: true,
                        tunes: ['alignmentTune', 'textVariant'],
                    },
                    list: {
                        class: List as any,
                        inlineToolbar: true,
                        config: {
                            defaultStyle: 'ordered',
                            maxLevel: 10
                        },
                    },
                    paragraph: {
                        class: Paragraph as any,
                        inlineToolbar: true,
                        tunes: ['alignmentTune', 'textVariant'],
                    },
                    image: {
                        class: ImageTool,
                        config: {
                            endpoints: {
                                byFile: 'http://localhost:5000/api/v1/blogs/upload-blog-image'
                            },
                        },
                    },
                    table: Table,
                    underline: Underline,
                    strikethrough: Strikethrough,
                    annotation: Annotation,
                    textVariant: {
                        class: TextVariantTune,
                        config: {
                            variants: [
                                { tag: 'small', name: 'Small' },
                                { tag: 'span', name: 'Normal' },
                                { tag: 'h4', name: 'Large' },
                                { tag: 'h3', name: 'Larger' },
                                { tag: 'h2', name: 'Extra Large' },
                            ],
                        }
                    },
                    indentTune: {
                        class: IndentTune as any,
                    },
                    title: Title,
                    color: {
                        class: ColorPicker as any,
                    },
                    alert: Alert,
                    delimiter: Delimiter,
                    marker: {
                        class: Marker,
                    },
                    changeCase: {
                        class: ChangeCase,
                        config: {
                            showLocaleOption: true,
                            locale: 'tr'
                        }
                    },
                    alignmentTune: {
                        class: AlignmentTune as any
                    },
                },
                data: {
                    time: new Date().getTime(),
                    blocks: [],
                },
                onReady: () => {
                    console.log('Editor.js is ready!');
                    setEditorjsLoaded(true);
                },
                onChange: async () => {

                },
            });
        }

        return () => {
            if (editor && editor.destroy) {
                editor.destroy();
                editor = null;
                setEditorjsLoaded(false);
            }
        };
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getAllCategories();
                setCategories(res.data.data)
            }
            catch (err) {
                console.error("Failed to load categories ", err);
                toast.error("Failed to load categories");
            }
        }
        fetchCategories()
    }, [])


    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
            e.preventDefault();
            if (tags.length >= 5) {
                toast.error('Maximum 5 tags allowed');
                return;
            }

            const newTag = tagInput.trim().toLowerCase();

            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }

            setTagInput('');
        }

        if (e.key === 'Backspace' && !tagInput && tags.length) {
            setTags(tags.slice(0, -1));
        }
    };

    const handleRemoveTag = (index: number) => {
        const updated = [...tags];
        updated.splice(index, 1);
        setTags(updated);
    };

    const handleSave = async () => {
        const validationErrors = {
            title: '',
            thumbnail: '',
            shortDescription: '',
            content: '',
            category: '',
            subCategory: '',
            metaTitle: '',
            metaDescription: ''
        };

        let isValid = true;

        if (!title.trim()) {
            validationErrors.title = 'Title is required.';
            isValid = false;
        }

        if (!thumbnail) {
            validationErrors.thumbnail = 'Thumbnail image is required.';
            isValid = false;
        }

        if (!shortDescription.trim()) {
            validationErrors.shortDescription = 'Short description cannot be empty.';
            isValid = false;
        }

        if (!selectedCategory) {
            validationErrors.category = 'Category is required.';
            isValid = false;
        }

        let content;
        try {
            if (!editor) {
                validationErrors.content = 'Blog editor is not initialized. Please wait.';
                isValid = false;
            } else {
                content = await editor.save();
                console.log('Editor.js content on save:', content);
                if (!content.blocks || content.blocks.length === 0) {
                    validationErrors.content = 'Blog content is required.';
                    isValid = false;
                }
            }
        } catch (e) {
            console.error('Failed to read blog content:', e);
            validationErrors.content = 'Failed to read blog content. There might be an issue with the editor.';
            isValid = false;
        }


        setError(validationErrors);

        if (!isValid) {
            toast.error('Please fix the errors in the form.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('shortDescription', shortDescription);
        if (thumbnail) {
            formData.append('thumbnail', thumbnail);
        }
        formData.append('content', JSON.stringify(content));
        formData.append('categoryID', selectedCategory);
        formData.append('subCategories', JSON.stringify(selectedSubCategory ? [selectedSubCategory] : []));
        formData.append('tags', JSON.stringify(tags));

        if (metaTitle.trim()) {
            formData.append('metaTitle', metaTitle.trim());
        }
        if (metaDescription.trim()) {
            formData.append('metaDescription', metaDescription.trim());
        }

        try {
            const savingToast = toast.loading('Saving your blog...');

            const response = await saveBlog(formData);

            toast.success(response.message || 'Blog saved successfully!', {
                id: savingToast,
            });

            console.log('Blog saved successfully!', response);

            setTitle('');
            setThumbnail(null);
            setShortDescription('');
            setSelectedCategory('');
            setSelectedSubCategory('');
            setTags([]);
            setTagInput('');
            setMetaTitle('');
            setMetaDescription('');
            editor?.clear();
            setError({ title: '', thumbnail: '', shortDescription: '', content: '', category: '', subCategory: '', metaTitle: '', metaDescription: '' });

        } catch (err: any) {
            console.error('Save failed:', err);
            const errorMessage = err.response?.data?.message || 'Something went wrong while saving the blog!';
            toast.error(errorMessage);
        }
    };

    const currentCategory = categories.find(cat => cat._id === selectedCategory);
    const availableSubcategories = currentCategory ? currentCategory.subCategories : [];

    return (
        <div className="bg-background text-foreground rounded-xl p-6 border border-border space-y-6 max-w-3xl mx-auto font-roboto">
            <div>
                <label className="font-semibold block mb-1 font-fredorka">Title</label>
                <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md bg-background text-foreground placeholder:font-fredorka"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your blog a killer title..."
                />
                {error.title && <p className="text-sm text-red-500">{error.title}</p>}

            </div>

            <div>

                <label className="font-semibold block mb-1 font-fredorka">Thumbnail</label>

                <div className="relative group">
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />


                    <div
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border text-foreground bg-background transition-all duration-300 backdrop-blur-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    >
                        <UploadCloud className="h-5 w-5" />
                        <span className="font-medium">Upload Image</span>
                    </div>
                    {error.thumbnail && <p className="text-sm text-red-500 mt-1">{error.thumbnail}</p>}

                </div>

                {thumbnail && (
                    <p className="text-sm text-muted mt-1">
                        Selected: <span className="font-medium">{thumbnail.name}</span>
                    </p>
                )}


            </div>

            <div>
                <label className="font-semibold block mb-1 font-fredorka">Short Description</label>
                <textarea
                    className="w-full p-2 border border-gray-300 rounded-md bg-background text-foreground placeholder:font-fredorka"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Tease the reader to open your content ...."
                    rows={3}
                />
                {error.shortDescription && <p className="text-sm text-red-500">{error.shortDescription}</p>}

            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="font-semibold block mb-1 font-fredorka">Category</label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md bg-background text-foreground font-fredorka"
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setSelectedSubCategory('');
                        }}
                    >
                        <option value="" className='border'>Select Category --</option>
                        {categories.map((cat: any) => (
                            <option key={cat._id} value={cat._id} >{cat.name}</option>
                        ))}
                    </select>
                    {error.category && <p className="text-sm text-red-500">{error.category}</p>}
                </div>

                <div>
                    <label className="font-semibold block mb-1 font-fredorka">Subcategory</label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md bg-background text-foreground font-fredorka"
                        value={selectedSubCategory}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        disabled={!selectedCategory || availableSubcategories.length === 0}
                    >
                        <option value="">Select Subcategory </option>
                        {
                            availableSubcategories.map((sub: string, idx: number) => (
                                <option key={idx} value={sub}>{sub}</option>
                            ))
                        }
                    </select>
                    {error.subCategory && <p className="text-sm text-red-500">{error.subCategory}</p>}
                </div>
            </div>


            <div>
                <label className="font-semibold block mb-1 font-fredorka">Tags (max 5)</label>
                <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md bg-background text-foreground min-h-[48px]">
                    {tags.map((tag, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                            {tag}
                            <button
                                onClick={() => handleRemoveTag(index)}
                                type="button"
                                className="hover:text-red-500 text-blue-500"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                    {tags.length < 5 && (
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagInputKeyDown}
                            className="flex-1 min-w-[120px] border-none focus:outline-none bg-transparent font-fredorka"
                            placeholder="Type and press enter"
                        />
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="meta-title" className="font-semibold block mb-1 font-fredorka">Meta Title (Max 60 chars)</label>
                <input
                    id="meta-title"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md bg-background text-foreground placeholder:font-fredorka"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="SEO title for search engines"
                    maxLength={60}
                />
                {error.metaTitle && <p className="text-sm text-red-500">{error.metaTitle}</p>}
            </div>

            <div>
                <label htmlFor="meta-description" className="font-semibold block mb-1 font-fredorka">Meta Description (Max 160 chars)</label>
                <textarea
                    id="meta-description"
                    className="w-full p-2 border border-gray-300 rounded-md bg-background text-foreground placeholder:font-fredorka"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Short description for search engine results"
                    rows={3}
                    maxLength={160}
                />
                {error.metaDescription && <p className="text-sm text-red-500">{error.metaDescription}</p>}
            </div>

            <div>
                <label className="font-semibold block mb-1 font-fredorka">Blog Content</label>
                <div
                    id="editorjs"
                    ref={editorRef}
                    className="editorjs-theme rounded-xl border border-border p-6 bg-white dark:bg-neutral-900 shadow-sm transition-all duration-300"
                ></div>
                {error.content && <p className="text-sm text-red-500 mt-2">{error.content}</p>}


            </div>

            <div className='w-full flex justify-center items-center'>
                <button
                    onClick={handleSave}
                    disabled={!editorjsLoaded}
                    className={`
                        w-1/2 bg-primaryGradient text-white px-4 py-2 rounded mx-auto cursor-pointer
                        ${!editorjsLoaded ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}
                    `}
                >
                    Save Blog
                </button>
            </div>
        </div>
    );
}