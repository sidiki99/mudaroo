// src/SignupPage.jsx  (plain React, JavaScript)
// Install axios first:  npm install axios
"use client";

import api from "@/lib/axios";
import { useState } from "react";




// ====== CONFIG: change to your own API ======
// JSONPlaceholder accepts POST requests and echoes the data back, so it works for testing.
const SIGNUP_URL = "https://jsonplaceholder.typicode.com/users";

const inputClass =
  "w-full rounded-lg bg-brand-bg border border-brand-line px-3 py-2.5 text-brand-text " +
  "placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary " +
  "focus:border-transparent disabled:opacity-60";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // data returned by the API

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (form.password.length < 8) e.password = "Use at least 8 characters.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const { data } = await api.post("/signup", form);
      setResult(data); // data from the API
    } catch (err) {
      setErrors({
        form:
          err.response?.data?.message ||
          "We couldn’t create your account. Check your details and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md bg-brand-surface border border-brand-line rounded-2xl p-6 sm:p-8 shadow-xl">
        {result ? (
          <div role="status">
            <h1 className="text-2xl font-semibold">Account created</h1>
            <p className="mt-2 text-sm text-brand-muted">
              Welcome, {result.name}. Here is what the API returned:
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg bg-brand-bg border border-brand-line p-3 text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl font-semibold">Create your account</h1>
            <p className="mt-1 text-sm text-brand-muted">It takes less than a minute.</p>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Full name</label>
                <input id="name" name="name" type="text" autoComplete="name" placeholder="Jane Doe"
                       value={form.name} onChange={handleChange} className={inputClass} />
                {errors.name && <p className="mt-1 text-xs text-brand-danger">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <input id="email" name="email" type="email" autoComplete="email" placeholder="jane@example.com"
                       value={form.email} onChange={handleChange} className={inputClass} />
                {errors.email && <p className="mt-1 text-xs text-brand-danger">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                <input id="password" name="password" type="password" autoComplete="new-password"
                       placeholder="At least 8 characters"
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
                {submitting ? "Creating account…" : "Create account"}
              </button>

              <p className="text-center text-sm text-brand-muted">
                Already have an account?{" "}
                <a href="/login" className="text-brand-primary hover:underline">Log in</a>
              </p>
            </form>
          </>
        )}
      </div>
    </main>
  );
}