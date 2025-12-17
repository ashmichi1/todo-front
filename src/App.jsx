import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import TodoForm from './components/TodoForm.jsx';
import TodoList from './components/TodoList.jsx';
import { filterTasks } from './utils/filterUtils';

/* ================= BACKEND ================= */
const API_URL = 'https://backend-todo-1612.onrender.com/';

async function fetchTasks() {
  try {
    const res = await fetch(API_URL); // GET
    if (!res.ok) throw new Error('Error fetching tasks');
    return res.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

async function createTask(task) {
  try {
    const res = await fetch(API_URL, {
      // POST
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Error creating task');
    return res.json();
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
}

async function updateTask(id, data) {
  try {
    await fetch(`${API_URL}/${id}`, {
      // PATCH
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error updating task:', error);
  }
}

async function removeTask(id) {
  try {
    await fetch(`${API_URL}/${id}`, {
      // DELETE
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error removing task:', error);
  }
}
/* =========================================== */

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function App() {
  const [view, setView] = useState('register');
  const [user, setUser] = useLocalStorage('team:user', null);
  const [todos, setTodos] = useLocalStorage('team:todos', []);

  const [query, setQuery] = useState('');
  const [filterBy, setFilterBy] = useState('any');

  /* ====== GET ====== */
  useEffect(() => {
    fetchTasks().then(setTodos);
  }, []);

  /* ---------- REGISTRO ---------- */
  function handleRegisterSuccess() {
    setView('login');
  }

  /* ---------- LOGIN ---------- */
  function handleLogin(email, password) {
    const users = JSON.parse(localStorage.getItem('team:users')) || [];
    const validUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!validUser) {
      alert('Credenciales incorrectas');
      return;
    }

    setUser(validUser.email);
    setView('app');
  }

  function handleLogout() {
    setUser(null);
    setView('login');
  }

  /* ---------- POST ---------- */
  async function addTask({ text, author }) {
    const newTask = { text, author, completed: false };

    // Crear en backend y obtener el ID generado
    const createdTask = await createTask(newTask);

    if (createdTask) {
      setTodos((prev) => [createdTask, ...prev]);
    }
  }

  /* ---------- PATCH ---------- */
  function toggleTask(id) {
    const task = todos.find((t) => t.id === id);
    const newCompleted = !task?.completed;

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t))
    );

    updateTask(id, { completed: newCompleted });
  }

  /* ---------- DELETE ---------- */
  function deleteTask(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    removeTask(id);
  }

  /* ---------- PATCH ---------- */
  function editTask(id, newText) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: newText } : t))
    );

    updateTask(id, { text: newText });
  }

  const visibleTodos = useMemo(
    () => filterTasks(todos, query, filterBy),
    [todos, query, filterBy]
  );

  /* ---------- VISTAS ---------- */
  if (view === 'register') {
    return <Register onRegisterSuccess={handleRegisterSuccess} />;
  }

  if (view === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  if (view === 'app' && user) {
    return (
      <div className="min-h-screen bg-grayish p-6">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          {/* HEADER CON USUARIO Y LOGOUT */}
          <div className="mb-6 flex items-center justify-between border-b border-pink-200 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-pink-600">Mis Tareas</h1>
              <p className="text-sm text-gray-600">Usuario: <strong>{user}</strong></p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-400 text-white rounded-lg hover:bg-rose-500 transition"
            >
              Cerrar sesión
            </button>
          </div>

          {/* FILTROS */}
          <div className="mb-4 flex gap-3 bg-pink-50 p-4 rounded-xl">
            <input
              type="text"
              placeholder="Buscar tareas..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 p-2 rounded-lg border border-pink-200
                         focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="p-2 rounded-lg border border-pink-200
                         focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="any">Todas</option>
              <option value="completed">Completadas</option>
              <option value="pending">Pendientes</option>
            </select>
          </div>

          <TodoForm
            onAdd={addTask}
            currentUser={user}
          />

          <TodoList
            todos={visibleTodos}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={editTask}
          />
        </div>
      </div>
    );
  }

  return null;
}
