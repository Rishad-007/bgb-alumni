"use client";

import { FormEvent, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  session: string;
  currentUniversity: string;
};

type FormErrors = Partial<Record<keyof FormValues | "photo", string>>;

const MAX_PHOTO_SIZE_BYTES = 100 * 1024;
const MAX_PHOTO_DIMENSION = 400;

const getImageDimensions = (file: File): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

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
    session: "",
    currentUniversity: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusType, setStatusType] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const emailPattern = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  const validateForm = async (): Promise<FormErrors> => {
    const nextErrors: FormErrors = {};

    if (!values.name.trim()) nextErrors.name = "Name is required.";
    if (!values.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(values.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!values.phone.trim()) nextErrors.phone = "Phone is required.";
    if (!values.session.trim()) nextErrors.session = "Session is required.";
    if (!values.currentUniversity.trim()) {
      nextErrors.currentUniversity = "Current university/job is required.";
    }
    if (!photoFile) {
      nextErrors.photo = "Photo is required.";
    } else if (!photoFile.type.startsWith("image/")) {
      nextErrors.photo = "Please upload an image file.";
    } else if (photoFile.size > MAX_PHOTO_SIZE_BYTES) {
      nextErrors.photo = "Photo must be 100KB or smaller.";
    } else {
      try {
        const { width, height } = await getImageDimensions(photoFile);
        if (width > MAX_PHOTO_DIMENSION || height > MAX_PHOTO_DIMENSION) {
          nextErrors.photo = "Photo must be within 400x400 pixels.";
        }
      } catch {
        nextErrors.photo = "Unable to validate photo. Please choose another image.";
      }
    }

    return nextErrors;
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
      const safeName = photoFile.name.replace(/\s+/g, "-").toLowerCase();
      const storagePath = `alumni/${Date.now()}-${safeName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("alumni-photos")
        .upload(storagePath, photoFile, { upsert: false });

      if (uploadError) {
        setStatusType("error");
        setStatusMessage(`Photo upload failed: ${uploadError.message}`);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("alumni-photos").getPublicUrl(uploadData.path);

      const { error: insertError } = await supabase.from("alumni").insert([
        {
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          phone: values.phone.trim(),
          session: values.session.trim(),
          current_university: values.currentUniversity.trim(),
          photo_url: publicUrl || uploadData.path,
        },
      ]);

      if (insertError) {
        // Remove uploaded file to avoid orphaned objects when DB insert fails.
        await supabase.storage.from("alumni-photos").remove([uploadData.path]);
        setStatusType("error");
        setStatusMessage(`Submission failed: ${insertError.message}`);
        return;
      }

      setStatusType("success");
      setStatusMessage("Registration submitted successfully.");
      setValues({
        name: "",
        email: "",
        phone: "",
        session: "",
        currentUniversity: "",
      });
      setPhotoFile(null);
    } catch (error) {
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

  const handleChange =
    (field: keyof FormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-cyan-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
        <div className="bg-slate-900 px-6 py-8 text-white sm:px-10">
          <h1 className="text-3xl font-bold tracking-tight">
            Alumni Registration
          </h1>
          <p className="mt-2 text-sm text-slate-200 sm:text-base">
            Complete the form to join the school alumni directory.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-8 sm:px-10">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={values.name}
                onChange={handleChange("name")}
                placeholder="Full name"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                required
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Email <span className="text-rose-600">*</span>
              </label>
              <input
                type="email"
                value={values.email}
                onChange={handleChange("email")}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                required
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Phone <span className="text-rose-600">*</span>
              </label>
              <input
                type="tel"
                value={values.phone}
                onChange={handleChange("phone")}
                placeholder="01XXXXXXXXX"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                required
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Session (last class or last public exam from this school){" "}
                <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={values.session}
                onChange={handleChange("session")}
                placeholder="e.g. SSC 2018 / Class 10 Batch 2019"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                required
              />
              {errors.session && (
                <p className="mt-1 text-xs text-rose-600">{errors.session}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Current University/Job <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={values.currentUniversity}
                onChange={handleChange("currentUniversity")}
                placeholder="e.g. University of Dhaka / Software Engineer at ABC"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                required
              />
              {errors.currentUniversity && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.currentUniversity}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Photo Upload <span className="text-rose-600">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0] ?? null;
                  if (!file) {
                    setPhotoFile(null);
                    setErrors((prev) => ({ ...prev, photo: "Photo is required." }));
                    return;
                  }

                  if (!file.type.startsWith("image/")) {
                    setPhotoFile(null);
                    setErrors((prev) => ({
                      ...prev,
                      photo: "Please upload an image file.",
                    }));
                    event.currentTarget.value = "";
                    return;
                  }

                  if (file.size > MAX_PHOTO_SIZE_BYTES) {
                    setPhotoFile(null);
                    setErrors((prev) => ({
                      ...prev,
                      photo: "Photo must be 100KB or smaller.",
                    }));
                    event.currentTarget.value = "";
                    return;
                  }

                  try {
                    const { width, height } = await getImageDimensions(file);
                    if (width > MAX_PHOTO_DIMENSION || height > MAX_PHOTO_DIMENSION) {
                      setPhotoFile(null);
                      setErrors((prev) => ({
                        ...prev,
                        photo: "Photo must be within 400x400 pixels.",
                      }));
                      event.currentTarget.value = "";
                      return;
                    }
                  } catch {
                    setPhotoFile(null);
                    setErrors((prev) => ({
                      ...prev,
                      photo: "Unable to validate photo. Please choose another image.",
                    }));
                    event.currentTarget.value = "";
                    return;
                  }

                  setPhotoFile(file);
                  setErrors((prev) => ({ ...prev, photo: undefined }));
                }}
                className="w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                Upload JPG/PNG/WebP only, max 400x400 pixels and 100KB.
              </p>
              {errors.photo && (
                <p className="mt-1 text-xs text-rose-600">{errors.photo}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit Registration"}
          </button>

          {statusType !== "idle" && (
            <p
              className={`rounded-lg px-4 py-3 text-sm ${
                statusType === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {statusMessage}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
