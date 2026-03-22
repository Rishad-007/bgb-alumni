import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type ReportRequestBody = {
  subject?: string;
  details?: string;
};

const MAX_SUBJECT_LENGTH = 120;
const MAX_DETAILS_LENGTH = 2000;

function getMailerConfig() {
  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.PROBLEM_REPORT_EMAIL || "rishad.nur007@gmail.com";
  const from = process.env.SMTP_FROM || user;

  if (!host || !portRaw || !user || !pass || !from) {
    return null;
  }

  const port = Number(portRaw);
  if (!Number.isFinite(port)) {
    return null;
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    from,
    to,
  };
}

export async function POST(request: Request) {
  const config = getMailerConfig();
  if (!config) {
    return NextResponse.json(
      {
        error:
          "Problem report email service is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.",
      },
      { status: 500 },
    );
  }

  const body = (await request
    .json()
    .catch(() => null)) as ReportRequestBody | null;
  const subject = body?.subject?.trim() ?? "";
  const details = body?.details?.trim() ?? "";

  if (!subject || !details) {
    return NextResponse.json(
      { error: "Subject and details are required." },
      { status: 400 },
    );
  }

  if (
    subject.length > MAX_SUBJECT_LENGTH ||
    details.length > MAX_DETAILS_LENGTH
  ) {
    return NextResponse.json(
      { error: "Subject or details exceed allowed length." },
      { status: 400 },
    );
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  try {
    await transporter.sendMail({
      from: config.from,
      to: config.to,
      subject: `[School Alumni] Problem Report: ${subject}`,
      text: `A new problem was reported.\n\nSubject: ${subject}\n\nDetails:\n${details}`,
      html: `
        <h2>New Problem Report</h2>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Details:</strong></p>
        <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(details)}</pre>
      `,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to send report email." },
      { status: 500 },
    );
  }
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
