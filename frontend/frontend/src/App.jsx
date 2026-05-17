import { useEffect, useState } from "react";
import API from "./api";
import { motion } from "framer-motion";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  // GET TASKS
  const fetchTasks = async () => {
    try {
      const res = await API.get("/");
      setTasks(res.data);
    } catch (err) {
      console.log("Error:", err.message);
    }
  };

  // ADD TASK
  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await API.post("/", { title, completed: false });
      setTitle("");
      fetchTasks();
    } catch (err) {
      console.log("Add error:", err.message);
    }
  };

  // TOGGLE TASK
  const toggleTask = async (task) => {
    try {
      await API.put(`/${task._id}`, {
        completed: !task.completed,
      });
      fetchTasks();
    } catch (err) {
      console.log("Toggle error:", err.message);
    }
  };

  // DELETE TASK
  const deleteTask = async (id) => {
    try {
      await API.delete(`/${id}`);
      fetchTasks();
    } catch (err) {
      console.log("Delete error:", err.message);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="layout">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>⚡ Task Manager</h2>
        <p>Organize your tasks smartly</p>
      </div>

      {/* MAIN */}
      <div className="main">

        {/* TOP INPUT BAR */}
        <form className="topbar" onSubmit={addTask}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a new task..."
          />
          <button type="submit">Add</button>
        </form>

        {/* TASK GRID */}
        <div className="grid">
          {tasks.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No tasks yet 🚀</p>
          ) : (
            tasks.map((task) => (
              <motion.div
                key={task._id}
                className="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className={task.completed ? "text done" : "text"}
                  onClick={() => toggleTask(task)}
                >
                  {task.title}
                </div>

                <div className="actions">
                  <button onClick={() => toggleTask(task)}>
                    {task.completed ? "Undo" : "Done"}
                  </button>

                  <button onClick={() => deleteTask(task._id)}>
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
