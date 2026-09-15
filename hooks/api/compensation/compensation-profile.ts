import { supabase } from "@/lib/supabase";
import {
  COMPENSATION_COLUMNS,
  toColumns,
  toCompensationProfile,
  type CompensationProfileRow,
} from "@/lib/mappers";
import type {
  CompensationProfile,
  CompensationProfileListQuery,
  CreateCompensationProfileRequest,
  UpdateCompensationProfileRequest,
} from "@/types/compensation-profile.types";

export const createCompensationProfile = async (
  data: CreateCompensationProfileRequest,
): Promise<CompensationProfile> => {
  const { data: row, error } = await supabase
    .from("compensation_profiles")
    .insert(toColumns(data, COMPENSATION_COLUMNS))
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toCompensationProfile(row as CompensationProfileRow);
};

export const getCompensationProfiles = async (
  query: CompensationProfileListQuery,
): Promise<CompensationProfile[]> => {
  let request = supabase
    .from("compensation_profiles")
    .select()
    .eq("business_id", query.businessId);

  if (query.isActive !== undefined) {
    request = request.eq("is_active", query.isActive);
  }

  const { data, error } = await request.order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as CompensationProfileRow[]).map(toCompensationProfile);
};

export const updateCompensationProfile = async (
  id: string,
  data: UpdateCompensationProfileRequest,
): Promise<CompensationProfile> => {
  const { data: row, error } = await supabase
    .from("compensation_profiles")
    .update(toColumns(data, COMPENSATION_COLUMNS))
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toCompensationProfile(row as CompensationProfileRow);
};
