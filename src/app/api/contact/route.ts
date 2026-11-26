
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    // Verify that the visitor is logged in.
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in to submit a contact enquiry." },
        { status: 401 }
      );
    }

    // Address of yesterday's FastAPI application.
    const backendUrl = process.env.INTRIX_CONTACT_API_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { error: "Contact service is not configured." },
        { status: 503 }
      );
    }

    const incoming = await request.formData();
    const outgoing = new FormData();

    for (const field of ["name", "phone", "email", "subject", "message"]) {
      const value = incoming.get(field);

      if (typeof value !== "string" || !value.trim()) {
        return NextResponse.json(
          { error: `Please provide a valid ${field}.` },
          { status: 400 }
        );
      }

      outgoing.append(field, value);
    }

    const attachments = incoming.getAll("files");

    for (const attachment of attachments) {
      if (attachment instanceof File && attachment.size > 0) {
        outgoing.append("files", attachment, attachment.name);
      }
    }

    // Forward the form and attachments to the existing FastAPI backend.
    const upstream = await fetch(backendUrl, {
      method: "POST",
      body: outgoing,
      cache: "no-store",
    });

    const responseText = await upstream.text();

    let result: Record<string, unknown>;

    try {
      result = JSON.parse(responseText);
    } catch {
      result = { error: "The contact service returned an invalid response." };
    }

    if (!upstream.ok) {
      const detail =
        typeof result.detail === "string"
          ? result.detail
          : typeof result.error === "string"
            ? result.error
            : "Unable to submit your enquiry.";

      return NextResponse.json(
        { error: detail },
        { status: upstream.status }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      { error: "Unable to connect to the contact service." },
      { status: 500 }
    );
  }
}
