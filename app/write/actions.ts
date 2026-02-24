"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function publishPost(formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    let category = formData.get("category") as string;

    if (!title || !content) {
        return { error: "Title and content are required." };
    }

    if (!category) {
        category = "Development"; // Default fallback
    }

    const excerpt = content.substring(0, 150) + (content.length > 150 ? "..." : "");

    // Extract first image URL from markdown content for use as post thumbnail
    const imageMatch = content.match(/!\[.*?\]\((https?:\/\/[^)]+)\)/);
    const image_url = imageMatch ? imageMatch[1] : null;

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return { error: "You must be logged in to publish a post." };
    }

    const { data, error } = await supabase
        .from("posts")
        .insert([
            {
                title,
                content,
                excerpt,
                category,
                image_url,
                author_id: user.id
            },
        ])
        .select()
        .single();

    if (error) {
        console.error("Error publishing post:", error);
        return { error: error.message };
    }

    revalidatePath("/");
    return { success: true, post: data };
}
