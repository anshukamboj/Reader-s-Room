import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Card, PageTitle } from "../components/ui";
import { useLib } from "../context/LibraryContext";


export default function Settings() {
  const { user, setUser, dark, setTheme, notify } = useLib();
  const [profile, setProfile] = useState(user);
  const [editing, setEditing] = useState(false);
  const [backup, setBackup] = useState(user);

const change = (field, value) => {
  const next = { ...profile, [field]: value };
  setProfile(next);
  setUser({ ...user, name: next.name, email: next.email });
};
  const [prefs, setPrefs] = useState({ dueReminders: true, readyAlerts: true, newArrivals: false, autoRenew: false, language: "English" });

  const save = (e) => {
  e.preventDefault();
  if (!profile.name.trim() || !/^\S+@\S+\.\S+$/.test(profile.email)) return notify("Please enter a valid name and email.");
  setUser({ ...user, name: profile.name.trim(), email: profile.email.trim() });
  setEditing(false);
  notify("Settings saved.");
};

const cancel = () => {
  setProfile(backup);
  setUser(backup);
  setEditing(false);
};

  const Check = ({ k, label }) => (
    <label className="flex cursor-pointer items-center gap-3 py-2 text-sm">
      <input type="checkbox" checked={prefs[k]} onChange={(e) => setPrefs({ ...prefs, [k]: e.target.checked })} className="h-4 w-4 accent-[#48C77D]" /> {label}
    </label>
  );

 return (
  <div>
    <PageTitle title="Settings" subtitle="Manage your profile and preferences" />

    <div className="grid gap-4 lg:grid-cols-2">
    <Card title="Profile">
  <form onSubmit={save}>
    <label className="mb-1 block text-sm muted">Full name</label>
    <input value={profile.name} disabled={!editing} onChange={(e) => change("name", e.target.value)} className={`field disabled:opacity-60 ${editing ? "!border-2 !border-[#f1f3f2]" : ""}`} />
    <label className="mb-1 mt-4 block text-sm muted">Email</label>
   <input type="email" value={profile.email} disabled={!editing} onChange={(e) => change("email", e.target.value)} className={`field disabled:opacity-60 ${editing ? "!border-2 !border-[#f1f3f2]" : ""}`} />

    <div className="mt-4 flex gap-2">
      <button type="button" onClick={() => { setBackup(user); setEditing(true); }} disabled={editing} className="btn hover-bg rounded-2xl border p-2 disabled:opacity-50">Edit profile</button>
      <button type="submit" disabled={!editing} className="btn btn-primary rounded-2xl border p-2 disabled:opacity-50">Save changes</button>
      
    </div>
  </form>
</Card>

      <Card title="Theme">
        <div className="grid grid-cols-2 gap-3">
          {[[true, "Dark", Moon], [false, "Light", Sun]].map(([val, label, Icon]) => (
            <button type="button" key={label} onClick={() => setTheme(val)} className={`flex h-20 flex-col items-center justify-center gap-2 rounded-lg border text-sm ${dark === val ? "border-[#48C77D] bg-[#285A3B]/40" : "line hover-bg"}`}>
              <Icon size={20} /> {label}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Notifications">
        <Check k="dueReminders" label="Due date reminders" />
        <Check k="readyAlerts" label="Reservation ready alerts" />
        <Check k="newArrivals" label="New arrivals email" />
      </Card>

      <Card title="Reading preferences">
        <Check k="autoRenew" label="Auto-renew eligible books" />
        <label className="mb-1 mt-2 block text-sm muted">Preferred language</label>
        <select value={prefs.language} onChange={(e) => setPrefs({ ...prefs, language: e.target.value })} className="field">
          <option>English</option>
        </select>
      </Card>
    </div>
  </div>
)
}