import {
  authorizationErrorResponse,
  requireAdmin,
  getSupabaseAdmin,
} from "@/utils/supabase/admin";
import { toAdmin } from "@/utils/supabase/mappers";
import type { RegisterRequest } from "@/types/auth.types";

// Only a super-admin may create admins, matching the rule the admins_insert
// policy enforces for direct table writes.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterRequest;

    if (!body?.email || !body?.password) {
      return Response.json(
        { error: "email and password are required." },
        { status: 400 },
      );
    }

    const caller = await requireAdmin(request);
    const supabaseAdmin = getSupabaseAdmin();
    if (caller.role !== "super-admin") {
      return Response.json(
        { error: "Only a super-admin can create admins." },
        { status: 403 },
      );
    }

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
      .from("admins")
      .insert({
        id: created.user.id,
        email: body.email,
        first_name: body.firstName,
        last_name: body.lastName,
        role: body.role ?? "admin",
      })
      .select("*")
      .single();

    if (insertError || !row) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return Response.json(
        { error: insertError?.message || "Could not save the admin record." },
        { status: 400 },
      );
    }

    const businessIds = body.businessIds ?? [];
    if (businessIds.length > 0) {
      const { error: membershipError } = await supabaseAdmin
        .from("admin_businesses")
        .insert(
          businessIds.map((business_id) => ({
            admin_id: created.user.id,
            business_id,
          })),
        );
      if (membershipError) {
        return Response.json({ error: membershipError.message }, { status: 400 });
      }
    }

    return Response.json({ ...toAdmin(row), businessIds }, { status: 201 });
  } catch (error) {
    return authorizationErrorResponse(error);
  }
}
