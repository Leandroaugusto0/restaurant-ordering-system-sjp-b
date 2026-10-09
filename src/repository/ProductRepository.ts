import supabase from "../config/supabase.js";
import type { Product } from "../models/Product.js";

async function findAll() {
    const { data, error } = await supabase
        .from("products")
        .select("*, categories(id, name)")
        .order("name", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

async function findById(id: string) {
    const { data, error } = await supabase
        .from("products")
        .select("*, categories(id, name)")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

async function findByCategory(categoryId: string) {
    const { data, error } = await supabase
        .from("products")
        .select("*, categories(id, name)")
        .eq("category_id", categoryId)
        .order("name", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

async function create(product: Product) {
    const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function update(id: string, product: Product) {
    const { data, error } = await supabase
        .from("products")
        .update({
            ...product,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function remove(id: string) {
    const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

    if (error) {
        throw error;
    }
}

async function searchByKeyword(keyword: string) {
    const { data, error } = await supabase
        .from("products")
        .select("*, categories(id, name)")
        .or(`name.ilike.%${keyword}%, description.ilike.%${keyword}%`)
        .order("name", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

export default {
    findAll,
    findById,
    findByCategory,
    create,
    update,
    remove,
    searchByKeyword
}
