"use client";

import dynamic from "next/dynamic";
import { useState, useRef } from "react";
import { uploadImage } from "../upload-action";
import { toast } from "sonner";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface EditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Reset so same file can be re-selected
        e.target.value = "";
        await handleUpload(file);
    };

    const handleUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error("이미지 파일만 업로드할 수 있습니다.");
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const result = await uploadImage(formData);

            if (result.error || !result.url) {
                toast.error(result.error || "이미지 업로드에 실패했습니다.");
            } else {
                const imageMarkdown = `\n![${file.name}](${result.url})\n`;
                onChange((value || "") + imageMarkdown);
                toast.success("이미지가 업로드되었습니다!");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("이미지 업로드 중 오류가 발생했습니다.");
        } finally {
            setIsUploading(false);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    e.preventDefault();
                    handleUpload(file);
                    break;
                }
            }
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        const files = e.dataTransfer?.files;
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            if (files[i].type.startsWith('image/')) {
                e.preventDefault();
                handleUpload(files[i]);
                break;
            }
        }
    };

    // Custom image command: intercepts the toolbar image button and opens file picker
    const imageUploadCommand = {
        name: "image",
        keyCommand: "image",
        buttonProps: { "aria-label": "이미지 업로드", title: "이미지 업로드 (파일 선택)" },
        icon: (
            <svg viewBox="0 0 16 16" width="12px" height="12px">
                <path d="M14.002 2h-12a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zm-1 10H3.002L6 6l2 4 2-2 3 4z" fill="currentColor" />
                <circle cx="5" cy="5" r="1" fill="currentColor" />
            </svg>
        ),
        execute: () => {
            fileInputRef.current?.click();
        },
    };

    return (
        <div
            data-color-mode="dark"
            className={`h-full w-full relative ${isUploading ? 'opacity-80' : ''}`}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
        >
            {/* Hidden file input triggered by the toolbar image command */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            <MDEditor
                value={value}
                onChange={onChange}
                height="100%"
                className="w-full !border-0 !bg-transparent h-full min-h-[500px]"
                visibleDragbar={false}
                enableScroll={true}
                extraCommands={[]}
                commands={[
                    // Text formatting
                    { name: "bold", keyCommand: "bold", buttonProps: { "aria-label": "굵게" }, icon: <b style={{ fontSize: 13 }}>B</b>, execute: (state: any, api: any) => { api.replaceSelection(`**${state.selectedText || "굵게"}**`); } },
                    { name: "italic", keyCommand: "italic", buttonProps: { "aria-label": "기울임" }, icon: <i style={{ fontSize: 13 }}>I</i>, execute: (state: any, api: any) => { api.replaceSelection(`*${state.selectedText || "기울임"}*`); } },
                    { name: "strikethrough", keyCommand: "strikethrough", buttonProps: { "aria-label": "취소선" }, icon: <s style={{ fontSize: 13 }}>S</s>, execute: (state: any, api: any) => { api.replaceSelection(`~~${state.selectedText || "취소선"}~~`); } },
                    // Separator
                    { name: "divider1", keyCommand: "divider" } as any,
                    // Headings
                    { name: "title2", keyCommand: "title2", buttonProps: { "aria-label": "제목" }, icon: <span style={{ fontSize: 12, fontWeight: "bold" }}>H</span>, execute: (state: any, api: any) => { api.replaceSelection(`## ${state.selectedText || "제목"}`); } },
                    // Separator
                    { name: "divider2", keyCommand: "divider" } as any,
                    // Code
                    { name: "code", keyCommand: "code", buttonProps: { "aria-label": "코드" }, icon: <span style={{ fontSize: 11, fontFamily: "monospace" }}>{"<>"}</span>, execute: (state: any, api: any) => { api.replaceSelection(`\`${state.selectedText || "코드"}\``); } },
                    { name: "codeblock", keyCommand: "codeblock", buttonProps: { "aria-label": "코드 블록" }, icon: <span style={{ fontSize: 10, fontFamily: "monospace" }}>{"```"}</span>, execute: (state: any, api: any) => { api.replaceSelection(`\`\`\`\n${state.selectedText || "코드"}\n\`\`\``); } },
                    // Separator
                    { name: "divider3", keyCommand: "divider" } as any,
                    // Lists
                    { name: "unordered-list", keyCommand: "unordered-list", buttonProps: { "aria-label": "글머리 기호" }, icon: <span style={{ fontSize: 12 }}>≡</span>, execute: (state: any, api: any) => { api.replaceSelection(`\n- ${state.selectedText || "항목"}\n`); } },
                    { name: "ordered-list", keyCommand: "ordered-list", buttonProps: { "aria-label": "번호 목록" }, icon: <span style={{ fontSize: 12 }}>1.</span>, execute: (state: any, api: any) => { api.replaceSelection(`\n1. ${state.selectedText || "항목"}\n`); } },
                    // Separator
                    { name: "divider4", keyCommand: "divider" } as any,
                    // Link & Image
                    { name: "link", keyCommand: "link", buttonProps: { "aria-label": "링크" }, icon: <span style={{ fontSize: 12 }}>🔗</span>, execute: (state: any, api: any) => { api.replaceSelection(`[${state.selectedText || "링크텍스트"}](url)`); } },
                    imageUploadCommand,
                ]}
                textareaProps={{
                    placeholder: "Type your content here...",
                }}
            />
        </div>
    );
}
