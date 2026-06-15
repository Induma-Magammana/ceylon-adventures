import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Return the current user's roles (e.g. ["customer"], ["customer","provider"]). */
export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { roles: (data ?? []).map((r: { role: string }) => r.role), userId };
  });

/** Promote the current user to a Service Provider: add 'provider' role + providers row. */
export const becomeProvider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { companyName: string; contactNumber?: string; businessAddress?: string }) => {
      if (!input?.companyName || input.companyName.trim().length < 2) {
        throw new Error("Company name is required");
      }
      return {
        companyName: input.companyName.trim().slice(0, 120),
        contactNumber: input.contactNumber?.trim().slice(0, 40) ?? null,
        businessAddress: input.businessAddress?.trim().slice(0, 500) ?? null,
      };
    },
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Add provider role (idempotent via unique constraint)
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "provider" }, { onConflict: "user_id,role" });
    if (roleErr) throw new Error(roleErr.message);

    // Create/update provider profile
    const { error: provErr } = await supabaseAdmin
      .from("providers")
      .upsert(
        {
          user_id: userId,
          company_name: data.companyName,
          contact_number: data.contactNumber,
          business_address: data.businessAddress,
        },
        { onConflict: "user_id" },
      );
    if (provErr) throw new Error(provErr.message);

    return { ok: true };
  });