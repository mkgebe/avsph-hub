import { supabase } from "@/lib/supabase";
import {
  CLIENT_COLUMNS,
  STAFF_SELECT,
  toClient,
  toColumns,
  toStaff,
  type ClientRow,
  type StaffRow,
} from "@/lib/mappers";
import type {
  Client,
  ClientListQuery,
  CreateClientRequest,
  UpdateClientRequest,
  DeleteClientResponse,
  WeeklyReport,
  WeeklyReportQuery,
  AnalyticsQuery,
  ClientAnalytics,
  BusinessClientAnalytics,
} from "@/types/client.types";
import type { Staff } from "@/types/staff.types";

export const getClients = async (
  query: ClientListQuery,
): Promise<Client[]> => {
  let request = supabase
    .from("clients")
    .select()
    .eq("business_id", query.businessId);

  if (query.status) request = request.eq("status", query.status);
  if (query.isActive !== undefined) {
    request = request.eq("is_active", query.isActive);
  }

  const { data, error } = await request.order("name");

  if (error) throw new Error(error.message);
  return (data as ClientRow[]).map(toClient);
};

export const getClientById = async (id: string): Promise<Client> => {
  const { data, error } = await supabase
    .from("clients")
    .select()
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return toClient(data as ClientRow);
};

export const createClient = async (
  data: CreateClientRequest,
): Promise<Client> => {
  const { data: row, error } = await supabase
    .from("clients")
    .insert(toColumns(data, CLIENT_COLUMNS))
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toClient(row as ClientRow);
};

export const updateClient = async (
  id: string,
  data: UpdateClientRequest,
): Promise<Client> => {
  const { data: row, error } = await supabase
    .from("clients")
    .update(toColumns(data, CLIENT_COLUMNS))
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toClient(row as ClientRow);
};

export const deleteClient = async (
  id: string,
): Promise<DeleteClientResponse> => {
  const { error } = await supabase
    .from("clients")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw new Error(error.message);
  return { message: "Client deleted." };
};

export const getClientStaff = async (id: string): Promise<Staff[]> => {
  const { data, error } = await supabase
    .from("staff")
    .select(STAFF_SELECT)
    .eq("client_id", id)
    .order("first_name");

  if (error) throw new Error(error.message);
  return (data as StaffRow[]).map(toStaff);
};

// Not migrated. Every figure these three produce (hours worked, pay, billable
// amounts, margins) is derived from end-of-day reports, attendance and
// invoices, and none of those have tables in the Supabase schema yet. They
// would return zeroes dressed up as real numbers, which is worse than an
// honest failure.
const NO_REPORTING_DATA =
  "Client reporting is not available yet: end-of-day reports, attendance and " +
  "invoices have no tables in the database.";

export const getBusinessClientAnalytics = async (
  _businessId: string,
  _query?: AnalyticsQuery,
): Promise<BusinessClientAnalytics> => {
  throw new Error(NO_REPORTING_DATA);
};

export const getClientAnalytics = async (
  _id: string,
  _query?: AnalyticsQuery,
): Promise<ClientAnalytics> => {
  throw new Error(NO_REPORTING_DATA);
};

export const getClientWeeklyReport = async (
  _id: string,
  _range?: WeeklyReportQuery,
): Promise<WeeklyReport> => {
  throw new Error(NO_REPORTING_DATA);
};
