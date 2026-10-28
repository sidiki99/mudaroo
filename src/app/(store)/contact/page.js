"use client";

import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import PageHeader from "../components/common/PageHeader";

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-[11px] text-[13px] font-light text-neutral-800 outline-none transition placeholder:text-neutral-500 focus-visible:border-[#ff6a4d] focus-visible:ring-2 focus-visible:ring-[#ff6a4d]/20";

const headingClass =
  "mb-2 text-[22px] font-light uppercase tracking-wide text-neutral-800";

const textClass = "mb-1 text-[13px] font-light leading-6 text-neutral-600";
 function ContactForm() {
  const formRef = useRef(null);
  // "idle" | "sending" | "success" | "error"
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");

    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        formRef.current,
        { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY }
      );
      setStatus("success");
      formRef.current.reset();
    } catch (err) {
      console.error("EmailJS error:", err);
      setStatus("error");
    }
  };

  return (
    <section className="bg-white px-6 py-12 font-light text-neutral-700">
      <div className="mx-auto grid max-w-[1100px] gap-12 md:grid-cols-2">
        {/* Left: contact info */}
        <div>
          <h2 className={headingClass}>Contact info</h2>
          <p className={textClass}>
            Tortor dignissim convallis aenean et tortor at risus viverra
            adipiscing.
          </p>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className={headingClass}>Office</h3>
              <p className={textClass}>
                730 Glenstone Ave 65802, Springfield, US
              </p>
              <p className={textClass}>+123 222 333 44</p>
              <p className={textClass}>
                <a
                  href="mailto:info@yourinfo.com"
                  className="transition hover:text-[#ff6a4d]"
                >
                  info@yourinfo.com
                </a>
              </p>
            </div>

            <div>
              <h3 className={headingClass}>Management</h3>
              <p className={textClass}>
                730 Glenstone Ave 65802, Springfield, US
              </p>
              <p className={textClass}>+123 666 777 88</p>
              <p className={textClass}>
                <a
                  href="mailto:info@yourinfo.com"
                  className="transition hover:text-[#ff6a4d]"
                >
                  info@yourinfo.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div>
          <h2 className={headingClass}>Any questions?</h2>
          <p className={textClass}>
            Use the form below to get in touch with us.
          </p>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="mt-5 flex flex-col gap-3.5"
          >
            <div className="grid gap-3.5 sm:grid-cols-2">
              <input
                type="text"
                name="from_name"
                placeholder="Your full name *"
                required
                className={inputClass}
              />
              <input
                type="email"
                name="from_email"
                placeholder="Write your email here *"
                required
                className={inputClass}
              />
            </div>

            <input
              type="tel"
              name="phone"
              placeholder="Phone number"
              className={inputClass}
            />

            <input
              type="text"
              name="subject"
              placeholder="Write your subject here"
              className={inputClass}
            />

            <textarea
              name="message"
              placeholder="Write your message here *"
              required
              rows={3}
              className={`${inputClass} min-h-[88px] resize-y`}
            />

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={status === "sending"}
                className="rounded-full bg-[#ff6a4d] px-6 py-2.5 text-[10px] uppercase tracking-widest text-white transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? "Sending..." : "Submit"}
              </button>

              <p
                className="text-[13px] text-neutral-600"
                role="status"
                aria-live="polite"
              >
                {status === "success" && "Message sent. We will reply soon."}
                {status === "error" &&
                  "Message not sent. Please try again in a moment."}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default function ContactPage(){
  return(
      <>
  <PageHeader
          title="Contact"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
          ]}
        />
        <ContactForm />
  </>
  )
}