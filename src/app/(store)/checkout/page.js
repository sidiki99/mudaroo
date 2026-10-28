"use client";

import api from "@/lib/axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const CART_KEY = "mudaroo-cart";
const CURRENCY = "PKR";
const LOGIN_URL = "/login";

const ENDPOINTS = {
  me: "/me",
  updateMe: "/me",
  createOrder: "/orders", // change to "/api/orders" if your axios baseURL has no /api
};

const COUNTRIES = [
  { code: "PK", name: "Pakistan" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
];

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on delivery" },
  { id: "bank_transfer", label: "Direct bank transfer" },
];

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  company: "",
  country: "PK",
  street1: "",
  street2: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  email: "",
};

const inputClass =
  "w-full rounded border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 " +
  "placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff6a45] " +
  "focus:border-transparent read-only:bg-gray-50 read-only:text-gray-500";

const btnClass =
  "rounded-full bg-[#ff6a45] px-7 py-3 text-xs font-medium uppercase " +
  "tracking-wider text-white transition-colors hover:bg-[#f0562f] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

function money(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function readCart() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(CART_KEY) || "[]"
    );

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function userToForm(user = {}) {
  const nested =
    user.billing && typeof user.billing === "object"
      ? user.billing
      : user.address && typeof user.address === "object"
        ? user.address
        : {};

  const nameParts = String(
    user.name || user.fullName || ""
  ).trim().split(/\s+/).filter(Boolean);

  return {
    firstName:
      user.firstName || nameParts[0] || "",
    lastName:
      user.lastName || nameParts.slice(1).join(" "),
    company: user.company || "",
    country: nested.country || user.country || "PK",
    street1:
      nested.street1 || nested.street || user.street || "",
    street2: nested.street2 || "",
    city: nested.city || user.city || "",
    state: nested.state || user.state || "",
    zip:
      nested.zip || nested.postalCode ||
      user.postalCode || "",
    phone: user.phone || "",
    email: user.email || "",
  };
}

function formToUserPayload(form) {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    company: form.company.trim(),
    phone: form.phone.trim(),
    billing: {
      country: form.country,
      street1: form.street1.trim(),
      street2: form.street2.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zip: form.zip.trim(),
    },
  };
}

// Maps the checkout form to the `shippingAddress` shape expected by POST /api/orders
function formToShippingAddress(form) {
  const countryName =
    COUNTRIES.find((c) => c.code === form.country)?.name ||
    "Pakistan";

  return {
    fullName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
    phone: form.phone.trim(),
    addressLine1: form.street1.trim(),
    addressLine2: form.street2.trim(),
    city: form.city.trim(),
    province: form.state.trim(),
    postalCode: form.zip.trim(),
    country: countryName, // the route stores the country name, not the code
  };
}

function detailsKey(form) {
  return JSON.stringify(formToUserPayload(form));
}

function Field({
  label,
  name,
  required,
  error,
  children,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-xs text-gray-700"
      >
        {label}
        {required && " *"}
      </label>

      {children}

      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function Checkout() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [savedKey, setSavedKey] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState("cod");
  const [saveToAccount, setSaveToAccount] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);

  const goToLogin = useCallback(() => {
    router.replace(
      `${LOGIN_URL}?redirect=${encodeURIComponent("/checkout")}`
    );
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const loadCheckout = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const savedCart = readCart();

        if (!cancelled) {
          setCart(savedCart);
        }

     
        const response = await api.get(ENDPOINTS.me, {
          timeout: 10000,
        });

        const data = response.data;

        // Support common API response formats.
        const user =
          data?.user ||
          data?.data?.user ||
          data?.data ||
          data;

        if (!user || !user.email) {
          throw new Error(
            "The current-user API did not return a user email. Check its response format."
          );
        }

        if (cancelled) return;

        const initialForm = userToForm(user);

        setForm(initialForm);
        setSavedKey(detailsKey(initialForm));
      } catch (error) {
        if (cancelled) return;

        console.error("Checkout user request failed:", {
          message: error.message,
          status: error.response?.status,
          response: error.response?.data,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
        });

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          goToLogin();
          return;
        }

        setLoadError(
          error.code === "ECONNABORTED"
            ? "Your account request timed out. Check your backend server and API URL."
            : error.response?.data?.message ||
                error.message ||
                "Could not load your account. Please try again."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCheckout();

    return () => {
      cancelled = true;
    };
  }, [goToLogin]);

  const onChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      form: "",
    }));
  };

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = Number(item.price);
      const quantity = Number(item.quantity);

      if (
        !Number.isFinite(price) ||
        !Number.isFinite(quantity) ||
        price < 0 ||
        quantity <= 0
      ) {
        return sum;
      }

      return sum + price * quantity;
    }, 0);
  }, [cart]);

  // Display only. The server recalculates the real total from the database.
  const total = subtotal;

  const validate = () => {
    const nextErrors = {};

    const requiredFields = {
      firstName: "First name",
      lastName: "Last name",
      street1: "Street address",
      city: "City",
      state: "State or province",
      zip: "Postal code",
      phone: "Phone number",
    };

    for (const [key, label] of Object.entries(requiredFields)) {
      if (!String(form[key] || "").trim()) {
        nextErrors[key] = `${label} is required.`;
      }
    }

    if (
      form.phone &&
      !/^[+\d][\d\s()-]{6,}$/.test(form.phone.trim())
    ) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    if (!form.country) {
      nextErrors.country = "Select your country.";
    }

    if (!form.email) {
      nextErrors.form = "Your account email is missing.";
    }

    if (!cart.length) {
      nextErrors.form = "Your cart is empty.";
    }

    // The route requires a product ID, a variant ID and a quantity of 1-100.
    for (const item of cart) {
      if (
        !(item.productId || item._id || item.id) ||
        !item.variantId ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1 ||
        Number(item.quantity) > 100
      ) {
        nextErrors.form =
          "A cart item has invalid product, variant or quantity information. Please review your cart.";
        break;
      }
    }

    return nextErrors;
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    if (submitting) return;

    const validationErrors = validate();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) return;

    setSubmitting(true);

    try {
      // Save account details if requested. A failure is shown in the
      // console but does not automatically prevent order submission.
      if (
        saveToAccount &&
        detailsKey(form) !== savedKey
      ) {
        try {
          await api.put(
            ENDPOINTS.updateMe,
            formToUserPayload(form),
            { timeout: 10000 }
          );

          setSavedKey(detailsKey(form));
        } catch (error) {
          console.error("Could not save billing details:", error);
        }
      }

      // Matches POST /api/orders: the server verifies product IDs,
      // variant IDs, stock, prices and totals using the database.
      // Note: the route does not read a payment method yet. To store it,
      // add `paymentMethod: payment` here and handle it in the route/model.
      const payload = {
        items: cart.map((item) => ({
          product: item.productId || item._id || item.id,
          variantId: item.variantId,
          quantity: Number(item.quantity),
        })),
        shippingAddress: formToShippingAddress(form),
        notes: notes.trim(),
      };

      const response = await api.post(
        ENDPOINTS.createOrder,
        payload,
        { timeout: 20000 }
      );

      const data = response.data;

      if (!data?.success || !data?.order) {
        throw new Error(
          data?.message ||
            "The server did not confirm that the order was created."
        );
      }

      const createdOrder = data.order;

      // Clear cart only after the server confirms success.
      localStorage.removeItem(CART_KEY);
      window.dispatchEvent(new Event("cart-updated"));

      setCart([]);
      setOrder(createdOrder);
    } catch (error) {
      console.error("Checkout order request failed:", {
        message: error.message,
        status: error.response?.status,
        response: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        goToLogin();
        return;
      }

      setErrors((previous) => ({
        ...previous,
        form:
          error.response?.data?.message ||
          error.message ||
          "Could not place your order. Please try again.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 text-sm text-gray-500">
        Loading checkout…
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        <p role="alert" className="text-sm text-red-600">
          {loadError}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className={`${btnClass} mt-5`}
        >
          Try again
        </button>
      </main>
    );
  }

  if (order) {
    const reference =
      order.orderNumber || order._id || order.id;

    return (
      <main
        className="mx-auto max-w-6xl px-4 py-20 text-center text-gray-800"
        role="status"
      >
        <h1 className="text-xl uppercase tracking-wide">
          Thank you! Your order has been placed.
        </h1>

        {reference && (
          <p className="mt-3 text-sm text-gray-600">
            Order number:{" "}
            <span className="text-[#ff6a45]">
              {String(reference)}
            </span>
          </p>
        )}

        <Link href="/" className={`${btnClass} mt-8 inline-block`}>
          Continue shopping
        </Link>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-20 text-center text-gray-800">
        <h1 className="text-xl uppercase tracking-wide">
          Your cart is empty
        </h1>

        <Link href="/" className={`${btnClass} mt-6 inline-block`}>
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-gray-800 sm:px-6 sm:py-14">
      <form onSubmit={placeOrder} noValidate>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <section aria-labelledby="billing-heading">
            <h2
              id="billing-heading"
              className="text-lg uppercase tracking-wide"
            >
              Billing details
            </h2>

            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="First name"
                  name="firstName"
                  required
                  error={errors.firstName}
                >
                  <input
                    id="firstName"
                    name="firstName"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={onChange}
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Last name"
                  name="lastName"
                  required
                  error={errors.lastName}
                >
                  <input
                    id="lastName"
                    name="lastName"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={onChange}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Company (optional)" name="company">
                <input
                  id="company"
                  name="company"
                  autoComplete="organization"
                  value={form.company}
                  onChange={onChange}
                  className={inputClass}
                />
              </Field>

              <Field
                label="Country / Region"
                name="country"
                required
                error={errors.country}
              >
                <select
                  id="country"
                  name="country"
                  autoComplete="country"
                  value={form.country}
                  onChange={onChange}
                  className={inputClass}
                >
                  {COUNTRIES.map((country) => (
                    <option
                      key={country.code}
                      value={country.code}
                    >
                      {country.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Street address"
                name="street1"
                required
                error={errors.street1}
              >
                <input
                  id="street1"
                  name="street1"
                  autoComplete="address-line1"
                  placeholder="House number and street name"
                  value={form.street1}
                  onChange={onChange}
                  className={inputClass}
                />
              </Field>

              <Field
                label="Apartment / Suite (optional)"
                name="street2"
              >
                <input
                  id="street2"
                  name="street2"
                  autoComplete="address-line2"
                  value={form.street2}
                  onChange={onChange}
                  className={inputClass}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="City"
                  name="city"
                  required
                  error={errors.city}
                >
                  <input
                    id="city"
                    name="city"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={onChange}
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="State / Province"
                  name="state"
                  required
                  error={errors.state}
                >
                  <input
                    id="state"
                    name="state"
                    autoComplete="address-level1"
                    value={form.state}
                    onChange={onChange}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Postal code"
                  name="zip"
                  required
                  error={errors.zip}
                >
                  <input
                    id="zip"
                    name="zip"
                    autoComplete="postal-code"
                    value={form.zip}
                    onChange={onChange}
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Phone"
                  name="phone"
                  required
                  error={errors.phone}
                >
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={onChange}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field
                label="Email address"
                name="email"
                required
              >
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  readOnly
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          <section aria-labelledby="additional-heading">
            <h2
              id="additional-heading"
              className="text-lg uppercase tracking-wide"
            >
              Additional information
            </h2>

            <div className="mt-5">
              <Field
                label="Order notes (optional)"
                name="notes"
              >
                <textarea
                  id="notes"
                  rows={5}
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  placeholder="Delivery instructions or other notes"
                  className={`${inputClass} resize-y`}
                />
              </Field>
            </div>
          </section>
        </div>

        <section className="mt-12" aria-labelledby="totals-heading">
          <h2
            id="totals-heading"
            className="text-lg uppercase tracking-wide"
          >
            Cart totals
          </h2>

          <ul className="mt-4 divide-y divide-gray-100 border-t border-gray-200 text-sm">
            {cart.map((item, index) => (
              <li
                key={
                  item.variantId ||
                  item.sku ||
                  item.productId ||
                  item._id ||
                  index
                }
                className="flex items-center justify-between gap-4 py-3"
              >
                <span className="min-w-0">
                  {item.title || item.name || "Product"}
                  {(item.color || item.size) && (
                    <span className="text-gray-500">
                      {" "}
                      ({[item.color, item.size]
                        .filter(Boolean)
                        .join(" / ")})
                    </span>
                  )}
                  <span className="text-gray-500">
                    {" "}× {item.quantity}
                  </span>
                </span>

                <span className="shrink-0 text-[#ff6a45]">
                  {money(
                    Number(item.price || 0) *
                      Number(item.quantity || 0)
                  )}
                </span>
              </li>
            ))}
          </ul>

          <dl className="border-t border-gray-200 text-sm uppercase tracking-wide">
            <div className="flex justify-between border-b border-gray-200 py-3 sm:justify-start">
              <dt className="w-40 sm:w-48">Subtotal</dt>
              <dd className="text-[#ff6a45]">
                {money(subtotal)}
              </dd>
            </div>

            <div className="flex justify-between border-b border-gray-200 py-3 sm:justify-start">
              <dt className="w-40 sm:w-48">Total</dt>
              <dd className="text-[#ff6a45]">
                {money(total)}
              </dd>
            </div>
          </dl>

          <fieldset className="mt-5 space-y-3">
            <legend className="mb-3 text-sm font-medium">
              Payment method
            </legend>

            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.id}
                className="flex cursor-pointer items-center gap-2.5 text-sm"
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={payment === method.id}
                  onChange={() => setPayment(method.id)}
                  className="h-4 w-4 accent-[#ff6a45]"
                />
                {method.label}
              </label>
            ))}
          </fieldset>

          <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={saveToAccount}
              onChange={(event) =>
                setSaveToAccount(event.target.checked)
              }
              className="mt-0.5 h-4 w-4 accent-[#ff6a45]"
            />
            Save these billing details to my account
          </label>

          {errors.form && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {errors.form}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`${btnClass} mt-6 w-full sm:w-auto`}
          >
            {submitting ? "Placing order..." : "Place an order"}
          </button>
        </section>
      </form>
    </main>
  );
}