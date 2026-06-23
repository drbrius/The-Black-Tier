# The Black Tier — CRM-Backend einrichten

Solange die Umgebungsvariablen **nicht** gesetzt sind, läuft die Seite im
**Demo-Modus** (Login `4321`, Daten nur im Browser, E-Mails simuliert) — es
geht also nichts kaputt. Sobald die Variablen gesetzt sind, schaltet die Seite
automatisch auf das **echte CRM** um: echtes Login, Datenbank, echte E-Mails.

Du brauchst zwei kostenlose Konten: **Supabase** (Login + Datenbank) und
**Resend** (E-Mail-Versand). Geschätzte Zeit: ~20 Minuten.

---

## 1) Supabase (Login + Datenbank)

1. Auf https://supabase.com ein Konto anlegen → **New project**.
2. Wenn das Projekt bereit ist: links **SQL Editor** → **New query** →
   den kompletten Inhalt von `supabase/schema.sql` einfügen → **Run**.
   (Erstellt die Tabellen `inquiries`, `holdings`, `contacts`, `messages`
   inkl. Sicherheitsregeln.)
3. Schlüssel kopieren: **Project Settings → API**
   - **Project URL** → `…supabase.co`
   - **anon public** Key
   - **service_role** Key (geheim!)

### Mitarbeiter-Logins anlegen
4. **Authentication → Providers → Email**: „**Allow new users to sign up**"
   **ausschalten** (so kann sich niemand selbst registrieren).
5. **Authentication → Users → Add user** → E-Mail + Passwort für **dich** und
   für **jeden Mitarbeiter** anlegen. Das sind die einzigen Zugänge zum CRM.

---

## 2) Resend (E-Mail-Versand über deine Domain)

1. Auf https://resend.com ein Konto anlegen.
2. **Domains → Add Domain** → `theblacktier.com` eingeben.
3. Resend zeigt dir **DNS-Einträge** (SPF, DKIM). Diese bei deinem
   Domain-Anbieter (wo `theblacktier.com` registriert ist) eintragen →
   in Resend **Verify** klicken (kann ein paar Minuten dauern).
4. **API Keys → Create API Key** → kopieren (`re_…`).
5. Absender festlegen, z. B. `office@theblacktier.com`.

---

## 3) Variablen in Vercel setzen

Vercel → dein Projekt **the-black-tier** → **Settings → Environment Variables**
→ folgende 7 hinzufügen (Werte aus Schritt 1 & 2), dann **Save**:

| Name | Wert |
|---|---|
| `VITE_SUPABASE_URL` | deine Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | anon public Key |
| `SUPABASE_URL` | dieselbe Project URL |
| `SUPABASE_ANON_KEY` | anon public Key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role Key (geheim) |
| `RESEND_API_KEY` | `re_…` aus Resend |
| `MAIL_FROM` | `The Black Tier <office@theblacktier.com>` |

Danach **Deployments → … → Redeploy**.

---

## 4) Fertig

- Öffne `https://the-black-tier.vercel.app/#office` → mit deiner Supabase-E-Mail
  + Passwort einloggen.
- Anfragen vom öffentlichen Formular landen jetzt in **Anfragen**.
- In einer Anfrage: **Per E-Mail antworten** → es geht eine echte Mail von
  `office@theblacktier.com` raus und wird im **Postausgang** protokolliert.
- **Bestand** und **Kontakte** werden dauerhaft in der Datenbank gespeichert.

> Hinweis: E-Mail-Versand funktioniert nur im **Vercel-Deployment** (die
> `/api/send`-Funktion). Beim lokalen `npm run dev` ist das CRM nutzbar, aber
> der Mailversand läuft erst online.

### Später möglich (Phase 2)
- Eingehende Antworten der Kunden direkt im CRM (Inbound-E-Mail).
- Rollen (Admin/Mitarbeiter), Statusverläufe, Datei-Uploads zu Objekten.
