import { createClient } from "@supabase/supabase-js";

// Serverless email endpoint (Vercel).
// Only authenticated office staff (valid Supabase session) may send.
// Sends via Resend from your verified domain and logs to `messages`.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ error: "Missing authorization" });

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const ANON = process.env.SUPABASE_ANON_KEY;
    const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const MAIL_FROM = process.env.MAIL_FROM;

    if (!SUPABASE_URL || !ANON || !SERVICE || !RESEND_API_KEY || !MAIL_FROM) {
      return res.status(500).json({ error: "Server not configured (missing env vars)" });
    }

    // Verify the caller is a logged-in staff member.
    const authClient = createClient(SUPABASE_URL, ANON);
    const { data: { user }, error: userErr } = await authClient.auth.getUser(token);
    if (userErr || !user) return res.status(401).json({ error: "Invalid session" });

    const { to, subject, body, inquiryId, kind } = req.body || {};
    if (!to || !subject || !body) return res.status(400).json({ error: "Missing to / subject / body" });

    // Send via Resend.
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: MAIL_FROM, to: [to], subject, text: body, reply_to: MAIL_FROM }),
    });
    const sent = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(502).json({ error: "Email send failed", detail: sent });

    // Log to the CRM (service role bypasses RLS).
    const admin = createClient(SUPABASE_URL, SERVICE);
    await admin.from("messages").insert({
      to_email: to, subject, body, kind: kind || "reply",
      inquiry_id: inquiryId || null, status: "sent",
      resend_id: sent.id || null, created_by: user.email,
    });

    return res.status(200).json({ ok: true, id: sent.id || null });
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
}
