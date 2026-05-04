# Install email signature: Gmail, Thunderbird, phone

Use this after the signature is deployed at **https://assets.kimbersykes.com/email-signature/**.

---

## Source to use

- **For Gmail / Outlook (web or desktop):** Open **https://assets.kimbersykes.com/email-signature/signature-email.html** in a browser → Select all (Ctrl+A) → Copy (Ctrl+C) → Paste into the client’s signature field.
- **For Thunderbird:** Use the file **signature-thunderbird.html** in this folder (same content). Point Thunderbird to it, or copy the file to a fixed path and point Thunderbird there.

---

## Gmail (web)

1. Gmail → **Settings** (gear) → **See all settings**.
2. **General** → **Signature** → Create or edit a signature.
3. In the signature text box, **paste** the copied HTML. Gmail usually keeps formatting and images.
4. Set “**When replying**” / “**When composing**” to use this signature.
5. **Save Changes.**

If images don’t show: confirm you pasted from the URL above (absolute image URLs). Recipients may need to “Display images” once; the links are correct.

---

## Thunderbird (desktop)

1. **Account Settings** (or Settings → Account Settings) → select **kimber@kimbersykes.com**.
2. Under **Default Identity**:
   - **Attach the signature from a file instead:** **checked**.
   - **Choose…** → select **signature-thunderbird.html** (from this repo folder or from `C:\Users\kimbe\Dropbox\Kimber\Business\Edward Kimber Sykes\LOGO\signature-thunderbird.html`).
   - **Important:** Check **“Use HTML (e.g., &lt;b&gt;bold&lt;/b&gt;)”** so the signature is rendered as HTML. Without this, icons show as broken placeholders.
3. Save. Compose a new message to confirm; remote images may show as placeholders in compose but send correctly for recipients.

**Keeping the file in sync:** If you use the copy in Dropbox, update that file whenever you change the signature (or re-copy **signature-thunderbird.html** from this folder into that path).

---

## Phone (Gmail app)

- **Android / iOS Gmail app:** Signatures are often synced from the Gmail account. Set the signature in **Gmail on the web** (see above); the same signature (with HTML and image URLs) usually appears in the app. If the app has its own “Signature” under Settings → [your account], paste the same content there if it allows HTML.
- **Other mail apps on phone:** Use “Signature” or “Compose” settings and paste the same HTML if the app supports it; otherwise use a plain-text version of the details.

---

## Quick reference

| Client      | Action |
|------------|--------|
| Gmail web  | Paste from signature-email.html (or the live URL) into Settings → Signature. |
| Thunderbird| Signature from file → `signature-thunderbird.html`; **enable “Use HTML”**. |
| Phone      | Rely on Gmail sync after setting signature on web, or paste in app if it allows HTML. |

All image URLs point to **https://assets.kimbersykes.com/email-signature/assets/** so they work once the site is deployed.
