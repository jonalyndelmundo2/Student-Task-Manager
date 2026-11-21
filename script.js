
// =====================================
// 1. BASE CLASS
// =====================================

class Task {
    #title;
    #subject;
    #dueDate;
    #completed;

    constructor(title, subject, dueDate) {
        this.#title = title;
        this.#subject = subject;
        this.#dueDate = dueDate;
        this.#completed = false;
    }

    get id() {
        return this._id;
    }

    setId(id) {
        this._id = id;
    }

    get title() {
        return this.#title;
    }

    get subject() {
        return this.#subject;
    }

    get dueDate() {
        return this.#dueDate;
    }

    get completed() {
        return this.#completed;
    }

    update(title, subject, dueDate) {
        this.#title = title;
        this.#subject = subject;
        this.#dueDate = dueDate;
    }

    toggleComplete() {
        this.#completed = !this.#completed;
    }

    setCompleted(status) {
        this.#completed = status;
    }

    getDescription() {
        return "School Task";
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            subject: this.subject,
            dueDate: this.dueDate,
            completed: this.completed,
            type: this.getDescription()
        };
    }
}


// =====================================
// 2. INHERITANCE
// =====================================

class AssignmentTask extends Task {
    getDescription() {
        return "Assignment";
    }
}

class ExamTask extends Task {
    getDescription() {
        return "Exam";
    }
}


// =====================================
// 3. TASK MANAGER CLASS
// =====================================

class TaskManager {
    #tasks = [];

    constructor() {
        this.loadTasks();
    }

    addTask(task) {
        this.#tasks.push(task);
        this.saveTasks();
    }

    getTasks() {
        return [...this.#tasks];
    }

    findTask(id) {
        return this.#tasks.find(task => task.id === id);
    }

    editTask(id, title, subject, dueDate) {
        const task = this.findTask(id);

        if (task) {
            task.update(title, subject, dueDate);
            this.saveTasks();
        }
    }

    deleteTask(id) {
        this.#tasks = this.#tasks.filter(
            task => task.id !== id
        );

        this.saveTasks();
    }

    toggleTask(id) {
        const task = this.findTask(id);

        if (task) {
            task.toggleComplete();
            this.saveTasks();
        }
    }

    getStats() {
        return {
            total: this.#tasks.length,
            pending: this.#tasks.filter(
                task => !task.completed
            ).length,
            completed: this.#tasks.filter(
                task => task.completed
            ).length
        };
    }

    saveTasks() {
        localStorage.setItem(
            "studentTasks",
            JSON.stringify(this.#tasks)
        );
    }

    loadTasks() {
        const savedTasks = JSON.parse(
            localStorage.getItem("studentTasks") || "[]"
        );

        this.#tasks = savedTasks.map(data => {
            let task;

            if (data.type === "Exam") {
                task = new ExamTask(
                    data.title,
                    data.subject,
                    data.dueDate
                );
            } else {
                task = new AssignmentTask(
                    data.title,
                    data.subject,
                    data.dueDate
                );
            }

            task.setId(data.id);
            task.setCompleted(data.completed);

            return task;
        });
    }
}


// =====================================
// 4. CREATE TASK MANAGER
// =====================================

const manager = new TaskManager();

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const filterTasks = document.getElementById("filterTasks");

let editingId = null;


// =====================================
// 5. ADD AND EDIT TASKS
// =====================================

taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = document.getElementById("taskTitle").value.trim();
    const subject = document.getElementById("taskSubject").value.trim();
    const type = document.getElementById("taskType").value;
    const dueDate = document.getElementById("taskDate").value;

    if (!title || !subject || !dueDate) {
        alert("Please complete all fields.");
        return;
    }

    if (editingId !== null) {
        manager.editTask(editingId, title, subject, dueDate);
        editingId = null;
        document.getElementById("submitButton").textContent = "Add Task";
    } else {
        const task = type === "Exam"
            ? new ExamTask(title, subject, dueDate)
            : new AssignmentTask(title, subject, dueDate);

        task.setId(String(Date.now()));
        manager.addTask(task);
    }

    taskForm.reset();
    renderTasks();
});


// =====================================
// 6. DISPLAY TASKS
// =====================================

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function renderTasks() {
    const tasks = manager.getTasks();
    const filter = filterTasks.value;

    const filteredTasks = tasks.filter(task => {
        if (filter === "Pending") return !task.completed;
        if (filter === "Completed") return task.completed;
        return true;
    });

    taskList.innerHTML = "";

    if (filteredTasks.length === 0) {
        taskList.innerHTML =
            '<p class="empty-message">No tasks found.</p>';
    }

    filteredTasks.forEach(task => {
        const card = document.createElement("div");

        card.className = "task-card" +
            (task.completed ? " completed" : "");

        card.innerHTML = `
            <div>
                <h3>${escapeHTML(task.title)}</h3>
                <p>Subject: ${escapeHTML(task.subject)}</p>
                <p>Type: ${escapeHTML(task.getDescription())}</p>
                <p>Due Date: ${escapeHTML(task.dueDate)}</p>
                <p>Status: ${task.completed ? "Completed" : "Pending"}</p>
            </div>

            <div class="task-actions">
                <button class="complete-btn"
                    data-action="toggle" data-id="${escapeHTML(task.id)}">
                    ${task.completed ? "Undo" : "Complete"}
                </button>

                <button class="edit-btn"
                    data-action="edit" data-id="${escapeHTML(task.id)}">
                    Edit
                </button>

                <button class="delete-btn"
                    data-action="delete" data-id="${escapeHTML(task.id)}">
                    Delete
                </button>
            </div>
        `;

        taskList.appendChild(card);
    });

    updateStats();
}


// =====================================
// 7. UPDATE DASHBOARD
// =====================================

function updateStats() {
    const stats = manager.getStats();

    document.getElementById("totalTasks").textContent =
        stats.total;

    document.getElementById("pendingTasks").textContent =
        stats.pending;

    document.getElementById("completedTasks").textContent =
        stats.completed;
}


// =====================================
// 8. TASK BUTTON ACTIONS
// =====================================

taskList.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "toggle") {
        manager.toggleTask(id);
    }

    else if (action === "delete") {
        if (confirm("Are you sure you want to delete this task?")) {
            manager.deleteTask(id);

            if (editingId === id) {
                editingId = null;
                taskForm.reset();
                document.getElementById("submitButton").textContent = "Add Task";
            }
        }
    }

    else if (action === "edit") {
        const task = manager.findTask(id);

        if (!task) return;

        document.getElementById("taskTitle").value = task.title;
        document.getElementById("taskSubject").value = task.subject;
        document.getElementById("taskDate").value = task.dueDate;
        document.getElementById("taskType").value =
            task.getDescription();

        editingId = id;

        document.getElementById("submitButton").textContent =
            "Update Task";

        document.getElementById("taskTitle").focus();
    }

    renderTasks();
});


// =====================================
// 9. FILTER TASKS
// =====================================

filterTasks.addEventListener("change", renderTasks);


// =====================================
// 10. INITIAL DISPLAY
// =====================================

renderTasks();
