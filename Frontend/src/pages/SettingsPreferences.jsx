import { useRef, useState } from "react";
import { AlertTriangle, Pencil, Sparkles } from "lucide-react";

const tabs = ["Profile Info", "Security & Password", "Notifications", "Library Preferences"];

const inputCls =
  "h-10 w-full rounded-lg border border-[#2a3d33] bg-[#16231c] px-3 text-[14px] text-white placeholder-[#7f948a] outline-none focus:border-[#3b8259] disabled:opacity-70";

/* ------------------------------ Helpers ----------------------------- */

function Card({ title, action, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-[#26382f] bg-[#131f19] p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[19px] font-medium text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Tag({ children }) {
  return (
    <span className="rounded-md bg-[#1f6b3f] px-2 py-0.5 text-[11px] text-[#b8f0cf]">{children}</span>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[14px] text-[#e3ece6]">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="grid h-5 w-5 place-items-center rounded border border-[#4b6455] bg-[#16231c] peer-checked:border-[#38D982] peer-checked:bg-[#38D982]">
        {checked && (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="#0D1512" strokeWidth="2.5">
            <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </label>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`flex h-6 w-11 items-center rounded-full px-0.5 transition ${on ? "bg-[#38D982]" : "bg-[#2a3d33]"}`}
    >
      <span className={`h-5 w-5 rounded-full bg-[#0D1512] transition ${on ? "ml-auto" : ""}`} />
    </button>
  );
}

/* ---------------------------- Profile card -------------------------- */

function ProfileCard() {
  const fileRef = useRef(null);
  const [avatar, setAvatar] = useState("https://i.pravatar.cc/200?img=12");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "Marcus Librarian",
    email: "marcus@library.org",
    phone: "+1 (93) 123-7890",
    preferred: "Marcus",
  });

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setSaved(false);
  };

  const pickAvatar = (e) => {
    const file = e.target.files?.[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  const save = () => {
    setEditing(false);
    setSaved(true);
  };

  const Field = ({ label, k, type = "text", tag }) => (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-[14px] text-[#e3ece6]">{label}</label>
        {tag && <Tag>Edit Profile</Tag>}
      </div>
      <input type={type} value={form[k]} onChange={set(k)} disabled={!editing} className={inputCls} />
    </div>
  );

  return (
    <Card title="Profile Information" action={<Tag>Edit Profile</Tag>}>
      <div className="flex flex-col items-center">
        <div className="relative">
          <img src={avatar} alt="Avatar" className="h-[68px] w-[68px] rounded-full object-cover" />
          <button
            onClick={() => fileRef.current?.click()}
            aria-label="Change avatar"
            className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full border border-[#2a3d33] bg-[#1d2f26] text-[#cfdcd3] hover:text-white"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={pickAvatar} className="hidden" />
        </div>
        <button onClick={() => fileRef.current?.click()} className="mt-2 text-[14px] text-[#e3ece6] hover:underline">
          Upload avatar
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <Field label="Full Name" k="name" />
        <Field label="Email" k="email" type="email" />
        <Field label="Phone" k="phone" />
        <Field label="Preferred Name" k="preferred" tag />
      </div>

      {saved && <p className="mt-3 text-[13px] text-[#38D982]">Profile saved.</p>}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => setEditing(true)}
          className="h-10 rounded-lg border border-[#2a3d33] bg-[#16231c] text-[14px] text-white hover:bg-[#1d2f26]"
        >
          Edit Profile
        </button>
        <button
          onClick={save}
          className="h-10 rounded-lg bg-[#38D982] text-[14px] font-semibold text-[#0D1512] hover:brightness-110"
        >
          Save Changes
        </button>
      </div>
    </Card>
  );
}

/* ---------------------------- Security card ------------------------- */

function SecurityCard() {
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => {
    setPw((p) => ({ ...p, [k]: e.target.value }));
    setMsg(null);
  };

  const update = () => {
    if (!pw.current) return setMsg({ ok: false, text: "Enter your current password." });
    if (pw.next.length < 8) return setMsg({ ok: false, text: "New password must be at least 8 characters." });
    if (pw.next !== pw.confirm) return setMsg({ ok: false, text: "Passwords do not match." });
    setPw({ current: "", next: "", confirm: "" });
    setMsg({ ok: true, text: "Password updated." });
  };

  const rows = [
    ["Current Password", "current", "Current password"],
    ["New", "next", "New password"],
    ["Confirm New", "confirm", "Confirm password"],
  ];

  return (
    <Card title="Account Security">
      <div className="space-y-3">
        {rows.map(([label, k, ph]) => (
          <div key={k} className="grid grid-cols-[130px_1fr] items-center gap-3">
            <label className="text-[14px] text-[#e3ece6]">{label}</label>
            <input type="password" value={pw[k]} onChange={set(k)} placeholder={ph} className={inputCls} />
          </div>
        ))}
      </div>
      {msg && <p className={`mt-3 text-[13px] ${msg.ok ? "text-[#38D982]" : "text-red-400"}`}>{msg.text}</p>}
      <button
        onClick={update}
        className="mt-3 h-10 w-full rounded-lg border border-[#2a3d33] bg-[#16231c] text-[14px] text-white hover:bg-[#1d2f26]"
      >
        Update Password
      </button>
    </Card>
  );
}

/* ------------------------- Preferences card ------------------------- */

function PreferencesCard() {
  const [dark, setDark] = useState(true);
  const [n, setN] = useState({
    emailNotif: false,
    emailDue: false,
    emailRes: false,
    pushDue: true,
    pushRes: true,
  });
  const flip = (k) => () => setN((s) => ({ ...s, [k]: !s[k] }));

  return (
    <Card title="Preferences & Notifications">
      <div className="flex items-center gap-3 text-[14px] text-[#e3ece6]">
        Theme
        <Toggle on={dark} onChange={setDark} />
        <span>{dark ? "Dark" : "Light"}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="mb-2 text-[14px] font-medium text-white">Email</p>
          <div className="space-y-2.5">
            <Check label="Notif to email" checked={n.emailNotif} onChange={flip("emailNotif")} />
            <Check label="Due Date Warnings" checked={n.emailDue} onChange={flip("emailDue")} />
            <Check label="Reservations Available" checked={n.emailRes} onChange={flip("emailRes")} />
          </div>
        </div>
        <div>
          <p className="mb-2 text-[14px] font-medium text-white">Push Notification</p>
          <div className="space-y-2.5">
            <Check label="Due Date Warnings" checked={n.pushDue} onChange={flip("pushDue")} />
            <Check label="Reservations Available" checked={n.pushRes} onChange={flip("pushRes")} />
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------ Library preferences ----------------------- */

function LibraryPrefsCard() {
  const [loan, setLoan] = useState("30");
  const [limit, setLimit] = useState("5");
  const [fine, setFine] = useState("0.50");
  const [saved, setSaved] = useState(false);

  const row = (label, value, setter, suffix) => (
    <div className="grid grid-cols-[170px_1fr] items-center gap-3">
      <label className="text-[14px] text-[#e3ece6]">{label}</label>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => {
            setter(e.target.value);
            setSaved(false);
          }}
          className={`${inputCls} max-w-[140px]`}
        />
        <span className="text-[13px] text-[#9bb0a4]">{suffix}</span>
      </div>
    </div>
  );

  return (
    <Card title="Library Preferences">
      <div className="space-y-3">
        {row("Default loan period", loan, setLoan, "days")}
        {row("Max books per member", limit, setLimit, "books")}
        {row("Late fee per day", fine, setFine, "USD")}
      </div>
      {saved && <p className="mt-3 text-[13px] text-[#38D982]">Preferences saved.</p>}
      <button
        onClick={() => setSaved(true)}
        className="mt-4 h-10 rounded-lg bg-[#38D982] px-6 text-[14px] font-semibold text-[#0D1512] hover:brightness-110"
      >
        Save Preferences
      </button>
    </Card>
  );
}

/* ------------------------ Account management ------------------------ */

function AccountManagement() {
  const [confirming, setConfirming] = useState(false);

  return (
    <Card title="Account Management" className="relative mt-5">
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-[#FBBF24]/70 bg-[#4a3a12]/70 p-4">
        <AlertTriangle className="h-5 w-5 shrink-0 self-start text-[#FBBF24]" />
        <div className="min-w-0 flex-1 text-white">
          <p className="text-[15px] font-medium">Membership Closure</p>
          <p className="text-[14px] text-[#e8dcae]">
            Users must return all active loans and resolve outstanding fines before requests can be processed.
          </p>
        </div>

        {confirming ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="h-10 rounded-lg border border-[#8aa396]/60 px-4 text-[14px] text-white hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setConfirming(false);
                window.alert("Deactivation request submitted.");
              }}
              className="h-10 rounded-lg bg-red-500 px-4 text-[14px] font-semibold text-white hover:bg-red-600"
            >
              Confirm
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="h-10 rounded-lg border border-[#f87171] px-5 text-[14px] text-[#f87171] hover:bg-[#f87171]/10"
          >
            Deactivate Account
          </button>
        )}
      </div>
      <Sparkles className="pointer-events-none absolute bottom-3 right-4 h-9 w-9 text-white/15" />
    </Card>
  );
}

/* -------------------------------- Page ------------------------------ */

export default function SettingsPreferences() {
  const [tab, setTab] = useState("Profile Info");

  return (
    <>
      <h1 className="text-[32px] font-semibold">Settings &amp; Preferences</h1>

      <div className="mt-4 flex gap-7 overflow-x-auto border-b border-[#26382f]">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 border-b-[3px] pb-3 text-[16px] transition ${
              tab === t
                ? "border-[#38D982] font-medium text-[#38D982]"
                : "border-transparent text-[#b9c8be] hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "Profile Info" && (
          <>
            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
              <ProfileCard />
              <div className="space-y-5">
                <SecurityCard />
                <PreferencesCard />
              </div>
            </div>
            <AccountManagement />
          </>
        )}

        {tab === "Security & Password" && (
          <div className="max-w-xl">
            <SecurityCard />
          </div>
        )}

        {tab === "Notifications" && (
          <div className="max-w-xl">
            <PreferencesCard />
          </div>
        )}

        {tab === "Library Preferences" && (
          <div className="max-w-xl">
            <LibraryPrefsCard />
          </div>
        )}
      </div>
    </>
  );
}