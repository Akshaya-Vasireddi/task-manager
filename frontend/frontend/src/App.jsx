import { useEffect, useState, useRef } from "react";
import API from "./api";
import { motion, AnimatePresence } from "framer-motion";

// ─── Toast System ──────────────────────────────────────────────────────────────
let toastId = 0;
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = (message, type = "info") => {
    const id = ++toastId;
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
  };
  return { toasts, success: (m) => add(m, "success"), error: (m) => add(m, "error"), info: (m) => add(m, "info") };
}

// ─── Confetti ──────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ["#6ee7b7", "#a78bfa", "#f9a8d4", "#fcd34d", "#67e8f9", "#fb923c"];
function Confetti({ active }) {
  if (!active) return null;
  return (
    <div className="confetti-wrap" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.span
          key={i}
          className="confetti-piece"
          style={{
            left: `${10 + Math.random() * 80}%`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            width: Math.random() * 7 + 4,
            height: Math.random() * 7 + 4,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: 100 + Math.random() * 80,
            opacity: 0,
            rotate: Math.random() * 360,
            x: (Math.random() - 0.5) * 50,
          }}
          transition={{ duration: 0.7 + Math.random() * 0.5, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// ─── Priority config ───────────────────────────────────────────────────────────
const PRIORITIES = [
  { label: "High", cls: "pri-high", dot: "#f87171" },
  { label: "Med",  cls: "pri-med",  dot: "#fbbf24" },
  { label: "Low",  cls: "pri-low",  dot: "#34d399" },
];

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function isOverdue(d) {
  if (!d) return false;
  return new Date(d) < new Date(new Date().toDateString());
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, cls }) {
  return (
    <motion.div
      className={`stat-card ${cls}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <span className="stat-icon">{icon}</span>
      <motion.span
        className="stat-value"
        key={value}
        initial={{ scale: 1.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {value}
      </motion.span>
      <span className="stat-label">{label}</span>
    </motion.div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ filter }) {
  const map = {
    all:       { icon: "🚀", title: "Your workspace is empty", sub: "Add your first task above to begin." },
    completed: { icon: "🎉", title: "No completed tasks yet",  sub: "Finish a task and it'll appear here." },
    pending:   { icon: "✅", title: "All caught up!",           sub: "No pending tasks — nice work." },
  };
  const { icon, title, sub } = map[filter] || map.all;
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="empty-icon">{icon}</div>
      <p className="empty-title">{title}</p>
      <p className="empty-sub">{sub}</p>
    </motion.div>
  );
}

// ─── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, onToggle, onDelete, onEdit, confettiTarget }) {
  const [editing, setEditing]   = useState(false);
  const [editVal, setEditVal]   = useState(task.title);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef();

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editVal.trim() && editVal.trim() !== task.title) onEdit(task, editVal.trim());
    setEditing(false);
  };

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(() => onDelete(task._id), 280);
  };

  const pri = PRIORITIES.find((p) => p.label === task.priority) || null;

  return (
    <motion.div
      className={`task-card${task.completed ? " task-done" : ""}${deleting ? " task-deleting" : ""}`}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: deleting ? 0 : 1, y: 0, scale: deleting ? 0.92 : 1, x: deleting ? -30 : 0 }}
      exit={{ opacity: 0, scale: 0.93, x: -24 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <Confetti active={confettiTarget === task._id} />

      {/* Header row */}
      <div className="card-header">
        <button
          className={`check-btn${task.completed ? " checked" : ""}`}
          onClick={() => onToggle(task)}
          aria-label="toggle complete"
        >
          <motion.span animate={{ scale: task.completed ? [1.4, 1] : 1 }} transition={{ duration: 0.25 }}>
            {task.completed ? "✓" : ""}
          </motion.span>
        </button>

        {editing ? (
          <form onSubmit={handleEditSubmit} className="edit-form">
            <input
              ref={inputRef}
              className="edit-input"
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              onBlur={handleEditSubmit}
            />
          </form>
        ) : (
          <span
            className={`task-title${task.completed ? " done" : ""}`}
            onClick={() => onToggle(task)}
          >
            {task.title}
          </span>
        )}
      </div>

      {/* Meta row */}
      <div className="card-meta">
        {pri && (
          <span className={`priority-badge ${pri.cls}`}>
            <span className="pri-dot" style={{ background: pri.dot }} />
            {pri.label}
          </span>
        )}
        {task.dueDate && (
          <span className={`due-badge${isOverdue(task.dueDate) && !task.completed ? " due-overdue" : ""}`}>
            📅 {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="card-actions">
        <button
          className={`btn-action btn-toggle${task.completed ? " btn-undo" : " btn-done"}`}
          onClick={() => onToggle(task)}
        >
          {task.completed ? "↩ Undo" : "✓ Done"}
        </button>
        <button
          className="btn-action btn-edit"
          onClick={() => { setEditVal(task.title); setEditing(true); }}
          aria-label="Edit task"
        >
          ✏
        </button>
        <button className="btn-action btn-delete" onClick={handleDelete} aria-label="Delete task">
          🗑
        </button>
      </div>
    </motion.div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ filter, setFilter, total, completed, pending, theme, toggleTheme, mobileOpen, setMobileOpen }) {
  const navItems = [
    { key: "all",       label: "All Tasks",  icon: "◈", count: total },
    { key: "pending",   label: "Pending",    icon: "○", count: pending },
    { key: "completed", label: "Completed",  icon: "●", count: completed },
  ];

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`sidebar${mobileOpen ? " sidebar-open" : ""}`}>
        <div className="sidebar-logo">
          <span className="logo-mark">⚡</span>
          <span className="logo-text">TaskFlow</span>
        </div>

        <p className="sidebar-tagline">Organize smarter</p>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-item${filter === item.key ? " nav-active" : ""}`}
              onClick={() => { setFilter(item.key); setMobileOpen(false); }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              <span className="nav-count">{item.count}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? "☀ Light mode" : "☾ Dark mode"}
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tasks,      setTasks]      = useState([]);
  const [title,      setTitle]      = useState("");
  const [priority,   setPriority]   = useState("Med");
  const [dueDate,    setDueDate]    = useState("");
  const [filter,     setFilter]     = useState("all");
  const [search,     setSearch]     = useState("");
  const [loading,    setLoading]    = useState(true);
  const [confetti,   setConfetti]   = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme,      setTheme]      = useState(() => localStorage.getItem("tm-theme") || "dark");
  const toast = useToasts();

  // ── Theme ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("tm-theme", theme);
  }, [theme]);

  // ── FETCH TASKS ────────────────────────────────────────────────────────────
  const fetchTasks = async () => {
    try {
      const res = await API.get("/");
      setTasks(res.data);
    } catch (err) {
      console.log("Fetch Error:", err.message);
      toast.error("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  // ── ADD TASK ───────────────────────────────────────────────────────────────
  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await API.post("/", { title, completed: false, priority, dueDate: dueDate || null });
      setTitle("");
      setDueDate("");
      toast.success("Task added!");
      fetchTasks();
    } catch (err) {
      console.log("Add Error:", err.message);
      toast.error("Failed to add task.");
    }
  };

  // ── TOGGLE TASK ────────────────────────────────────────────────────────────
  const toggleTask = async (task) => {
    try {
      await API.put(`/${task._id}`, {
        title: task.title,
        completed: !task.completed,
        priority: task.priority,
        dueDate: task.dueDate,
      });
      if (!task.completed) {
        setConfetti(task._id);
        setTimeout(() => setConfetti(null), 1200);
        toast.success("Task completed! 🎉");
      } else {
        toast.info("Task reopened.");
      }
      fetchTasks();
    } catch (err) {
      console.log("Toggle Error:", err.message);
      toast.error("Failed to update task.");
    }
  };

  // ── DELETE TASK ────────────────────────────────────────────────────────────
  const deleteTask = async (id) => {
    try {
      await API.delete(`/${id}`);
      toast.success("Task deleted.");
      fetchTasks();
    } catch (err) {
      console.log("Delete Error:", err.message);
      toast.error("Failed to delete task.");
    }
  };

  // ── EDIT TASK ──────────────────────────────────────────────────────────────
  const editTask = async (task, newTitle) => {
    try {
      await API.put(`/${task._id}`, {
        title: newTitle,
        completed: task.completed,
        priority: task.priority,
        dueDate: task.dueDate,
      });
      toast.success("Task updated.");
      fetchTasks();
    } catch (err) {
      console.log("Edit Error:", err.message);
      toast.error("Failed to edit task.");
    }
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const total     = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending   = total - completed;
  const progress  = total === 0 ? 0 : Math.round((completed / total) * 100);

  const visible = tasks.filter((t) => {
    const matchFilter =
      filter === "all" ? true : filter === "completed" ? t.completed : !t.completed;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="layout">
      <Sidebar
        filter={filter}
        setFilter={setFilter}
        total={total}
        completed={completed}
        pending={pending}
        theme={theme}
        toggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="main">
        {/* Mobile topbar */}
        <div className="mobile-topbar">
          <button className="hamburger" onClick={() => setMobileOpen(true)} aria-label="open menu">
            ☰
          </button>
          <span className="mobile-logo">⚡ TaskFlow</span>
        </div>

        {/* Page header */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="page-title">
            {filter === "all" ? "All Tasks" : filter === "completed" ? "Completed" : "Pending"}
          </h2>
          <span className="page-date">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </span>
        </motion.div>

        {/* Stats row */}
        <div className="stats-row">
          <StatCard label="Total"     value={total}     icon="◈" cls="stat-total" />
          <StatCard label="Completed" value={completed} icon="●" cls="stat-done"  />
          <StatCard label="Pending"   value={pending}   icon="○" cls="stat-pend"  />
          <div className="stat-card stat-progress">
            <span className="stat-label">Progress</span>
            <span className="stat-value">{progress}%</span>
            <div className="mini-progress-track">
              <motion.div
                className="mini-progress-fill"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Add task form */}
        <motion.form
          className="task-form"
          onSubmit={addTask}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="form-row">
            <input
              className="form-input"
              type="text"
              placeholder="Add a new task…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <select
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {PRIORITIES.map((p) => (
                <option key={p.label} value={p.label}>{p.label} priority</option>
              ))}
            </select>
            <input
              className="form-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <motion.button
              type="submit"
              className="btn-add"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              + Add
            </motion.button>
          </div>
        </motion.form>

        {/* Search + filter toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
          <div className="filter-pills">
            {["all", "pending", "completed"].map((f) => (
              <button
                key={f}
                className={`filter-pill${filter === f ? " pill-active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Task grid */}
        {loading ? (
          <div className="loading-wrap">
            <motion.div
              className="spinner"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            />
            <span className="loading-text">Loading tasks…</span>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {visible.length === 0 ? (
              <EmptyState key="empty" filter={filter} />
            ) : (
              <motion.div className="task-grid" layout>
                {visible.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onEdit={editTask}
                    confettiTarget={confetti}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Toast stack */}
      <div className="toast-stack" aria-live="polite">
        <AnimatePresence>
          {toast.toasts.map((t) => (
            <motion.div
              key={t.id}
              className={`toast toast-${t.type}`}
              initial={{ opacity: 0, y: 30, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <span className="toast-dot" />
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
