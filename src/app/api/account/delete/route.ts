
import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function DELETE() {
  try {
    // 1. Verify the logged-in user
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in before deleting your account." },
        { status: 401 }
      );
    }

    // 2. Create secure admin client
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      throw new Error("Supabase service role key is missing.");
    }

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Always use the authenticated user's ID.
    const userId = user.id;

    // 3. Delete the user's private address
    const { error: addressError } = await admin
      .from("user_private_details")
      .delete()
      .eq("user_id", userId);

    if (addressError) {
      throw addressError;
    }

    // 4. Delete the user's public profile
    const { error: profileError } = await admin
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    if (profileError) {
      throw profileError;
    }

    // 5. Delete the authentication account
    const { error: deleteError } =
      await admin.auth.admin.deleteUser(userId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: "Your account has been deleted successfully.",
    });

  } catch (error) {
    console.error("Account deletion error:", error);

    return NextResponse.json(
      { error: "Unable to completely delete your account." },
      { status: 500 }
    );
  }
}
