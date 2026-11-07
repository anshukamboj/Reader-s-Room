import { api } from "../api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "", terms: false,
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrors((er) => ({ ...er, [name]: "" }));
    setServerError("");
  };

  // password strength: 0-4
  const strength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["Too weak", "Weak", "Okay", "Good", "Strong"][strength];
  const strengthColor = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-lime-500", "bg-[#38D982]"][strength];

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = "Please enter your name.";
    if (!form.email.trim()) er.email = "Please enter your email.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = "Enter a valid email address.";
    if (!form.password) er.password = "Please create a password.";
    else if (form.password.length < 8) er.password = "Password must be at least 8 characters.";
    if (!form.confirm) er.confirm = "Please confirm your password.";
    else if (form.confirm !== form.password) er.confirm = "Passwords do not match.";
    if (!form.terms) er.terms = "You need to accept the terms to continue.";
    return er;
  };

  const submit = async (e) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) return;

    setLoading(true);
    try {
  await api("/auth/signup", {
    method: "POST",
    body: { name: form.name, email: form.email, password: form.password },
  });
  navigate("/login");
} catch (err) {
  setServerError(err.message || "Something went wrong. Please try again.");
} finally {
  setLoading(false);
}
  };
  const input =
    "w-full h-12 rounded-lg border bg-[#0D1512] pl-11 pr-4 text-base text-[#eef3ee] placeholder:text-[#6f8277] outline-none transition focus:border-[#3b8259] focus:ring-2 focus:ring-[#3b8259]/30";

  return (
    <div className="min-h-screen bg-[#0D1512] text-[#eef3ee] flex flex-col">
      {/* top bar with logo */}
      <header className="px-4 py-6 sm:px-8">
        <Link to="/" className="inline-flex items-center gap-3 font-serif text-3xl font-semibold">
          <svg viewBox="0 0 32 32" fill="none" className="h-10 w-10" aria-hidden="true">
            <rect x="3" y="6" width="26" height="22" rx="3" fill="#2f6b4a" />
            <path
              d="M16 9v17M6 10c5 0 8 1.5 10 4 2-2.5 5-4 10-4v14c-5 0-8 1.5-10 4-2-2.5-5-4-10-4z"
              stroke="#eaf5ec" strokeWidth="1.8" strokeLinejoin="round"
            />
          </svg>
          Reader's Room
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-2xl border border-[#2a3d33] bg-[#17241d] p-8 shadow-2xl">
          <h1 className="font-serif text-4xl">Create your account</h1>
          <p className="mt-2 text-base text-[#a9b9ae]">Join to borrow, reserve and save books you love.</p>

          {serverError && (
            <div role="alert" className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {serverError}
            </div>
          )}

          <form onSubmit={submit} noValidate className="mt-6 space-y-5">
            {/* name */}
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm text-[#a9b9ae]">Full name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6f8277]" />
                <input
                  id="name" name="name" type="text" autoComplete="name"
                  value={form.name} onChange={change} placeholder="Your name"
                  className={`${input} ${errors.name ? "border-red-500/70" : "border-[#2a3d33]"}`}
                />
              </div>
              {errors.name && <p className="mt-1.5 text-sm text-red-400">{errors.name}</p>}
            </div>

            {/* email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm text-[#a9b9ae]">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6f8277]" />
                <input
                  id="email" name="email" type="email" autoComplete="email"
                  value={form.email} onChange={change} placeholder="you@example.com"
                  className={`${input} ${errors.email ? "border-red-500/70" : "border-[#2a3d33]"}`}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>}
            </div>

            {/* password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm text-[#a9b9ae]">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6f8277]" />
                <input
                  id="password" name="password" type={showPw ? "text" : "password"} autoComplete="new-password"
                  value={form.password} onChange={change} placeholder="At least 8 characters"
                  className={`${input} pr-12 ${errors.password ? "border-red-500/70" : "border-[#2a3d33]"}`}
                />
                <button
                  type="button" onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6f8277] hover:text-[#eef3ee]"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-sm text-red-400">{errors.password}</p>}

              {/* strength meter */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((n) => (
                      <span
                        key={n}
                        className={`h-1.5 flex-1 rounded-full ${n <= strength ? strengthColor : "bg-[#2a3d33]"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-[#a9b9ae]">Strength: {strengthLabel}</p>
                </div>
              )}
            </div>

            {/* confirm password */}
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm text-[#a9b9ae]">Confirm password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6f8277]" />
                <input
                  id="confirm" name="confirm" type={showConfirm ? "text" : "password"} autoComplete="new-password"
                  value={form.confirm} onChange={change} placeholder="Re-enter your password"
                  className={`${input} pr-12 ${errors.confirm ? "border-red-500/70" : "border-[#2a3d33]"}`}
                />
                <button
                  type="button" onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6f8277] hover:text-[#eef3ee]"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirm && <p className="mt-1.5 text-sm text-red-400">{errors.confirm}</p>}
            </div>

            {/* terms */}
            <div>
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-[#a9b9ae]">
                <input
                  type="checkbox" name="terms" checked={form.terms} onChange={change}
                  className="mt-0.5 h-4 w-4 accent-[#38D982]"
                />
                <span>
                  I agree to the{" "}
                  <a href="#terms" className="text-[#38D982] hover:underline">Terms</a> and{" "}
                  <a href="#privacy" className="text-[#38D982] hover:underline">Privacy Policy</a>.
                </span>
              </label>
              {errors.terms && <p className="mt-1.5 text-sm text-red-400">{errors.terms}</p>}
            </div>

            <button
              type="submit" disabled={loading}
              className="h-12 w-full rounded-lg bg-[#38D982] text-base font-semibold text-[#0D1512] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-sm text-[#6f8277]">
            <span className="h-px flex-1 bg-[#2a3d33]" />
            or
            <span className="h-px flex-1 bg-[#2a3d33]" />
          </div>

          <button
            type="button"
            onClick={() => alert("Google signup is not connected yet (demo)")}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#2a3d33] text-base hover:bg-white/5"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12S6.7 21.6 12 21.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
            </svg>
            Sign up with Google
          </button>

          <p className="mt-6 text-center text-sm text-[#a9b9ae]">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[#38D982] hover:underline">Log in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
