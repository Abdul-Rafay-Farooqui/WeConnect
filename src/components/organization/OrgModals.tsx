'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { UsersAPI } from '@/lib/api/endpoints';

/* ────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────── */
interface UserSuggestion {
  id: string;
  display_name?: string;
  phone?: string;
  avatar_url?: string;
}

/* ────────────────────────────────────────────────────────
   Shared backdrop / modal shell
──────────────────────────────────────────────────────── */
const Backdrop = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
    onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    {children}
  </div>
);

const ModalCard = ({ children }: { children: React.ReactNode }) => (
  <div
    className="relative w-[480px] max-w-[95vw] rounded-2xl border border-[#2a3942] p-7 shadow-2xl"
    style={{
      background: 'linear-gradient(145deg, #141f26 0%, #0d1a21 100%)',
      boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
    }}
  >
    {children}
  </div>
);

const ModalTitle = ({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) => (
  <div className="mb-6">
    <div className="flex items-center gap-3 mb-1">
      <span className="text-2xl">{icon}</span>
      <h3 className="text-[#e9edef] text-xl font-bold tracking-tight">{title}</h3>
    </div>
    {subtitle && <p className="text-[#8696a0] text-sm ml-10">{subtitle}</p>}
  </div>
);

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  hint,
  autoFocus = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  autoFocus?: boolean;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);

  return (
    <div className="mb-4">
      <label className="block text-[#8696a0] text-xs font-semibold uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-[#0b141a] border border-[#2a3942] text-[#e9edef] px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884]/30 placeholder-[#4a5568]"
      />
      {hint && <p className="text-[#8696a0] text-xs mt-1">{hint}</p>}
    </div>
  );
};

const TextArea = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="mb-4">
    <label className="block text-[#8696a0] text-xs font-semibold uppercase tracking-wider mb-1.5">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full rounded-xl bg-[#0b141a] border border-[#2a3942] text-[#e9edef] px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884]/30 placeholder-[#4a5568] resize-none"
    />
  </div>
);

const Actions = ({ onCancel, onConfirm, confirmLabel, loading, danger }: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  loading?: boolean;
  danger?: boolean;
}) => (
  <div className="flex justify-end gap-3 mt-6">
    <button
      onClick={onCancel}
      disabled={loading}
      className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33] transition-all disabled:opacity-50"
    >
      Cancel
    </button>
    <button
      onClick={onConfirm}
      disabled={loading}
      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60 flex items-center gap-2 ${
        danger
          ? 'bg-red-600 hover:bg-red-500 text-white'
          : 'text-[#0b141a] hover:opacity-90'
      }`}
      style={danger ? {} : { background: 'linear-gradient(135deg, #00a884, #00c49a)' }}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {loading ? 'Please wait…' : confirmLabel}
    </button>
  </div>
);

/* ────────────────────────────────────────────────────────
   UserPicker — search by name, pick multiple users
──────────────────────────────────────────────────────── */
const Avatar = ({ user }: { user: UserSuggestion }) => (
  <div className="w-8 h-8 rounded-full bg-[#00a884]/30 flex items-center justify-center text-[#00a884] font-bold text-sm flex-shrink-0 overflow-hidden">
    {user.avatar_url ? (
      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
    ) : (
      (user.display_name?.[0] || '?').toUpperCase()
    )}
  </div>
);

const UserPicker = ({
  label,
  selected,
  onAdd,
  onRemove,
}: {
  label: string;
  selected: UserSuggestion[];
  onAdd: (u: UserSuggestion) => void;
  onRemove: (id: string) => void;
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setDropdownOpen(false); return; }
    setIsSearching(true);
    try {
      const data = await UsersAPI.search(q);
      const list: UserSuggestion[] = Array.isArray(data) ? data : (data?.users ?? []);
      setResults(list);
      setDropdownOpen(list.length > 0);
    } catch {
      setResults([]);
      setDropdownOpen(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleChange = (v: string) => {
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(v), 300);
  };

  const handlePick = (u: UserSuggestion) => {
    if (!selected.find((s) => s.id === u.id)) onAdd(u);
    setQuery('');
    setResults([]);
    setDropdownOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="mb-4" ref={containerRef}>
      <label className="block text-[#8696a0] text-xs font-semibold uppercase tracking-wider mb-1.5">
        {label}
      </label>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selected.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00a884]/15 border border-[#00a884]/30 text-[#00a884] text-xs font-medium"
            >
              <Avatar user={u} />
              <span>{u.display_name || u.phone || u.id}</span>
              <button
                onClick={() => onRemove(u.id)}
                className="ml-0.5 text-[#00a884]/60 hover:text-red-400 transition-colors text-base leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search by name or phone…"
          className="w-full rounded-xl bg-[#0b141a] border border-[#2a3942] text-[#e9edef] px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884]/30 placeholder-[#4a5568] pr-9"
        />
        {isSearching && (
          <svg className="animate-spin w-4 h-4 text-[#8696a0] absolute right-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}

        {/* Dropdown */}
        {dropdownOpen && results.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border border-[#2a3942] shadow-2xl overflow-hidden z-10"
            style={{ background: '#141f26' }}>
            {results.map((u) => {
              const alreadyAdded = !!selected.find((s) => s.id === u.id);
              return (
                <button
                  key={u.id}
                  onMouseDown={(e) => { e.preventDefault(); if (!alreadyAdded) handlePick(u); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                    alreadyAdded
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:bg-[#202c33] cursor-pointer'
                  }`}
                >
                  <Avatar user={u} />
                  <div className="text-left min-w-0">
                    <p className="text-[#e9edef] font-medium truncate">{u.display_name || '(no name)'}</p>
                    {u.phone && <p className="text-[#8696a0] text-xs truncate">{u.phone}</p>}
                  </div>
                  {alreadyAdded && <span className="ml-auto text-[#00a884] text-xs">Added ✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <p className="text-[#8696a0] text-xs mt-1">Search and select — you can add more people later</p>
    </div>
  );
};

/* ────────────────────────────────────────────────────────
   1. Create Organization Modal
──────────────────────────────────────────────────────── */
export const CreateOrgModal = ({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, slug: string, description: string) => Promise<void>;
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    setSlug(name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  }, [name]);

  const reset = () => { setName(''); setSlug(''); setDescription(''); setErr(''); setLoading(false); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!name.trim()) { setErr('Organization name is required.'); return; }
    setLoading(true); setErr('');
    try {
      await onSubmit(name.trim(), slug.trim(), description.trim());
      reset(); onClose();
    } catch (e: any) {
      setErr(e?.message || 'Failed to create organization.');
    } finally { setLoading(false); }
  };

  if (!open) return null;
  return (
    <Backdrop onClose={handleClose}>
      <ModalCard>
        <ModalTitle icon="🏢" title="Create Organization" subtitle="Set up a new workspace for your team" />
        <Field label="Organization Name *" value={name} onChange={setName} placeholder="e.g. Acme Corp" autoFocus />
        <Field label="Slug" value={slug} onChange={setSlug} placeholder="acme-corp" hint="Used in URLs — auto-generated from the name" />
        <TextArea label="Description" value={description} onChange={setDescription} placeholder="What does this organization do?" />
        {err && <p className="text-red-400 text-sm mb-2">{err}</p>}
        <Actions onCancel={handleClose} onConfirm={handleSubmit} confirmLabel="Create Organization" loading={loading} />
      </ModalCard>
    </Backdrop>
  );
};

/* ────────────────────────────────────────────────────────
   2. Create Team Modal
──────────────────────────────────────────────────────── */
export const CreateTeamModal = ({
  open,
  onClose,
  onSubmit,
  orgName,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, memberIds: string[]) => Promise<void>;
  orgName?: string;
}) => {
  const [name, setName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const reset = () => { setName(''); setSelectedUsers([]); setErr(''); setLoading(false); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!name.trim()) { setErr('Team name is required.'); return; }
    setLoading(true); setErr('');
    try {
      await onSubmit(name.trim(), selectedUsers.map((u) => u.id));
      reset(); onClose();
    } catch (e: any) {
      setErr(e?.message || 'Failed to create team.');
    } finally { setLoading(false); }
  };

  if (!open) return null;
  return (
    <Backdrop onClose={handleClose}>
      <ModalCard>
        <ModalTitle icon="👥" title="Create Team" subtitle={orgName ? `Inside "${orgName}"` : 'Add a new team to your organization'} />
        <Field label="Team Name *" value={name} onChange={setName} placeholder="e.g. Engineering" autoFocus />
        <UserPicker
          label="Add Members"
          selected={selectedUsers}
          onAdd={(u) => setSelectedUsers((prev) => [...prev, u])}
          onRemove={(id) => setSelectedUsers((prev) => prev.filter((u) => u.id !== id))}
        />
        {err && <p className="text-red-400 text-sm mb-2">{err}</p>}
        <Actions onCancel={handleClose} onConfirm={handleSubmit} confirmLabel="Create Team" loading={loading} />
      </ModalCard>
    </Backdrop>
  );
};

/* ────────────────────────────────────────────────────────
   3. Add Organization Members Modal
──────────────────────────────────────────────────────── */
export const AddOrgMembersModal = ({
  open,
  onClose,
  onSubmit,
  orgName,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (memberIds: string[]) => Promise<void>;
  orgName?: string;
}) => {
  const [selectedUsers, setSelectedUsers] = useState<UserSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const reset = () => { setSelectedUsers([]); setErr(''); setLoading(false); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!selectedUsers.length) { setErr('Select at least one user.'); return; }
    setLoading(true); setErr('');
    try {
      await onSubmit(selectedUsers.map((u) => u.id));
      reset(); onClose();
    } catch (e: any) {
      setErr(e?.message || 'Failed to add members.');
    } finally { setLoading(false); }
  };

  if (!open) return null;
  return (
    <Backdrop onClose={handleClose}>
      <ModalCard>
        <ModalTitle icon="➕" title="Add Organization Members" subtitle={orgName ? `Add people to "${orgName}"` : undefined} />
        <div className="mb-4 p-3 rounded-xl bg-[#00a884]/10 border border-[#00a884]/20 text-[#00a884] text-sm">
          💡 Members can access all teams within this organization they are invited to.
        </div>
        <UserPicker
          label="Search Users *"
          selected={selectedUsers}
          onAdd={(u) => setSelectedUsers((prev) => [...prev, u])}
          onRemove={(id) => setSelectedUsers((prev) => prev.filter((u) => u.id !== id))}
        />
        {err && <p className="text-red-400 text-sm mb-2">{err}</p>}
        <Actions onCancel={handleClose} onConfirm={handleSubmit} confirmLabel="Add Members" loading={loading} />
      </ModalCard>
    </Backdrop>
  );
};

/* ────────────────────────────────────────────────────────
   4. Add Team Members Modal
   — shows org members only (backend enforces this anyway)
──────────────────────────────────────────────────────── */
export const AddTeamMembersModal = ({
  open,
  onClose,
  onSubmit,
  teamName,
  orgMembers = [],
  existingMemberIds = [],
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (memberIds: string[]) => Promise<void>;
  teamName?: string;
  orgMembers?: UserSuggestion[];
  existingMemberIds?: string[];
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const reset = () => { setSelected(new Set()); setQuery(''); setErr(''); setLoading(false); };
  const handleClose = () => { reset(); onClose(); };

  const toggle = (userId: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });

  const handleSubmit = async () => {
    if (!selected.size) { setErr('Select at least one member.'); return; }
    setLoading(true); setErr('');
    try {
      await onSubmit(Array.from(selected));
      reset(); onClose();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || 'Failed to add members.');
    } finally { setLoading(false); }
  };

  const available = orgMembers.filter(
    (m) =>
      !existingMemberIds.includes(m.user_id ?? m.id) &&
      (!query.trim() ||
        m.display_name?.toLowerCase().includes(query.toLowerCase()) ||
        m.phone?.includes(query)),
  );

  if (!open) return null;
  return (
    <Backdrop onClose={handleClose}>
      <ModalCard>
        <ModalTitle
          icon="🙋"
          title="Add Team Members"
          subtitle={teamName ? `Add org members to "${teamName}"` : undefined}
        />

        {orgMembers.length === 0 ? (
          <div className="mb-4 p-3 rounded-xl bg-[#1e2a30] text-[#8696a0] text-sm text-center">
            No organization members found. Add members to the org first.
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="mb-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or phone…"
                className="w-full rounded-xl bg-[#0b141a] border border-[#2a3942] text-[#e9edef] px-4 py-2.5 text-sm outline-none focus:border-[#00a884] placeholder-[#4a5568]"
              />
            </div>

            {/* Member list */}
            <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1 mb-2">
              {available.length === 0 && (
                <p className="text-[#8696a0] text-sm text-center py-4">
                  {query ? 'No matches' : 'All org members are already in this team.'}
                </p>
              )}
              {available.map((m) => {
                const uid = m.user_id ?? m.id;
                const checked = selected.has(uid);
                return (
                  <button
                    key={uid}
                    onClick={() => toggle(uid)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      checked ? 'bg-[#00a884]/15 border border-[#00a884]/30' : 'hover:bg-[#202c33] border border-transparent'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#2a3942] flex items-center justify-center text-[#00a884] font-bold text-sm flex-shrink-0 overflow-hidden">
                      {m.avatar_url
                        ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                        : (m.display_name?.[0] || '?').toUpperCase()}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[#e9edef] text-sm font-medium truncate">{m.display_name || '(no name)'}</p>
                      {m.phone && <p className="text-[#8696a0] text-xs">{m.phone}</p>}
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      checked ? 'bg-[#00a884] border-[#00a884]' : 'border-[#2a3942]'
                    }`}>
                      {checked && <span className="text-[#0b141a] text-xs font-bold">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {selected.size > 0 && (
              <p className="text-[#00a884] text-xs mb-1">{selected.size} selected</p>
            )}
          </>
        )}

        {err && <p className="text-red-400 text-sm mb-2">{err}</p>}
        <Actions
          onCancel={handleClose}
          onConfirm={handleSubmit}
          confirmLabel={`Add ${selected.size > 0 ? selected.size : ''} to Team`}
          loading={loading}
        />
      </ModalCard>
    </Backdrop>
  );
};

/* ────────────────────────────────────────────────────────
   5. Delete Team Confirmation Modal
──────────────────────────────────────────────────────── */
export const DeleteTeamModal = ({
  open,
  onClose,
  onConfirm,
  teamName,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  teamName?: string;
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const reset = () => { setConfirmText(''); setErr(''); setLoading(false); };
  const handleClose = () => { reset(); onClose(); };

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') { setErr('Type DELETE to confirm.'); return; }
    setLoading(true); setErr('');
    try {
      await onConfirm();
      reset(); onClose();
    } catch (e: any) {
      setErr(e?.message || 'Failed to delete team.');
    } finally { setLoading(false); }
  };

  if (!open) return null;
  return (
    <Backdrop onClose={handleClose}>
      <ModalCard>
        <ModalTitle icon="⚠️" title="Delete Team" />
        <div className="mb-5 p-4 rounded-xl bg-red-950/40 border border-red-500/30">
          <p className="text-red-300 text-sm leading-relaxed">
            You are about to permanently delete{' '}
            <span className="font-bold text-red-200">{teamName || 'this team'}</span>. This action{' '}
            <span className="font-bold">cannot be undone</span>. All messages, files, and data will be lost forever.
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-[#8696a0] text-xs font-semibold uppercase tracking-wider mb-1.5">
            Type <span className="text-red-400 font-mono">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full rounded-xl bg-[#0b141a] border border-red-500/40 text-[#e9edef] px-4 py-2.5 text-sm outline-none transition-all focus:border-red-500 focus:ring-1 focus:ring-red-500/30 placeholder-[#4a5568] font-mono tracking-widest"
          />
          {err && <p className="text-red-400 text-xs mt-1">{err}</p>}
        </div>
        <Actions onCancel={handleClose} onConfirm={handleDelete} confirmLabel="Delete Team" loading={loading} danger />
      </ModalCard>
    </Backdrop>
  );
};

/* ────────────────────────────────────────────────────────
   6. Delete Organization Confirmation Modal
──────────────────────────────────────────────────────── */
export const DeleteOrgModal = ({
  open,
  onClose,
  onConfirm,
  orgName,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  orgName?: string;
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const reset = () => { setConfirmText(''); setErr(''); setLoading(false); };
  const handleClose = () => { reset(); onClose(); };

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') { setErr('Type DELETE to confirm.'); return; }
    setLoading(true); setErr('');
    try {
      await onConfirm();
      reset(); onClose();
    } catch (e: any) {
      setErr(e?.message || 'Failed to delete organization.');
    } finally { setLoading(false); }
  };

  if (!open) return null;
  return (
    <Backdrop onClose={handleClose}>
      <ModalCard>
        <ModalTitle icon="⚠️" title="Delete Organization" />
        <div className="mb-5 p-4 rounded-xl bg-red-950/40 border border-red-500/30">
          <p className="text-red-300 text-sm leading-relaxed">
            You are about to permanently delete{' '}
            <span className="font-bold text-red-200">{orgName || 'this organization'}</span> and{' '}
            <span className="font-bold">all of its teams</span>. This action{' '}
            <span className="font-bold">cannot be undone</span>.
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-[#8696a0] text-xs font-semibold uppercase tracking-wider mb-1.5">
            Type <span className="text-red-400 font-mono">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full rounded-xl bg-[#0b141a] border border-red-500/40 text-[#e9edef] px-4 py-2.5 text-sm outline-none transition-all focus:border-red-500 focus:ring-1 focus:ring-red-500/30 placeholder-[#4a5568] font-mono tracking-widest"
          />
          {err && <p className="text-red-400 text-xs mt-1">{err}</p>}
        </div>
        <Actions onCancel={handleClose} onConfirm={handleDelete} confirmLabel="Delete Organization" loading={loading} danger />
      </ModalCard>
    </Backdrop>
  );
};
