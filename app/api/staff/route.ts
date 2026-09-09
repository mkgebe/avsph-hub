import {
  authorizationErrorResponse,
  requireAdmin,
  getSupabaseAdmin,
} from "@/utils/supabase/admin";
import { toStaff } from "@/utils/supabase/mappers";
import type { CreateStaffRequest } from "@/types/staff.types";

// Creating a staff member provisions a Supabase Auth user, which needs the
// service role key. That cannot go to the browser, so it happens here.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateStaffRequest;

    if (!body?.email || !body?.password || !body?.businessId) {
      return Response.json(
        { error: "email, password and businessId are required." },
        { status: 400 },
      );
    }

    await requireAdmin(request, body.businessId);
    const supabaseAdmin = getSupabaseAdmin();

    const { data: created, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true,
      });

    if (createError || !created.user) {
      return Response.json(
        { error: createError?.message || "Could not create the account." },
        { status: 400 },
      );
    }

    const { data: row, error: insertError } = await supabaseAdmin
      .from("staff")
      .insert({
        id: created.user.id,
        business_id: body.businessId,
        email: body.email,
        first_name: body.firstName,
        last_name: body.lastName,
        phone: body.phone ?? null,
        position: body.position,
        department: body.department ?? null,
        date_hired: body.dateHired,
        salary: body.salary ?? null,
        salary_type: body.salaryType ?? null,
        compensation_profile_id: body.compensationProfileId ?? null,
        employment_type: body.employmentType ?? "full-time",
      })
      .select("*")
      .single();

    if (insertError || !row) {
      // Roll the auth user back so a failed insert does not leave an
      // account that can sign in but has no staff record.
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return Response.json(
        { error: insertError?.message || "Could not save the staff record." },
        { status: 400 },
      );
    }

    return Response.json(toStaff(row), { status: 201 });
  } catch (error) {
    return authorizationErrorResponse(error);
  }
}
