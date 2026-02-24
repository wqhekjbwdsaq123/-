"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function updatePost(postId: string, formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const category_id = formData.get("category_id") as string;

    if (!title || !content) {
        return { error: "Title and content are required." };
    }

    if (!category_id) {
        return { error: "Category is required." };
    }

    const excerpt = content.substring(0, 150) + (content.length > 150 ? "..." : "");

    // Extract first image URL from markdown content for use as post thumbnail
    const imageMatch = content.match(/!\[.*?\]\((https?:\/\/[^)]+)\)/);
    const image_url = imageMatch ? imageMatch[1] : null;

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return { error: "You must be logged in to update a post." };
    }

    // Verify authorship
    const { data: existingPost } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();

    if (!existingPost || existingPost.author_id !== user.id) {
        return { error: "You do not have permission to edit this post." };
    }

    const { data, error } = await supabase
        .from("posts")
        .update({
            title,
            content,
            excerpt,
            category_id,
            image_url,
            updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select()
        .single();

    if (error) {
        console.error("Error updating post:", error);
        return { error: error.message };
    }

    revalidatePath("/");
    revalidatePath(`/posts/${postId}`);

    return { success: true, post: data };
}
