"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Settings, HelpCircle, Hexagon, ImagePlus } from "lucide-react";
import Editor from "./components/Editor";
import { publishPost } from "./actions";
import { uploadImage } from "./upload-action";

export default function WritePage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("Development");
    const [isPublishing, setIsPublishing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                    (result.error || "알 수 없는 오류") +
                    "\n\n※ Supabase Storage에 'blog-images' 버킷이 있는지 확인해 주세요.");
            } else {
                const markdown = `\n![${file.name}](${result.url})\n`;
                setContent((prev) => prev + markdown);
            }
        } catch (err) {
            console.error(err);
            alert("이미지 업로드 중 오류가 발생했습니다.");
        } finally {
            setIsUploading(false);
            // Reset file input so same file can be re-selected
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
            formData.append("category", category);

            const result = await publishPost(formData);

            if (result.error) {
                alert("Failed to publish: " + result.error);
            } else {
                router.push("/");
            }
        } catch (error) {
            console.error(error);
            alert("An unexpected error occurred.");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F111A] text-gray-200 flex flex-col font-sans">
            {/* Header */}
            <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Hexagon className="w-6 h-6 text-blue-500 fill-blue-500" />
                        <span className="text-xl font-bold text-white tracking-tight">
                            DevBlog<span className="text-blue-500 font-normal">Editor</span>
                        </span>
                    </div>
                    <div className="h-6 w-px bg-gray-800"></div>
                    <span className="text-sm text-gray-400">Draft / New Post</span>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white pb-2 pr-2 border-r border-gray-800 transition-colors">
                        <HelpCircle className="w-5 h-5" />
                    </button>


                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="bg-[#1A1D27] text-sm text-gray-300 border border-gray-700 rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500"
                    >
                        <option value="Development">Development</option>
                        <option value="Design">Design</option>
                        <option value="Productivity">Productivity</option>
                    </select>

                    <button className="px-4 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                        Save Draft
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="px-4 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
                    >
                        {isPublishing ? "Publishing..." : "Publish"}
                    </button>

                    <div className="ml-2 w-8 h-8 rounded-full bg-gray-600 overflow-hidden border border-gray-500 flex items-center justify-center">
                        <span className="text-xs text-gray-300 font-bold">ME</span>
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
                    className="w-full bg-transparent border-none text-4xl font-bold text-white placeholder-gray-600 focus:outline-none focus:ring-0 mb-6"
                />

                <div className="flex-1 min-h-[500px] border border-gray-800 rounded-lg overflow-hidden editor-container">
                    <Editor
                        value={content}
                        onChange={(val) => setContent(val || "")}
                    />
                </div>
            </main>

            {/* Basic styles to override react-md-editor defaults to match the dark theme */}
            <style jsx global>{`
        .editor-container .w-md-editor {
          background-color: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }
        .editor-container .w-md-editor-toolbar {
          background-color: #1A1D27 !important;
          border-bottom: 1px solid #1F2937 !important;
          padding: 8px 12px !important;
        }
        .editor-container .w-md-editor-toolbar li button {
          color: #9CA3AF !important;
        }
        .editor-container .w-md-editor-toolbar li button:hover {
          color: #F3F4F6 !important;
          background-color: #374151 !important;
        }
        .editor-container .w-md-editor-content {
          background-color: #0F111A !important;
        }
        .editor-container .w-md-editor-text-input {
          color: #D1D5DB !important;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
          font-size: 15px !important;
          line-height: 1.6 !important;
        }
      `}</style>
        </div>
    );
}
