"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, Settings, HelpCircle, Hexagon, ImagePlus } from "lucide-react";
import Editor from "@/app/write/components/Editor";
import { updatePost } from "../actions";
import { createCategory } from "@/app/actions/categories";
import { uploadImage } from "@/app/write/upload-action";
import { createClient } from '@/utils/supabase/client';

export default function EditPage() {
    const router = useRouter();
    const params = useParams();
    const postId = params.id as string;

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            const supabase = createClient();

            // Fetch categories
            const { data: cats } = await supabase.from("categories").select("id, name").order("name");
            if (cats) {
                setCategories(cats);
            }

            // Fetch post data
            if (postId) {
                const { data: post, error } = await supabase
                    .from("posts")
                    .select("*")
                    .eq("id", postId)
                    .single();

                if (post) {
                    setTitle(post.title || "");
                    setContent(post.content || "");
                    setCategoryId(post.category_id || (cats && cats.length > 0 ? cats[0].id : ""));
                } else {
                    alert("게시글을 불러올 수 없습니다.");
                    router.push("/");
                }
            }
            setIsLoading(false);
        };

        fetchInitialData();
    }, [postId, router]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("이미지 파일만 업로드할 수 있습니다.");
            return;
        }
        setIsUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const result = await uploadImage(fd);
            if (result.error || !result.url) {
                alert("이미지 업로드에 실패했습니다.\n" +
                    (result.error || "알 수 없는 오류"));
            } else {
                const markdown = `\n![${file.name}](${result.url})\n`;
                setContent((prev) => prev + markdown);
            }
        } catch (err) {
            console.error(err);
            alert("이미지 업로드 중 오류가 발생했습니다.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handlePublish = async () => {
        if (!title.trim() || !content.trim()) {
            alert("Please enter a title and content.");
            return;
        }

        setIsPublishing(true);
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("category_id", categoryId);

            const result = await updatePost(postId, formData);

            if (result.error) {
                alert("Failed to update: " + result.error);
            } else {
                router.push(`/posts/${postId}`);
            }
        } catch (error) {
            console.error(error);
            alert("An unexpected error occurred.");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleCreateCategory = async () => {
        const name = prompt("새 카테고리 이름을 입력하세요:");
        if (!name) return;

        const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9가-힣\-]/g, '');

        if (!slug) {
            alert("유효하지 않은 카테고리 이름입니다.");
            return;
        }

        setIsCreatingCategory(true);
        try {
            const result = await createCategory(name, slug);
            if (result.error) {
                alert(result.error);
            } else if (result.category) {
                setCategories(prev => [...prev, result.category].sort((a, b) => a.name.localeCompare(b.name)));
                setCategoryId(result.category.id);
            }
        } catch (error) {
            console.error(error);
            alert("카테고리 생성 중 오류가 발생했습니다.");
        } finally {
            setIsCreatingCategory(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center text-zinc-900 dark:text-zinc-50 font-sans">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 flex flex-col font-sans">
            {/* Header */}
            <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Hexagon className="w-6 h-6 text-blue-500 fill-blue-500" />
                        <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                            DevBlog<span className="text-blue-500 font-normal">Editor</span>
                        </span>
                    </div>
                    <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-800"></div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Editing Post</span>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white pb-2 pr-2 border-r border-zinc-300 dark:border-zinc-800 transition-colors">
                        <HelpCircle className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2">
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500 max-w-[150px] truncate"
                        >
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleCreateCategory}
                            disabled={isCreatingCategory}
                            title="새 카테고리 추가"
                            className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md transition-colors disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => router.push(`/posts/${postId}`)}
                        className="px-4 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors line-clamp-1"
                    >
                        취소
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="px-4 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
                    >
                        {isPublishing ? "Saving..." : "Save Changes"}
                    </button>

                    <div className="ml-2 w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-bold">ME</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-6 py-8">
                <input
                    type="text"
                    placeholder="New post title here..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent border-none text-4xl font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-0 mb-6"
                />

                <div className="flex-1 min-h-[500px] border border-zinc-300 dark:border-zinc-800 rounded-lg overflow-hidden editor-container">
                    <Editor
                        value={content}
                        onChange={(val) => setContent(val || "")}
                    />
                </div>
            </main>

            {/* Basic styles to override react-md-editor defaults */}
            <style jsx global>{`
        .editor-container .w-md-editor {
          background-color: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }
        .editor-container .w-md-editor-toolbar {
          padding: 8px 12px !important;
        }
        .editor-container .w-md-editor-content {
          background-color: transparent !important;
        }
        .editor-container .w-md-editor-text-input {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
          font-size: 15px !important;
          line-height: 1.6 !important;
        }
      `}</style>
        </div>
    );
}
