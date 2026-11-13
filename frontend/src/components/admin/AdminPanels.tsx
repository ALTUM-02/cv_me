import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  GET_ACTIVITY_LOG,
  GET_ADMIN_CVS,
  GET_CV,
  GET_SITE_SETTINGS,
} from '../../api/graphql/queries';
import {
  ADMIN_DELETE_CV,
  ADMIN_SET_CV_STATUS,
  ADMIN_UPDATE_USER,
  UPDATE_SITE_SETTINGS,
} from '../../api/graphql/mutations';
import type {
  ActivityLogEntry,
  AdminCV,
  GraphQLCV,
  GraphQLUser,
  SiteSettingsData,
} from '../../api/graphql/types';

type Notify = (ok: boolean, text: string) => void;
type OpenDjango = (path?: string) => void;
type MutationResult = { success: boolean; message?: string };

const card = 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700';
const input =
  'min-h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white';
const btn =
  'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600';
const btnDanger =
  'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50';

const ACTIVITY_TYPES: Record<string, { label: string; icon: string; tone: string }> = {
  auth: { label: 'Sign in / sign up', icon: '👤', tone: 'bg-purple-100 dark:bg-purple-900/30' },
  create: { label: 'Created', icon: '📝', tone: 'bg-green-100 dark:bg-green-900/30' },
  edit: { label: 'Edited', icon: '✏️', tone: 'bg-blue-100 dark:bg-blue-900/30' },
  publish: { label: 'Published', icon: '🚀', tone: 'bg-indigo-100 dark:bg-indigo-900/30' },
  delete: { label: 'Deleted', icon: '🗑️', tone: 'bg-gray-100 dark:bg-gray-700' },
  upload: { label: 'Upload', icon: '📎', tone: 'bg-amber-100 dark:bg-amber-900/30' },
  admin: { label: 'Admin action', icon: '🔑', tone: 'bg-red-100 dark:bg-red-900/30' },
};

export const timeAgo = (value?: string | null) => {
  if (!value) return 'Never';
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 45) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return new Date(value).toLocaleDateString();
};

const result = <K extends string>(data: unknown, key: K): MutationResult | undefined =>
  (data as Record<K, MutationResult> | undefined)?.[key];

// ==================== Activity feed ====================

const ActivityList: React.FC<{
  entries: ActivityLogEntry[];
  onSelectUser?: (userId: string) => void;
  onViewCv?: (cvId: string) => void;
}> = ({ entries, onSelectUser, onViewCv }) => (
  <ul className="divide-y divide-gray-100 dark:divide-gray-700">
    {entries.map((entry) => {
      const kind = ACTIVITY_TYPES[entry.type] ?? ACTIVITY_TYPES.edit;
      return (
        <li key={entry.id} className="flex items-start gap-3 py-3">
          <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${kind.tone}`}>
            {kind.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-900 dark:text-white">
              {entry.userId && onSelectUser ? (
                <button
                  type="button"
                  onClick={() => onSelectUser(entry.userId!)}
                  className="font-semibold hover:underline"
                >
                  {entry.userLabel}
                </button>
              ) : (
                <span className="font-semibold">{entry.userLabel}</span>
              )}{' '}
              {entry.action}
            </p>
            {entry.detail && (
              <p className="text-sm text-gray-500 dark:text-gray-400 break-words">{entry.detail}</p>
            )}
            {entry.cvId && onViewCv && entry.type !== 'delete' && (
              <button
                type="button"
                onClick={() => onViewCv(entry.cvId!)}
                className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                View CV
              </button>
            )}
          </div>
          <time
            className="shrink-0 text-xs text-gray-400 dark:text-gray-500"
            title={new Date(entry.updatedAt).toLocaleString()}
          >
            {timeAgo(entry.updatedAt)}
          </time>
        </li>
      );
    })}
  </ul>
);

export const ActivityPanel: React.FC<{
  onSelectUser: (userId: string) => void;
  onViewCv: (cvId: string) => void;
}> = ({ onSelectUser, onViewCv }) => {
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, loading, error, refetch } = useQuery<{ activityLog: ActivityLogEntry[] }>(GET_ACTIVITY_LOG, {
    variables: { limit: 200, type: type || null, search: debounced || null },
    fetchPolicy: 'network-only',
    pollInterval: 15000,
  });
  const entries = data?.activityLog ?? [];

  return (
    <div className={`${card} p-4 sm:p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live activity</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Every sign-in, CV change and admin action. Updates every 15 seconds.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user or CV"
            aria-label="Search activity"
            className={input}
          />
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Activity type" className={input}>
            <option value="">All activity</option>
            {Object.entries(ACTIVITY_TYPES).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button type="button" onClick={() => void refetch()} className={btn}>Refresh</button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">Could not load activity: {error.message}</p>}
      {loading && !data && <p className="text-sm text-gray-500">Loading activity…</p>}
      {!loading && entries.length === 0 && !error && (
        <p className="py-8 text-center text-gray-400">No activity yet.</p>
      )}
      <ActivityList entries={entries} onSelectUser={onSelectUser} onViewCv={onViewCv} />
    </div>
  );
};

// ==================== CV management ====================

const CvRows: React.FC<{
  cvs: AdminCV[];
  showOwner?: boolean;
  onView: (id: string) => void;
  onToggleStatus: (cv: AdminCV) => void;
  onDelete: (cv: AdminCV) => void;
  onOpenDjango: OpenDjango;
  onSelectUser?: (userId: string) => void;
}> = ({ cvs, showOwner = true, onView, onToggleStatus, onDelete, onOpenDjango, onSelectUser }) => (
  <ul className="divide-y divide-gray-100 dark:divide-gray-700">
    {cvs.map((cv) => (
      <li key={cv.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {cv.photo ? (
            <img src={cv.photo} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 shrink-0 flex items-center justify-center text-white text-sm font-semibold">
              {(cv.fullName || cv.title).charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {cv.title}
              <span
                className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  cv.status === 'published'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {cv.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {showOwner && (
                <>
                  {onSelectUser ? (
                    <button type="button" className="hover:underline" onClick={() => onSelectUser(cv.ownerId)}>
                      {cv.ownerName}
                    </button>
                  ) : (
                    cv.ownerName
                  )}
                  {' · '}
                </>
              )}
              {cv.templateId} · {cv.experienceCount} jobs · {cv.educationCount} education · {cv.skillCount} skills ·
              updated {timeAgo(cv.lastModified)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn} onClick={() => onView(cv.id)}>View</button>
          <button type="button" className={btn} onClick={() => onToggleStatus(cv)}>
            {cv.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          <button type="button" className={btn} onClick={() => onOpenDjango(`cv_builder/cv/${cv.id}/change/`)}>
            Edit in Django
          </button>
          <button type="button" className={btnDanger} onClick={() => onDelete(cv)}>Delete</button>
        </div>
      </li>
    ))}
  </ul>
);

const useCvActions = (notify: Notify, refetch: () => unknown) => {
  const [setStatus] = useMutation(ADMIN_SET_CV_STATUS);
  const [deleteCv] = useMutation(ADMIN_DELETE_CV);
  const toggleStatus = async (cv: AdminCV) => {
    try {
      const { data } = await setStatus({
        variables: { id: cv.id, status: cv.status === 'published' ? 'draft' : 'published' },
      });
      const r = result(data, 'adminSetCvStatus');
      notify(!!r?.success, r?.message || 'Could not change CV status.');
      void refetch();
    } catch {
      notify(false, 'Could not reach the server.');
    }
  };
  const remove = async (cv: AdminCV) => {
    if (!window.confirm(`Delete "${cv.title}" owned by ${cv.ownerEmail}? This cannot be undone.`)) return;
    try {
      const { data } = await deleteCv({ variables: { id: cv.id } });
      const r = result(data, 'adminDeleteCv');
      notify(!!r?.success, r?.message || 'Could not delete CV.');
      void refetch();
    } catch {
      notify(false, 'Could not reach the server.');
    }
  };
  return { toggleStatus, remove };
};

export const CvsPanel: React.FC<{
  notify: Notify;
  onView: (id: string) => void;
  onOpenDjango: OpenDjango;
  onSelectUser: (userId: string) => void;
}> = ({ notify, onView, onOpenDjango, onSelectUser }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);
  const { data, loading, error, refetch } = useQuery<{ adminCvs: AdminCV[] }>(GET_ADMIN_CVS, {
    variables: { search: debounced || null },
    fetchPolicy: 'network-only',
    pollInterval: 30000,
  });
  const { toggleStatus, remove } = useCvActions(notify, refetch);
  const cvs = (data?.adminCvs ?? []).filter((cv) => status === 'all' || cv.status === status);

  return (
    <div className={`${card} p-4 sm:p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All CVs</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{cvs.length} CVs from all users</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or owner"
            aria-label="Search CVs"
            className={input}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="CV status" className={input}>
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">Could not load CVs: {error.message}</p>}
      {loading && !data && <p className="text-sm text-gray-500">Loading CVs…</p>}
      {!loading && cvs.length === 0 && !error && <p className="py-8 text-center text-gray-400">No CVs found.</p>}
      <CvRows
        cvs={cvs}
        onView={onView}
        onToggleStatus={(cv) => void toggleStatus(cv)}
        onDelete={(cv) => void remove(cv)}
        onOpenDjango={onOpenDjango}
        onSelectUser={onSelectUser}
      />
    </div>
  );
};

// ==================== Modals ====================

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{title}</h3>
          <button type="button" onClick={onClose} className={btn} aria-label="Close">Close</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-5">
    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{title}</h4>
    <div className="text-sm text-gray-800 dark:text-gray-200 space-y-2">{children}</div>
  </section>
);

export const CvViewerModal: React.FC<{ cvId: string; onClose: () => void; onOpenDjango: OpenDjango }> = ({
  cvId,
  onClose,
  onOpenDjango,
}) => {
  const { data, loading, error } = useQuery<{ cv: GraphQLCV | null }>(GET_CV, {
    variables: { id: cvId },
    fetchPolicy: 'network-only',
  });
  const cv = data?.cv;
  const p = cv?.personalInfo;
  const strip = (html?: string | null) => (html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  return (
    <Modal title={cv ? cv.title : 'CV'} onClose={onClose}>
      {loading && <p className="text-sm text-gray-500">Loading CV…</p>}
      {error && <p className="text-sm text-red-600">Could not load this CV: {error.message}</p>}
      {!loading && !cv && !error && <p className="text-sm text-gray-500">This CV no longer exists.</p>}
      {cv && (
        <>
          <div className="flex items-center gap-4 mb-5">
            {p?.photo ? (
              <img src={p.photo} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : null}
            <div className="min-w-0">
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {[p?.firstName, p?.lastName].filter(Boolean).join(' ') || 'No name yet'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 break-words">
                {[p?.email, p?.phone, [p?.city, p?.country].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {cv.status === 'published' ? 'Published' : 'Draft'} · {cv.templateId} template · updated{' '}
                {timeAgo(cv.lastModified)}
              </p>
            </div>
          </div>
          {p?.summary && <Section title="Summary"><p>{strip(p.summary)}</p></Section>}
          {cv.experiences?.length ? (
            <Section title="Experience">
              {cv.experiences.map((e) => (
                <div key={e.id}>
                  <p className="font-medium">{e.position} — {e.company}</p>
                  <p className="text-xs text-gray-500">{e.startDate} – {e.current ? 'Present' : e.endDate}</p>
                  {e.description && <p className="text-gray-600 dark:text-gray-300">{strip(e.description)}</p>}
                </div>
              ))}
            </Section>
          ) : null}
          {cv.education?.length ? (
            <Section title="Education">
              {cv.education.map((e) => (
                <div key={e.id}>
                  <p className="font-medium">{e.degree} {e.field ? `in ${e.field}` : ''}</p>
                  <p className="text-xs text-gray-500">{e.institution} · {e.startDate} – {e.endDate}</p>
                </div>
              ))}
            </Section>
          ) : null}
          {cv.skills?.length ? (
            <Section title="Skills"><p>{cv.skills.map((s) => s.name).join(', ')}</p></Section>
          ) : null}
          {cv.languages?.length ? (
            <Section title="Languages"><p>{cv.languages.map((l) => `${l.name} (${l.proficiency})`).join(', ')}</p></Section>
          ) : null}
          {cv.certifications?.length ? (
            <Section title="Certifications">
              {cv.certifications.map((c) => (
                <p key={c.id}>{c.name} — {c.issuer} {c.date ? `(${c.date})` : ''}</p>
              ))}
            </Section>
          ) : null}
          {cv.projects?.length ? (
            <Section title="Projects">
              {cv.projects.map((pr) => (
                <div key={pr.id}>
                  <p className="font-medium">{pr.name}</p>
                  {pr.description && <p className="text-gray-600 dark:text-gray-300">{strip(pr.description)}</p>}
                </div>
              ))}
            </Section>
          ) : null}
          <button
            type="button"
            onClick={() => onOpenDjango(`cv_builder/cv/${cv.id}/change/`)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
          >
            Edit this CV in Django Admin
          </button>
        </>
      )}
    </Modal>
  );
};

export const UserDetailModal: React.FC<{
  user: GraphQLUser;
  isSelf: boolean;
  notify: Notify;
  onClose: () => void;
  onChanged: () => void;
  onViewCv: (id: string) => void;
  onOpenDjango: OpenDjango;
}> = ({ user, isSelf, notify, onClose, onChanged, onViewCv, onOpenDjango }) => {
  const [form, setForm] = useState({ firstName: user.firstName, lastName: user.lastName, email: user.email });
  const [saving, setSaving] = useState(false);
  const [updateUser] = useMutation(ADMIN_UPDATE_USER);
  const cvsQuery = useQuery<{ adminCvs: AdminCV[] }>(GET_ADMIN_CVS, {
    variables: { userId: user.id },
    fetchPolicy: 'network-only',
  });
  const activityQuery = useQuery<{ activityLog: ActivityLogEntry[] }>(GET_ACTIVITY_LOG, {
    variables: { userId: user.id, limit: 50 },
    fetchPolicy: 'network-only',
    pollInterval: 15000,
  });
  const { toggleStatus, remove } = useCvActions(notify, cvsQuery.refetch);
  const dirty =
    form.firstName !== user.firstName || form.lastName !== user.lastName || form.email !== user.email;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateUser({ variables: { id: user.id, ...form } });
      const r = result(data, 'adminUpdateUser');
      notify(!!r?.success, r?.message || 'Could not update user.');
      if (r?.success) onChanged();
    } catch {
      notify(false, 'Could not reach the server.');
    } finally {
      setSaving(false);
    }
  };

  const cvs = cvsQuery.data?.adminCvs ?? [];
  const activity = activityQuery.data?.activityLog ?? [];

  return (
    <Modal title={`${user.firstName} ${user.lastName}`.trim() || user.email} onClose={onClose}>
      <div className="flex flex-wrap gap-2 mb-5 text-xs">
        <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
          {user.role === 'admin' ? 'Administrator' : 'User'}
        </span>
        <span
          className={`px-2 py-1 rounded-full ${
            user.isActive
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {user.isActive ? 'Active' : 'Suspended'}
        </span>
        <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </span>
        <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
          Last sign-in {timeAgo(user.lastLogin)}
        </span>
      </div>

      <Section title="Account details">
        <form onSubmit={(e) => void save(e)} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input className={input} value={form.firstName} aria-label="First name" placeholder="First name"
            onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <input className={input} value={form.lastName} aria-label="Last name" placeholder="Last name"
            onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <input className={input} type="email" value={form.email} aria-label="Email" placeholder="Email"
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="sm:col-span-3 flex flex-wrap gap-2">
            <button type="submit" disabled={!dirty || saving}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              onClick={() => onOpenDjango(`accounts/user/${user.id}/change/`)}>
              {isSelf ? 'Change my password in Django' : 'Reset password in Django'}
            </button>
          </div>
        </form>
      </Section>

      <Section title={`CVs (${cvs.length})`}>
        {cvsQuery.loading && !cvsQuery.data && <p className="text-gray-500">Loading…</p>}
        {!cvsQuery.loading && cvs.length === 0 && <p className="text-gray-400">No CVs yet.</p>}
        <CvRows
          cvs={cvs}
          showOwner={false}
          onView={onViewCv}
          onToggleStatus={(cv) => void toggleStatus(cv)}
          onDelete={(cv) => void remove(cv)}
          onOpenDjango={onOpenDjango}
        />
      </Section>

      <Section title="Recent activity">
        {activityQuery.loading && !activityQuery.data && <p className="text-gray-500">Loading…</p>}
        {!activityQuery.loading && activity.length === 0 && <p className="text-gray-400">No activity recorded yet.</p>}
        <ActivityList entries={activity} onViewCv={onViewCv} />
      </Section>
    </Modal>
  );
};

// ==================== Website settings ====================

export const WebsiteSettingsPanel: React.FC<{ notify: Notify }> = ({ notify }) => {
  const { data, loading, refetch } = useQuery<{ siteSettings: SiteSettingsData }>(GET_SITE_SETTINGS, {
    fetchPolicy: 'network-only',
  });
  const [updateSettings, { loading: saving }] = useMutation(UPDATE_SITE_SETTINGS);
  const [form, setForm] = useState<SiteSettingsData | null>(null);

  useEffect(() => {
    if (data?.siteSettings) setForm(data.siteSettings);
  }, [data]);

  if (loading && !form) return <div className={`${card} p-6 text-sm text-gray-500`}>Loading website settings…</div>;
  if (!form) return <div className={`${card} p-6 text-sm text-red-600`}>Could not load website settings.</div>;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: res } = await updateSettings({
        variables: {
          siteName: form.siteName,
          announcement: form.announcement,
          announcementLevel: form.announcementLevel,
          allowRegistration: form.allowRegistration,
          maintenanceMode: form.maintenanceMode,
          maintenanceMessage: form.maintenanceMessage,
        },
      });
      const r = result(res, 'updateSiteSettings');
      notify(!!r?.success, r?.message || 'Could not save website settings.');
      void refetch();
    } catch {
      notify(false, 'Could not reach the server.');
    }
  };

  const toggle = (key: 'allowRegistration' | 'maintenanceMode', label: string, help: string) => (
    <label className="flex items-start justify-between gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 cursor-pointer">
      <span>
        <span className="block text-sm font-medium text-gray-900 dark:text-white">{label}</span>
        <span className="block text-xs text-gray-500 dark:text-gray-400">{help}</span>
      </span>
      <input
        type="checkbox"
        className="mt-1 h-5 w-5 accent-red-600"
        checked={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
      />
    </label>
  );

  return (
    <form onSubmit={(e) => void save(e)} className={`${card} p-4 sm:p-6 space-y-5`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Website settings</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Changes apply to every user right away.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="site-name">Website name</label>
        <input id="site-name" className={`${input} w-full`} value={form.siteName}
          onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="announcement">
          Announcement for all users
        </label>
        <textarea id="announcement" rows={3} className={`${input} w-full py-2`} value={form.announcement}
          placeholder="Shown as a banner on users' dashboard and CV editor. Leave empty to hide."
          onChange={(e) => setForm({ ...form, announcement: e.target.value })} />
        <div className="mt-2 flex gap-2">
          {(['info', 'success', 'warning'] as const).map((level) => (
            <button key={level} type="button"
              onClick={() => setForm({ ...form, announcementLevel: level })}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize ${
                form.announcementLevel === level ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}>
              {level}
            </button>
          ))}
        </div>
        {form.announcement.trim() && (
          <div className="mt-3"><AnnouncementBanner settings={form} preview /></div>
        )}
      </div>

      {toggle('allowRegistration', 'Allow new sign-ups', 'When off, the register page tells visitors sign-ups are closed.')}
      {toggle('maintenanceMode', 'Maintenance mode', 'When on, only administrators can sign in.')}

      {form.maintenanceMode && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="maint-msg">
            Maintenance message
          </label>
          <input id="maint-msg" className={`${input} w-full`} value={form.maintenanceMessage}
            onChange={(e) => setForm({ ...form, maintenanceMessage: e.target.value })} />
        </div>
      )}

      <button type="submit" disabled={saving}
        className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50">
        {saving ? 'Saving…' : 'Save website settings'}
      </button>
    </form>
  );
};

// ==================== Public: banner shown to users ====================

const BANNER_TONES: Record<string, string> = {
  info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800',
  success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800',
  warning: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800',
};

export const AnnouncementBanner: React.FC<{ settings?: SiteSettingsData | null; preview?: boolean }> = ({
  settings,
  preview = false,
}) => {
  const { data } = useQuery<{ siteSettings: SiteSettingsData }>(GET_SITE_SETTINGS, {
    skip: !!settings,
    fetchPolicy: 'cache-and-network',
  });
  const site = settings ?? data?.siteSettings;
  const text = site?.announcement?.trim();
  const key = `announcement-dismissed:${text ?? ''}`;
  const [dismissed, setDismissed] = useState(() => {
    try {
      return !preview && localStorage.getItem(key) === '1';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      setDismissed(!preview && localStorage.getItem(key) === '1');
    } catch {
      setDismissed(false);
    }
  }, [key, preview]);

  if (!text || dismissed) return null;
  return (
    <div role="status" className={`flex items-start justify-between gap-3 border px-4 py-3 text-sm ${preview ? 'rounded-lg' : ''} ${BANNER_TONES[site?.announcementLevel ?? 'info'] ?? BANNER_TONES.info}`}>
      <p className="whitespace-pre-line">{text}</p>
      {!preview && (
        <button
          type="button"
          className="shrink-0 font-medium underline"
          onClick={() => {
            try { localStorage.setItem(key, '1'); } catch { /* ignore */ }
            setDismissed(true);
          }}
        >
          Dismiss
        </button>
      )}
    </div>
  );
};
