"use client";

// app/login/page.jsx  (Next.js App Router, JavaScript)

import api from "@/lib/axios";
import { useRouter } from "next/navigation"; // App Router uses next/navigation, not next/router
import { useState } from "react";

const inputClass =
  "w-full rounded-lg bg-brand-bg border border-brand-line px-3 py-2.5 text-brand-text " +
  "placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary " +
  "focus:border-transparent disabled:opacity-60";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.password) e.password = "Enter your password."; // don't enforce length on login
    return e;
  };

  
const handleSubmit = async (ev) => {
  ev.preventDefault();

  const found = validate();
  setErrors(found);

  if (Object.keys(found).length) return;

  setSubmitting(true);

  try {
    const { data } = await api.post("/login", form);

    if (data.success) {
      // Check the logged-in user's role
      if (data.user?.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } else {
      setErrors({
        form: data.message || "Login failed. Check your details.",
      });
    }
  } catch (err) {
    setErrors({
      form:
        err.response?.data?.message ||
        "We couldn’t log you in. Check your details and try again.",
    });
  } finally {
    setSubmitting(false);
  }
};


  return (
    <main className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md bg-brand-surface border border-brand-line rounded-2xl p-6 sm:p-8 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-semibold">Log in to your account</h1>
        <p className="mt-1 text-sm text-brand-muted">Welcome back.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" placeholder="jane@example.com"
                   value={form.email} onChange={handleChange} className={inputClass} />
            {errors.email && <p className="mt-1 text-xs text-brand-danger">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password"
                   placeholder="Your password"
                   value={form.password} onChange={handleChange} className={inputClass} />
            {errors.password && <p className="mt-1 text-xs text-brand-danger">{errors.password}</p>}
          </div>

          {errors.form && (
            <p role="alert" className="text-sm text-brand-danger">{errors.form}</p>
          )}

          <button type="submit" disabled={submitting}
                  className="w-full rounded-lg bg-brand-primary hover:bg-brand-primaryHover transition-colors
                             px-4 py-3 font-medium disabled:opacity-60 focus:outline-none focus:ring-2
                             focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-primary">
            {submitting ? "Logging in…" : "Log in"}
          </button>

          <p className="text-center text-sm text-brand-muted">
            Don’t have an account?{" "}
            <a href="/signup" className="text-brand-primary hover:underline">Sign up</a>
          </p>
        </form>
      </div>
    </main>
  );
}