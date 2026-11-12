const STORAGE_KEY = "todo.items";

/** Load todos from localStorage, tolerating missing or corrupt data. */
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.text === "string" &&
        typeof item.done === "boolean"
    );
  } catch {
    return [];
  }
}

/** Persist todos to localStorage; storage failures are non-fatal. */
function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // Ignore quota or privacy-mode errors and keep the app usable in memory.
  }
}

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const todoInput = document.getElementById("todo-input");
const todoForm = document.getElementById("todo-form");
const todoList = document.getElementById("todo-list");
const emptyMessage = document.getElementById("empty-message");
const todoCount = document.getElementById("todo-count");
const clearCompletedButton = document.getElementById("clear-completed");

let todos = loadTodos();

function render() {
  todoList.replaceChildren();

  for (const todo of todos) {
    const item = document.createElement("li");
    if (todo.done) item.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.setAttribute("aria-label", `Mark "${todo.text}" as ${todo.done ? "not done" : "done"}`);
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-button";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", `Remove "${todo.text}"`);
    removeButton.addEventListener("click", () => removeTodo(todo.id));

    item.append(checkbox, text, removeButton);
    todoList.append(item);
  }

  const remaining = todos.filter((todo) => !todo.done).length;
  todoCount.textContent = `${remaining} item${remaining === 1 ? "" : "s"} left`;
  emptyMessage.hidden = todos.length > 0;
  clearCompletedButton.hidden = !todos.some((todo) => todo.done);
}

function addTodo(text) {
  todos.push({ id: createId(), text, done: false });
  saveTodos(todos);
  render();
}

function toggleTodo(id) {
  const todo = todos.find((item) => item.id === id);
  if (!todo) return;
  todo.done = !todo.done;
  saveTodos(todos);
  render();
}

function removeTodo(id) {
  todos = todos.filter((item) => item.id !== id);
  saveTodos(todos);
  render();
}

function clearCompleted() {
  todos = todos.filter((todo) => !todo.done);
  saveTodos(todos);
  render();
}

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;
  addTodo(text);
  todoInput.value = "";
  todoInput.focus();
});

clearCompletedButton.addEventListener("click", clearCompleted);

render();
