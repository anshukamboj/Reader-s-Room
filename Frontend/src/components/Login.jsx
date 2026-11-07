import { api } from "../api";
import { useLibrary } from "../context/LibraryContext";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loadAll } = useLibrary();
  // ...rest stays the same
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrors((er) => ({ ...er, [name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const er = {};
    if (!form.email.trim()) er.email = "Please enter your email.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = "Enter a valid email address.";
    if (!form.password) er.password = "Please enter your password.";
    else if (form.password.length < 6) er.password = "Password must be at least 6 characters.";
    return er;
  };

  const submit = async (e) => {
  e.preventDefault();
  const er = validate();
  setErrors(er);
  if (Object.keys(er).length) return;

  setLoading(true);

  try {
    const data = await api("/auth/login", {
      method: "POST",
      body: { email: form.email, password: form.password },
    });
    localStorage.setItem("rr_token", data.token);
    localStorage.setItem("rr_user", JSON.stringify(data.user));
    await loadAll();
    navigate(data.user.role === "librarian" ? "/librarian" : "/dashboard/overview");
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
          <h1 className="font-serif text-4xl">Welcome back</h1>
          <p className="mt-2 text-base text-[#a9b9ae]">Log in to borrow, reserve and save your favourite books.</p>

          {serverError && (
            <div role="alert" className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {serverError}
            </div>
          )}

          <form onSubmit={submit} noValidate className="mt-6 space-y-5">
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
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm text-[#a9b9ae]">Password</label>
                <Link to="/forgot-password" className="text-sm text-[#38D982] hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6f8277]" />
                <input
                  id="password" name="password" type={showPw ? "text" : "password"} autoComplete="current-password"
                  value={form.password} onChange={change} placeholder="Enter your password"
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
            </div>

            {/* remember me */}
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#a9b9ae]">
              <input
                type="checkbox" name="remember" checked={form.remember} onChange={change}
                className="h-4 w-4 accent-[#38D982]"
              />
              Remember me
            </label>

            <button
              type="submit" disabled={loading}
              className="h-12 w-full rounded-lg bg-[#38D982] text-base font-semibold text-[#0D1512] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-sm text-[#6f8277]">
            <span className="h-px flex-1 bg-[#2a3d33]" />
            or
            <span className="h-px flex-1 bg-[#2a3d33]" />
          </div>

          <button
            type="button"
            onClick={() => alert("Google login is not connected yet (demo)")}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#2a3d33] text-base hover:bg-white/5"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12S6.7 21.6 12 21.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-[#a9b9ae]">
            New to Reader's Room?{" "}
            <Link to="/signup" className="font-semibold text-[#38D982] hover:underline">Create an account</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
