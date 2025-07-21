'use client';

import React, { JSX } from 'react';
import Output from 'editorjs-react-renderer';

interface EditorJsBlock {
    id?: string;
    type: string;
    data: any;
    tunes?: {
        alignmentTune?: { alignment: string };
        textVariant?: { tag: string };
        indentTune?: { level: number };
    };
}

interface EditorJsOutputData {
    time: number;
    blocks: EditorJsBlock[];
    version: string;
}

interface EditorJsRendererProps {
    data: EditorJsOutputData;
}

const RenderListItem: React.FC<{ item: any; index: number }> = ({ item, index }) => {
    let itemContent: string = '';
    let nestedItems: any[] = [];

    if (typeof item === 'string') {
        itemContent = item;
    } else if (typeof item === 'object' && item !== null) {
        if ('content' in item && typeof item.content === 'string') {
            itemContent = item.content;
        } else if ('text' in item && typeof item.text === 'string') {
            itemContent = item.text;
        } else {
            console.warn("Unexpected object structure for list item content:", item);
            itemContent = JSON.stringify(item);
        }

        if ('items' in item && Array.isArray(item.items)) {
            nestedItems = item.items;
        }
    } else {
        console.warn("Unexpected item type in list:", item);
        itemContent = String(item);
    }

    return (
        <li key={index} className="mb-2">
            <span dangerouslySetInnerHTML={{ __html: itemContent }} />
            {nestedItems.length > 0 && (
                <ul className="list-disc pl-6 mt-1">
                    {nestedItems.map((nestedItem, nestedIndex) => (
                        <RenderListItem key={nestedIndex} item={nestedItem} index={nestedIndex} />
                    ))}
                </ul>
            )}
        </li>
    );
};


const EditorJsRenderer: React.FC<EditorJsRendererProps> = ({ data }) => {
    if (!data || !data.blocks || data.blocks.length === 0) {
        return <p className="text-gray-500 dark:text-gray-400 italic">No content to display.</p>;
    }

    const customRenderers = {
        header: ({ data, tunes }: { data: { text: string; level: number }; tunes?: EditorJsBlock['tunes'] }) => {
            if (!data || !data.text) return null;
            const Tag = `h${data.level}` as keyof JSX.IntrinsicElements;
            let className = "font-fredorka my-4";

            if (tunes?.alignmentTune?.alignment) {
                className += ` text-${tunes.alignmentTune.alignment}`;
            }

            if (tunes?.textVariant?.tag) {
                if (tunes.textVariant.tag === 'small') className += ' text-sm';
            }

            if (data.level === 1) className += ' text-5xl';
            else if (data.level === 2) className += ' text-4xl';
            else if (data.level === 3) className += ' text-3xl';
            else if (data.level === 4) className += ' text-2xl';
            else if (data.level === 5) className += ' text-xl';
            else if (data.level === 6) className += ' text-lg';

            return <Tag className={className} dangerouslySetInnerHTML={{ __html: data.text }} />;
        },

        paragraph: ({ data, tunes }: { data: { text: string }; tunes?: EditorJsBlock['tunes'] }) => {
            if (!data || !data.text) return null;
            let className = "font-roboto leading-relaxed mb-4";
            let Tag: keyof JSX.IntrinsicElements = 'p';

            if (tunes?.alignmentTune?.alignment) {
                className += ` text-${tunes.alignmentTune.alignment}`;
            }

            if (tunes?.indentTune?.level && tunes.indentTune.level > 0) {
                className += ` pl-${tunes.indentTune.level * 4}`;
            }

            if (tunes?.textVariant?.tag) {
                Tag = tunes.textVariant.tag as keyof JSX.IntrinsicElements;
                if (Tag === 'small') className += ' text-sm';
            }

            return <Tag className={className} dangerouslySetInnerHTML={{ __html: data.text }} />;
        },

        list: ({ data }: { data: { style: 'ordered' | 'unordered'; items: any[] } }) => {
            if (!data || !data.items || !Array.isArray(data.items)) {
                console.warn("Invalid data for list block:", data);
                return null;
            }

            const ListTag = data.style === 'ordered' ? 'ol' : 'ul';
            const className = `my-4 ${data.style === 'ordered' ? 'list-decimal' : 'list-disc'} pl-6`;

            return (
                <ListTag className={className}>
                    {data.items.map((item, index) => (
                        <RenderListItem key={index} item={item} index={index} />
                    ))}
                </ListTag>
            );
        },

        image: ({ data }: { data: { file: { url: string }; caption: string; stretched: boolean; withBorder: boolean; withBackground: boolean } }) => {
            if (!data || !data.file || !data.file.url) return null;
            const imageUrl = data.file.url;
            return (
                <div className={`my-4 ${data.stretched ? 'w-full' : ''} ${data.withBorder ? 'border' : ''} ${data.withBackground ? 'bg-gray-100 dark:bg-gray-800 p-2 rounded-lg' : ''}`}>
                    <img src={imageUrl} alt={data.caption || 'Blog Image'} className="max-w-full h-auto mx-auto rounded-md" />
                    {data.caption && <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">{data.caption}</p>}
                </div>
            );
        },

        table: ({ data }: { data: { content: string[][] } }) => {
            if (!data || !data.content || !Array.isArray(data.content)) return null;
            return (
                <div className="overflow-x-auto my-4">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 dark:border-gray-700 dark:divide-gray-700">
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-neutral-900 dark:divide-gray-700">
                            {data.content.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                                            <span dangerouslySetInnerHTML={{ __html: cell }} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        },

        title: ({ data }: { data: { text: string } }) => {
            if (!data || !data.text) return null;
            return <h1 className="font-fredorka text-4xl lg:text-5xl font-extrabold mb-6 text-gray-900 dark:text-gray-100">{data.text}</h1>;
        },

        alert: ({ data }: { data: { type: 'primary' | 'success' | 'warning' | 'danger' | 'info'; message: string; title?: string } }) => {
            if (!data || !data.message) return null;
            let bgColor = 'bg-blue-100 dark:bg-blue-900';
            let textColor = 'text-blue-800 dark:text-blue-200';
            let icon = 'ℹ️';

            if (data.type === 'success') {
                bgColor = 'bg-green-100 dark:bg-green-900';
                textColor = 'text-green-800 dark:text-green-200';
                icon = '✅';
            } else if (data.type === 'warning') {
                bgColor = 'bg-yellow-100 dark:bg-yellow-900';
                textColor = 'text-yellow-800 dark:text-yellow-200';
                icon = '⚠️';
            } else if (data.type === 'danger') {
                bgColor = 'bg-red-100 dark:bg-red-900';
                textColor = 'text-red-800 dark:text-red-200';
                icon = '❌';
            }

            return (
                <div className={`p-4 my-6 rounded-lg ${bgColor} ${textColor} shadow-sm flex items-start gap-3`}>
                    <span className="text-xl leading-none flex-shrink-0">{icon}</span>
                    <div>
                        {data.title && <p className="font-bold text-lg mb-1">{data.title}</p>}
                        <p dangerouslySetInnerHTML={{ __html: data.message }} />
                    </div>
                </div>
            );
        },

        delimiter: () => <hr className="my-8 border-t-2 border-dashed border-gray-300 dark:border-gray-700" />,
    };

    const customInlineRenderers = {
        bold: ({ children }: { children: React.ReactNode }) => <strong className="font-bold">{children}</strong>,
        italic: ({ children }: { children: React.ReactNode }) => <em className="italic">{children}</em>,
        link: ({ children, data }: { children: React.ReactNode; data: { href: string; target?: string; rel?: string } }) => (
            <a href={data.href} target={data.target || '_blank'} rel={data.rel || 'noopener noreferrer'} className="text-blue-600 hover:underline dark:text-blue-400">
                {children}
            </a>
        ),
        code: ({ children }: { children: React.ReactNode }) => <code className="bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-300 px-1 py-0.5 rounded text-sm">{children}</code>,

        underline: ({ children }: { children: React.ReactNode }) => {
            return <u className="underline">{children}</u>;
        },
        strikethrough: ({ children }: { children: React.ReactNode }) => {
            return <s className="line-through">{children}</s>;
        },
        marker: ({ children }: { children: React.ReactNode }) => {
            return <mark className="bg-yellow-200 dark:bg-yellow-700 text-black dark:text-white rounded px-1">{children}</mark>;
        },
        color: ({ children, data }: { children: React.ReactNode; data: { color: string } }) => {
            return <span style={{ color: data.color }}>{children}</span>;
        },
        changeCase: ({ children, data }: { children: React.ReactNode; data: { case?: string } }) => {
            let className = '';
            if (data.case === 'uppercase') className = 'uppercase';
            else if (data.case === 'lowercase') className = 'lowercase';
            else if (data.case === 'capitalize') className = 'capitalize';

            return <span className={className}>{children}</span>;
        },
        annotation: ({ children, data }: { children: React.ReactNode; data: { annotation: string } }) => {
            return (
                <span className="relative cursor-help group border-b border-dotted border-gray-400 pb-0.5">
                    {children}
                    {data.annotation && (
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                            {data.annotation}
                        </span>
                    )}
                </span>
            );
        },
    };


    return (
        <div className="prose dark:prose-invert max-w-none">
            <Output
                data={data}
                renderers={customRenderers}
                inline={customInlineRenderers}
            />
        </div>
    );
};

export default EditorJsRenderer;