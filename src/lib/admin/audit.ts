import { createServiceClient } from "@/lib/supabase/server";

export async function writeAudit(params: {
  adminId: string;
  action: string;
  oldValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
}) {
  const supabase = createServiceClient();
  await supabase.from("audit_log").insert({
    admin_id: params.adminId,
    action: params.action,
    old_value: params.oldValue ?? null,
    new_value: params.newValue ?? null,
    reason: params.reason ?? null,
  });
}
