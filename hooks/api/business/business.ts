import { supabase } from "@/lib/supabase";
import {
    BUSINESS_COLUMNS,
    BUSINESS_SELECT,
    toBusiness,
    toColumns,
    type BusinessRow,
} from "@/lib/mappers";
import type {
    Business,
    CreateBusinessRequest,
    UpdateBusinessRequest,
    DeleteBusinessResponse,
    UploadLogoResponse,
} from '@/types/business.types';

// Which businesses come back is decided by the table's RLS policy: every one
// for a super-admin, only the assigned ones for a plain admin.
export const getAllBusinesses = async (): Promise<Business[]> => {
    const { data, error } = await supabase
        .from("businesses")
        .select(BUSINESS_SELECT)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data as BusinessRow[]).map(toBusiness);
};

export const getBusinessById = async (id: string): Promise<Business> => {
    const { data, error } = await supabase
        .from("businesses")
        .select(BUSINESS_SELECT)
        .eq("id", id)
        .single();

    if (error) throw new Error(error.message);
    return toBusiness(data as BusinessRow);
};

export const getBusinessBySlug = async (slug: string): Promise<Business> => {
    const { data, error } = await supabase
        .from("businesses")
        .select(BUSINESS_SELECT)
        .eq("slug", slug)
        .single();

    if (error) throw new Error(error.message);
    return toBusiness(data as BusinessRow);
};

export const createBusiness = async (data: CreateBusinessRequest): Promise<Business> => {
    const { data: user } = await supabase.auth.getUser();

    const { data: row, error } = await supabase
        .from("businesses")
        .insert({
            ...toColumns(data, BUSINESS_COLUMNS),
            created_by: user.user?.id ?? null,
        })
        .select(BUSINESS_SELECT)
        .single();

    if (error) throw new Error(error.message);
    return toBusiness(row as BusinessRow);
};

export const updateBusiness = async (id: string, data: UpdateBusinessRequest): Promise<Business> => {
    const { data: row, error } = await supabase
        .from("businesses")
        .update(toColumns(data, BUSINESS_COLUMNS))
        .eq("id", id)
        .select(BUSINESS_SELECT)
        .single();

    if (error) throw new Error(error.message);
    return toBusiness(row as BusinessRow);
};

// Soft delete, as before: the row stays and drops out of the active lists.
export const deleteBusiness = async (id: string): Promise<DeleteBusinessResponse> => {
    const { error } = await supabase
        .from("businesses")
        .update({ is_active: false })
        .eq("id", id);

    if (error) throw new Error(error.message);
    return { message: "Business deleted." };
};

// Not migrated: there is no storage bucket for business logos, so this would
// have nowhere to put the file. Creating one is a schema change, not a code
// change, so it is left to be decided rather than guessed at here.
export const uploadBusinessLogo = async (_id: string, _file: File): Promise<UploadLogoResponse> => {
    throw new Error(
        "Business logo upload is not available yet: the Supabase project has no bucket for business logos.",
    );
};
