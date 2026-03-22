"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
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

const generateYearOptions = (): string[] => {
  const currentYear = new Date().getFullYear();
  const startYear = 1980;
  const years: string[] = [];

  for (let year = currentYear; year >= startYear; year--) {
    years.push(year.toString());
  }

  return years;
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

function RegisterPage() {
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
    }

    if (!values.endClass.trim()) nextErrors.endClass = "End class is required.";
    if (!values.endYear.trim()) {
      nextErrors.endYear = "End year is required.";
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
        }
      }

      if (values.jscTaken) {
        if (!values.jscYear.trim()) {
          nextErrors.jscYear = "JSC year is required.";
        }
      }

      if (values.sscTaken) {
        if (!values.sscYear.trim()) {
          nextErrors.sscYear = "SSC year is required.";
        }
      }

      if (values.hscTaken) {
        if (!values.hscYear.trim()) {
          nextErrors.hscYear = "HSC year is required.";
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
    <main className="relative min-h-screen overflow-hidden bg-[#F8F9FA] [font-family:Inter,Montserrat,ui-sans-serif,system-ui]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(0,33,71,0.15),transparent_35%),radial-gradient(circle_at_100%_100%,rgba(212,175,55,0.12),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-6 flex items-center justify-between rounded-xl border border-[#002147]/15 bg-white/85 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#002147] text-sm font-bold text-white">
              BG
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#002147]">
                BGPSCL Alumni
              </p>
              <p className="text-sm text-slate-600">Registration Portal</p>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-[#002147]/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#002147] transition hover:border-[#002147] hover:bg-[#002147] hover:text-white"
          >
            Back Home
          </Link>
        </header>

        <motion.div
          className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <section className="order-2 space-y-6 lg:order-1">
            <div className="rounded-xl border border-[#002147]/15 bg-white p-5 shadow-[0_8px_30px_rgba(2,12,27,0.08)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#002147]">
                Alumni Registration
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
                Join the BGPSC Alumni Network
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Fill out your profile details to connect with classmates,
                teachers, and future opportunities.
              </p>
            </div>

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-5"
              variants={formContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.section
                variants={fieldItem}
                className="rounded-xl border border-[#002147]/15 bg-white p-5 shadow-[0_8px_30px_rgba(2,12,27,0.08)] sm:p-6"
              >
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#002147]">
                  Personal Information
                </h2>
                <div className="space-y-4">
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
                </div>
              </motion.section>

              <motion.section
                variants={fieldItem}
                className="rounded-xl border border-[#002147]/15 bg-white p-5 shadow-[0_8px_30px_rgba(2,12,27,0.08)] sm:p-6"
              >
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#002147]">
                  Graduation Details
                </h2>

                <div className="space-y-4">
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

                  <div>
                    <label className="mb-1.5 block pl-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                      Start Year *
                    </label>
                    <div className="relative">
                      <select
                        value={values.startYear}
                        onChange={(event) =>
                          handleChange("startYear")(event.target.value)
                        }
                        className="h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 pr-10 text-slate-900 outline-none transition hover:border-[#002147]/50 focus:border-[#002147] focus:ring-4 focus:ring-[#002147]/10"
                        required
                      >
                        <option value="">Select Start Year</option>
                        {generateYearOptions().map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                        <ChevronDownIcon />
                      </span>
                    </div>
                    {errors.startYear ? (
                      <p className="mt-1 pl-1 text-xs text-rose-600">
                        {errors.startYear}
                      </p>
                    ) : null}
                  </div>

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

                  <div>
                    <label className="mb-1.5 block pl-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                      End Year *
                    </label>
                    <div className="relative">
                      <select
                        value={values.endYear}
                        onChange={(event) =>
                          handleChange("endYear")(event.target.value)
                        }
                        className="h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 pr-10 text-slate-900 outline-none transition hover:border-[#002147]/50 focus:border-[#002147] focus:ring-4 focus:ring-[#002147]/10"
                        required
                      >
                        <option value="">Select End Year</option>
                        {generateYearOptions().map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                        <ChevronDownIcon />
                      </span>
                    </div>
                    {errors.endYear ? (
                      <p className="mt-1 pl-1 text-xs text-rose-600">
                        {errors.endYear}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-[#002147]/15 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#002147]">
                    Public Exams from This School
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handlePublicExamChoice("yes")}
                      className={`rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                        values.publicExamFromSchool === "yes"
                          ? "border-[#002147] bg-[#002147] text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-[#002147]/70"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePublicExamChoice("no")}
                      className={`rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                        values.publicExamFromSchool === "no"
                          ? "border-[#002147] bg-[#002147] text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-[#002147]/70"
                      }`}
                    >
                      No
                    </button>
                  </div>

                  {errors.publicExamFromSchool ? (
                    <p className="mt-2 text-xs text-rose-600">
                      {errors.publicExamFromSchool}
                    </p>
                  ) : null}

                  {values.publicExamFromSchool === "yes" ? (
                    <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
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
                          onToggle={(checked) =>
                            handleExamToggle("psc", checked)
                          }
                          onYearChange={handleChange("pscYear")}
                          error={errors.pscYear}
                        />
                        <ExamYearRow
                          label="JSC"
                          checked={values.jscTaken}
                          yearValue={values.jscYear}
                          onToggle={(checked) =>
                            handleExamToggle("jsc", checked)
                          }
                          onYearChange={handleChange("jscYear")}
                          error={errors.jscYear}
                        />
                        <ExamYearRow
                          label="SSC"
                          checked={values.sscTaken}
                          yearValue={values.sscYear}
                          onToggle={(checked) =>
                            handleExamToggle("ssc", checked)
                          }
                          onYearChange={handleChange("sscYear")}
                          error={errors.sscYear}
                        />
                        <ExamYearRow
                          label="HSC"
                          checked={values.hscTaken}
                          yearValue={values.hscYear}
                          onToggle={(checked) =>
                            handleExamToggle("hsc", checked)
                          }
                          onYearChange={handleChange("hscYear")}
                          error={errors.hscYear}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </motion.section>

              <motion.section
                variants={fieldItem}
                className="rounded-xl border border-[#002147]/15 bg-white p-5 shadow-[0_8px_30px_rgba(2,12,27,0.08)] sm:p-6"
              >
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#002147]">
                  Career and Photo
                </h2>

                <div className="space-y-4">
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

                  <PhotoDropzone
                    file={photoFile}
                    onFileSelect={handlePhotoSelect}
                    error={errors.photo}
                    uploadProgress={uploadProgress}
                  />
                </div>
              </motion.section>

              <motion.div variants={fieldItem}>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-[#002147] text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-lg shadow-[#002147]/25 transition hover:bg-[#001730] disabled:cursor-not-allowed disabled:bg-slate-400"
                  whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <SpinnerIcon />
                      Submitting...
                    </span>
                  ) : (
                    "Register Alumni"
                  )}
                </motion.button>
              </motion.div>
            </motion.form>

            <div className="rounded-xl border border-[#D4AF37]/40 bg-[#002147] px-4 py-3 text-sm text-white">
              <p className="inline-flex items-center gap-2">
                <TrustIcon />
                Your data is secure and used only for alumni communication.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {statusType !== "idle" ? (
                <motion.div
                  key={statusType}
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    statusType === "success"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-rose-300 bg-rose-50 text-rose-700"
                  }`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {statusMessage}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>

          <section className="order-1 lg:order-2">
            <div className="relative min-h-[260px] overflow-hidden rounded-xl border border-[#002147]/20 shadow-[0_12px_36px_rgba(2,12,27,0.2)] lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
              <NextImage
                src="/images/SideviewSchool.jpg"
                alt="Border Guard Public School and College"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001427]/85 via-[#001427]/55 to-[#001427]/25" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <motion.div
                  className="rounded-xl border border-white/20 bg-[#002147]/55 p-5 text-white backdrop-blur-sm"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.55 }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#D4AF37]">
                    Why Join
                  </p>
                  <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
                    Build your alumni identity with one trusted profile
                  </h2>
                  <p className="mt-2 text-sm text-slate-200">
                    Stay connected with your batch, school updates, mentorship
                    opportunities, and the larger BGPSC community.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>
        </motion.div>
      </div>
    </main>
  );
}

export default dynamic(() => Promise.resolve(RegisterPage), {
  ssr: false,
});

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

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
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
          className="h-4 w-4 rounded border-slate-300 text-[#002147] focus:ring-[#002147]/30"
        />
        {label}
      </label>

      {checked ? (
        <div className="mt-2">
          <div className="relative">
            <select
              value={yearValue}
              onChange={(event) => onYearChange(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-900 outline-none transition hover:border-[#002147]/50 focus:border-[#002147] focus:ring-4 focus:ring-[#002147]/10"
            >
              <option value="">Select {label} Year</option>
              {generateYearOptions().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              <ChevronDownIcon />
            </span>
          </div>
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
