"use client";

import { AnimatePresence, motion } from "framer-motion";
import NextImage from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useRef, useState } from "react";
import { FloatingInput } from "../../components/register/FloatingInput";
import { PhotoDropzone } from "../../components/register/PhotoDropzone";
import { supabase } from "@/lib/supabase";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  startClass: string;
  startYear: string;
  endClass: string;
  endYear: string;
  publicExamFromSchool: "" | "yes" | "no";
  pscTaken: boolean;
  pscYear: string;
  jscTaken: boolean;
  jscYear: string;
  sscTaken: boolean;
  sscYear: string;
  hscTaken: boolean;
  hscYear: string;
  currentUniversity: string;
};

type FormErrors = Partial<
  Record<keyof FormValues | "photo" | "publicExams", string>
>;

const MAX_PHOTO_SIZE_BYTES = 100 * 1024;
const MAX_PHOTO_DIMENSION = 400;

const formContainer = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.06,
    },
  },
};

const fieldItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const getImageDimensions = (
  file: File,
): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      resolve({ width: image.width, height: image.height });
      URL.revokeObjectURL(imageUrl);
    };

    image.onerror = () => {
      reject(new Error("Failed to read image dimensions."));
      URL.revokeObjectURL(imageUrl);
    };

    image.src = imageUrl;
  });

export default function RegisterPage() {
  const [values, setValues] = useState<FormValues>({
    name: "",
    email: "",
    phone: "",
    startClass: "",
    startYear: "",
    endClass: "",
    endYear: "",
    publicExamFromSchool: "",
    pscTaken: false,
    pscYear: "",
    jscTaken: false,
    jscYear: "",
    sscTaken: false,
    sscYear: "",
    hscTaken: false,
    hscYear: "",
    currentUniversity: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusType, setStatusType] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const emailPattern = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);
  const yearPattern = useMemo(() => /^\d{4}$/, []);

  const stopProgressTimer = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const startProgressTimer = () => {
    stopProgressTimer();
    setUploadProgress(8);

    progressTimerRef.current = setInterval(() => {
      setUploadProgress((previous) => {
        if (previous >= 88) return previous;
        return previous + 6;
      });
    }, 220);
  };

  const validatePhoto = async (file: File | null) => {
    if (!file) return "Photo is required.";

    if (!file.type.startsWith("image/")) {
      return "Please upload an image file.";
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      return "Photo must be 100KB or smaller.";
    }

    try {
      const { width, height } = await getImageDimensions(file);
      if (width > MAX_PHOTO_DIMENSION || height > MAX_PHOTO_DIMENSION) {
        return "Photo must be within 400x400 pixels.";
      }
    } catch {
      return "Unable to validate photo. Please choose another image.";
    }

    return null;
  };

  const validateForm = async (): Promise<FormErrors> => {
    const nextErrors: FormErrors = {};

    if (!values.name.trim()) nextErrors.name = "Name is required.";

    if (!values.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(values.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!values.phone.trim()) nextErrors.phone = "Phone is required.";
    if (!values.startClass.trim())
      nextErrors.startClass = "Start class is required.";
    if (!values.startYear.trim()) {
      nextErrors.startYear = "Start year is required.";
    } else if (!yearPattern.test(values.startYear.trim())) {
      nextErrors.startYear = "Start year must be 4 digits (e.g. 2015).";
    }

    if (!values.endClass.trim()) nextErrors.endClass = "End class is required.";
    if (!values.endYear.trim()) {
      nextErrors.endYear = "End year is required.";
    } else if (!yearPattern.test(values.endYear.trim())) {
      nextErrors.endYear = "End year must be 4 digits (e.g. 2020).";
    }

    if (!values.publicExamFromSchool) {
      nextErrors.publicExamFromSchool = "Please choose yes or no.";
    }

    if (values.publicExamFromSchool === "yes") {
      const hasAnyExam =
        values.pscTaken ||
        values.jscTaken ||
        values.sscTaken ||
        values.hscTaken;

      if (!hasAnyExam) {
        nextErrors.publicExams = "Select at least one public exam.";
      }

      if (values.pscTaken) {
        if (!values.pscYear.trim()) {
          nextErrors.pscYear = "PSC year is required.";
        } else if (!yearPattern.test(values.pscYear.trim())) {
          nextErrors.pscYear = "PSC year must be 4 digits.";
        }
      }

      if (values.jscTaken) {
        if (!values.jscYear.trim()) {
          nextErrors.jscYear = "JSC year is required.";
        } else if (!yearPattern.test(values.jscYear.trim())) {
          nextErrors.jscYear = "JSC year must be 4 digits.";
        }
      }

      if (values.sscTaken) {
        if (!values.sscYear.trim()) {
          nextErrors.sscYear = "SSC year is required.";
        } else if (!yearPattern.test(values.sscYear.trim())) {
          nextErrors.sscYear = "SSC year must be 4 digits.";
        }
      }

      if (values.hscTaken) {
        if (!values.hscYear.trim()) {
          nextErrors.hscYear = "HSC year is required.";
        } else if (!yearPattern.test(values.hscYear.trim())) {
          nextErrors.hscYear = "HSC year must be 4 digits.";
        }
      }
    }

    if (!values.currentUniversity.trim()) {
      nextErrors.currentUniversity = "Current university/job is required.";
    }

    const photoError = await validatePhoto(photoFile);
    if (photoError) nextErrors.photo = photoError;

    return nextErrors;
  };

  const handlePhotoSelect = async (file: File | null) => {
    const photoError = await validatePhoto(file);

    if (photoError) {
      setPhotoFile(null);
      setErrors((previous) => ({ ...previous, photo: photoError }));
      return;
    }

    setPhotoFile(file);
    setErrors((previous) => ({ ...previous, photo: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");
    setStatusType("idle");

    const validationErrors = await validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!photoFile) return;

    setErrors({});
    setIsSubmitting(true);

    try {
      startProgressTimer();

      const safeName = photoFile.name.replace(/\s+/g, "-").toLowerCase();
      const storagePath = `alumni/${Date.now()}-${safeName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("alumni-photos")
        .upload(storagePath, photoFile, { upsert: false });

      if (uploadError) {
        stopProgressTimer();
        setUploadProgress(0);
        setStatusType("error");
        setStatusMessage(`Photo upload failed: ${uploadError.message}`);
        return;
      }

      setUploadProgress(94);

      const { error: insertError } = await supabase.from("alumni").insert([
        {
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          phone: values.phone.trim(),
          session: `${values.startClass.trim()} (${values.startYear.trim()}) - ${values.endClass.trim()} (${values.endYear.trim()})`,
          start_class: values.startClass.trim(),
          start_year: Number.parseInt(values.startYear.trim(), 10),
          end_class: values.endClass.trim(),
          end_year: Number.parseInt(values.endYear.trim(), 10),
          has_public_exam: values.publicExamFromSchool === "yes",
          psc_year:
            values.publicExamFromSchool === "yes" && values.pscTaken
              ? Number.parseInt(values.pscYear.trim(), 10)
              : null,
          jsc_year:
            values.publicExamFromSchool === "yes" && values.jscTaken
              ? Number.parseInt(values.jscYear.trim(), 10)
              : null,
          ssc_year:
            values.publicExamFromSchool === "yes" && values.sscTaken
              ? Number.parseInt(values.sscYear.trim(), 10)
              : null,
          hsc_year:
            values.publicExamFromSchool === "yes" && values.hscTaken
              ? Number.parseInt(values.hscYear.trim(), 10)
              : null,
          current_university: values.currentUniversity.trim(),
          photo_url: uploadData.path,
        },
      ]);

      if (insertError) {
        await supabase.storage.from("alumni-photos").remove([uploadData.path]);
        stopProgressTimer();
        setUploadProgress(0);
        setStatusType("error");
        setStatusMessage(`Submission failed: ${insertError.message}`);
        return;
      }

      stopProgressTimer();
      setUploadProgress(100);
      setStatusType("success");
      setStatusMessage("Registration submitted successfully.");

      setValues({
        name: "",
        email: "",
        phone: "",
        startClass: "",
        startYear: "",
        endClass: "",
        endYear: "",
        publicExamFromSchool: "",
        pscTaken: false,
        pscYear: "",
        jscTaken: false,
        jscYear: "",
        sscTaken: false,
        sscYear: "",
        hscTaken: false,
        hscYear: "",
        currentUniversity: "",
      });
      setPhotoFile(null);

      setTimeout(() => {
        setUploadProgress(0);
      }, 900);
    } catch (error) {
      stopProgressTimer();
      setUploadProgress(0);
      const message =
        error instanceof Error
          ? error.message
          : "Unexpected error occurred during submission.";
      setStatusType("error");
      setStatusMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormValues) => (nextValue: string) => {
    setValues((previous) => ({ ...previous, [field]: nextValue }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handlePublicExamChoice = (choice: "yes" | "no") => {
    setValues((previous) => ({
      ...previous,
      publicExamFromSchool: choice,
      ...(choice === "no"
        ? {
            pscTaken: false,
            pscYear: "",
            jscTaken: false,
            jscYear: "",
            sscTaken: false,
            sscYear: "",
            hscTaken: false,
            hscYear: "",
          }
        : {}),
    }));

    setErrors((previous) => ({
      ...previous,
      publicExamFromSchool: undefined,
      publicExams: undefined,
      pscYear: undefined,
      jscYear: undefined,
      sscYear: undefined,
      hscYear: undefined,
    }));
  };

  const handleExamToggle = (
    exam: "psc" | "jsc" | "ssc" | "hsc",
    checked: boolean,
  ) => {
    setValues(
      (previous) =>
        ({
          ...previous,
          [`${exam}Taken`]: checked,
          ...(checked ? {} : { [`${exam}Year`]: "" }),
        }) as FormValues,
    );

    setErrors((previous) => ({
      ...previous,
      publicExams: undefined,
      [`${exam}Year`]: undefined,
    }));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(14,165,233,0.12),transparent_30%),radial-gradient(circle_at_90%_85%,rgba(6,182,212,0.12),transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          className="grid overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-2xl shadow-slate-900/10 backdrop-blur-xl lg:min-h-[80vh] lg:grid-cols-2"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <section className="order-2 p-6 sm:p-8 lg:order-1 lg:p-10">
            <div className="mb-7 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                  Alumni Registration
                </p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
                  Join The BGPSC Alumni Network
                </h1>
              </div>
              <Link
                href="/"
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-500 hover:text-blue-700"
              >
                Back Home
              </Link>
            </div>

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              variants={formContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={fieldItem}>
                <FloatingInput
                  id="name"
                  label="Name"
                  value={values.name}
                  onChange={handleChange("name")}
                  required
                  type="text"
                  icon={<UserIcon />}
                  error={errors.name}
                />
              </motion.div>

              <motion.div variants={fieldItem}>
                <FloatingInput
                  id="email"
                  label="Email"
                  value={values.email}
                  onChange={handleChange("email")}
                  required
                  type="email"
                  icon={<EmailIcon />}
                  error={errors.email}
                />
              </motion.div>

              <motion.div variants={fieldItem}>
                <FloatingInput
                  id="phone"
                  label="Phone"
                  value={values.phone}
                  onChange={handleChange("phone")}
                  required
                  type="tel"
                  icon={<PhoneIcon />}
                  error={errors.phone}
                />
              </motion.div>

              <motion.div variants={fieldItem}>
                <FloatingInput
                  id="startClass"
                  label="Start Class"
                  placeholder="e.g. Class 1"
                  value={values.startClass}
                  onChange={handleChange("startClass")}
                  required
                  type="text"
                  icon={<SessionIcon />}
                  error={errors.startClass}
                />
              </motion.div>

              <motion.div variants={fieldItem}>
                <FloatingInput
                  id="startYear"
                  label="Start Year"
                  placeholder="e.g. 2012"
                  value={values.startYear}
                  onChange={handleChange("startYear")}
                  required
                  type="text"
                  icon={<SessionIcon />}
                  error={errors.startYear}
                />
              </motion.div>

              <motion.div variants={fieldItem}>
                <FloatingInput
                  id="endClass"
                  label="End Class"
                  placeholder="e.g. Class 10"
                  value={values.endClass}
                  onChange={handleChange("endClass")}
                  required
                  type="text"
                  icon={<SessionIcon />}
                  error={errors.endClass}
                />
              </motion.div>

              <motion.div variants={fieldItem}>
                <FloatingInput
                  id="endYear"
                  label="End Year"
                  placeholder="e.g. 2023"
                  value={values.endYear}
                  onChange={handleChange("endYear")}
                  required
                  type="text"
                  icon={<SessionIcon />}
                  error={errors.endYear}
                />
              </motion.div>

              <motion.div
                variants={fieldItem}
                className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                  Do you have any public exam from this school? *
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handlePublicExamChoice("yes")}
                    className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                      values.publicExamFromSchool === "yes"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-blue-400"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePublicExamChoice("no")}
                    className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                      values.publicExamFromSchool === "no"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-blue-400"
                    }`}
                  >
                    No
                  </button>
                </div>

                {errors.publicExamFromSchool ? (
                  <p className="text-xs text-rose-600">
                    {errors.publicExamFromSchool}
                  </p>
                ) : null}

                {values.publicExamFromSchool === "yes" ? (
                  <div className="space-y-3">
                    {errors.publicExams ? (
                      <p className="text-xs text-rose-600">
                        {errors.publicExams}
                      </p>
                    ) : null}

                    <div className="space-y-2">
                      <ExamYearRow
                        label="PSC"
                        checked={values.pscTaken}
                        yearValue={values.pscYear}
                        onToggle={(checked) => handleExamToggle("psc", checked)}
                        onYearChange={handleChange("pscYear")}
                        error={errors.pscYear}
                      />
                      <ExamYearRow
                        label="JSC"
                        checked={values.jscTaken}
                        yearValue={values.jscYear}
                        onToggle={(checked) => handleExamToggle("jsc", checked)}
                        onYearChange={handleChange("jscYear")}
                        error={errors.jscYear}
                      />
                      <ExamYearRow
                        label="SSC"
                        checked={values.sscTaken}
                        yearValue={values.sscYear}
                        onToggle={(checked) => handleExamToggle("ssc", checked)}
                        onYearChange={handleChange("sscYear")}
                        error={errors.sscYear}
                      />
                      <ExamYearRow
                        label="HSC"
                        checked={values.hscTaken}
                        yearValue={values.hscYear}
                        onToggle={(checked) => handleExamToggle("hsc", checked)}
                        onYearChange={handleChange("hscYear")}
                        error={errors.hscYear}
                      />
                    </div>
                  </div>
                ) : null}
              </motion.div>

              <motion.div variants={fieldItem}>
                <FloatingInput
                  id="currentUniversity"
                  label="Current University / Job"
                  value={values.currentUniversity}
                  onChange={handleChange("currentUniversity")}
                  required
                  type="text"
                  icon={<WorkIcon />}
                  error={errors.currentUniversity}
                />
              </motion.div>

              <motion.div variants={fieldItem} className="pt-1">
                <PhotoDropzone
                  file={photoFile}
                  onFileSelect={handlePhotoSelect}
                  error={errors.photo}
                  uploadProgress={uploadProgress}
                />
              </motion.div>

              <motion.div variants={fieldItem} className="pt-2">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-600 text-sm font-semibold text-white shadow-xl shadow-blue-700/25 transition disabled:cursor-not-allowed disabled:opacity-60"
                  whileHover={{
                    scale: 1.01,
                    boxShadow: "0 16px 35px rgba(14, 116, 255, 0.35)",
                  }}
                  whileTap={{ scale: 0.99 }}
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <SpinnerIcon />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Registration"
                  )}
                </motion.button>
              </motion.div>
            </motion.form>

            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
              <p className="inline-flex items-center gap-2 text-xs text-emerald-800 sm:text-sm">
                <TrustIcon />
                Your data is Safe and only used for alumni connection
              </p>
            </div>

            <AnimatePresence mode="wait">
              {statusType !== "idle" ? (
                <motion.p
                  key={statusType}
                  className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                    statusType === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {statusMessage}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </section>

          <section className="relative order-1 min-h-[260px] lg:order-2 lg:min-h-full">
            <NextImage
              src="/images/SideviewSchool.jpg"
              alt="Border Guard Public School and College"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
              <motion.div
                className="rounded-2xl border border-white/30 bg-slate-900/45 p-5 text-white backdrop-blur-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.7 }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  Why Join
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Connect with your batch, mentors, and future opportunities
                </h2>
                <p className="mt-2 text-sm text-slate-200">
                  A trusted digital home for alumni stories, updates, and
                  meaningful connections.
                </p>
              </motion.div>
            </div>
          </section>
        </motion.div>
      </div>
    </main>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 21a8 8 0 1 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.09 2h3a2 2 0 0 1 2 1.72 13 13 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 13 13 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function SessionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 5h16v14H4z" />
      <path d="M8 3v4M16 3v4M4 11h16" />
    </svg>
  );
}

type ExamYearRowProps = {
  label: string;
  checked: boolean;
  yearValue: string;
  onToggle: (checked: boolean) => void;
  onYearChange: (value: string) => void;
  error?: string;
};

function ExamYearRow({
  label,
  checked,
  yearValue,
  onToggle,
  onYearChange,
  error,
}: ExamYearRowProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onToggle(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        {label}
      </label>

      {checked ? (
        <div className="mt-2">
          <input
            type="text"
            value={yearValue}
            onChange={(event) => onYearChange(event.target.value)}
            placeholder={`${label} year (e.g. 2018)`}
            className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
          {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function WorkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 7h18v13H3z" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </svg>
  );
}

function TrustIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
