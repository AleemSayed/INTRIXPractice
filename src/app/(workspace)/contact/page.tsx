
"use client";

import { useState, type FormEvent } from "react";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 100 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".xls", ".xlsx",
  ".jpg", ".jpeg", ".png", ".txt", ".csv",
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "General Enquiry",
    message: "",
   });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
     }));
    }
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function handleFiles(selected: FileList | null) {
    const chosen = Array.from(selected || []);
    setStatus("");

    if (chosen.length > MAX_FILES) {
      setStatus("You can upload a maximum of 10 files.");
      setFiles([]);
      return;
    }

    for (const file of chosen) {
      const extension = "." + (file.name.split(".").pop() || "").toLowerCase();

      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        setStatus(`File type not allowed: ${file.name}`);
        setFiles([]);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setStatus(`${file.name} exceeds the 10 MB limit.`);
        setFiles([]);
        return;
      }

      if (file.size === 0) {
        setStatus(`${file.name} is empty.`);
        setFiles([]);
        return;
      }
    }

    const totalSize = chosen.reduce((total, file) => total + file.size, 0);

    if (totalSize > MAX_TOTAL_SIZE) {
      setStatus("Total attachment size cannot exceed 100 MB.");
      setFiles([]);
      return;
    }

    setFiles(chosen);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus("");

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    // Remove the browser file field and append the validated files.
    formData.delete("files");
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setStatus(
          typeof result.error === "string"
            ? result.error
            : typeof result.detail === "string"
              ? result.detail
              : "Unable to submit your enquiry."
        );
        return;
      }

      setStatus(
        `Your enquiry was submitted successfully! Support reference: ${result.support_number}. ` +
        (result.email_sent
          ? "A confirmation email has been sent."
          : "Your enquiry is saved, but the confirmation email could not be sent.")
      );

      formElement.reset();
      setFiles([]);
    } catch {
      setStatus("Unable to connect to the contact service. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-heading">
        <p className="eyebrow">INTRIX SOLUTIONS</p>
        <h1>Let's start a conversation.</h1>
        <p className="muted">
          Have a question or a project in mind?
          Fill out the form and our team will get back to you.
        </p>
      </div>

      <form className="contact-card" onSubmit={submit}>
        <h2>Contact Us</h2>

        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={100}
          placeholder="Enter your full name"
        />

        <label htmlFor="phone">Phone Number</label>
        <input
            id="phone"
            name="phone"
            required
            type="tel"
            inputMode="numeric"
            minLength={10}
            maxLength={10}
            pattern="[6-9][0-9]{9}"
            value={form.phone}
            onChange={(e) =>
                updateField("phone", e.target.value.replace(/[^0-9]/g, ""))
            }
            placeholder="Enter your phone number"
        />

        <label htmlFor="email">Email Address</label>
        <input
            id="email"
            name="email"
            required
            type="email"
            maxLength={255}
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="Enter your email"
        />

        <label htmlFor="subject">Subject</label>
        <select id="subject" name="subject" required defaultValue="General Enquiry">
          <option value="General Enquiry">General Enquiry</option>
          <option value="Sales">Sales</option>
          <option value="Technical Support">Technical Support</option>
          <option value="Partnership">Partnership</option>
          <option value="Other">Other</option>
        </select>

        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          required
          minLength={5}
          maxLength={2000}
          rows={5}
          placeholder="Tell us how we can help..."
        />

        <label htmlFor="attachments">Attachments</label>
        <input
          id="attachments"
          name="files"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt,.csv"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <p className="muted">
          Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG, TXT and CSV.
          Maximum 10 files, 10 MB each, 100 MB combined.
        </p>

        {files.length > 0 && (
          <ul>
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`}>
                {file.name} — {(file.size / (1024 * 1024)).toFixed(2)} MB
              </li>
            ))}
          </ul>
        )}

        <button type="submit" disabled={busy}>
          {busy ? "Submitting..." : "Submit"}
        </button>

        {status && (
          <p className="notice" role="status" aria-live="polite">
            {status}
          </p>
        )}
      </form>
    </div>
  );
}
