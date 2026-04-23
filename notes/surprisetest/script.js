let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let currentFilter = 'all';

function debounce(fn, delay ) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

function save() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
    let taskInput     = document.getElementById('taskInput');
    let priorityInput = document.getElementById('priorityInput');
    let deadlineInput = document.getElementById('deadlineInput');

    let title    = taskInput.value.trim();
    let priority = priorityInput.value;
    let deadline = deadlineInput.value;

    if (title == '') {
        alert('Please enter a task name.');
        return;
    }

    let newTask = {
        id: Date.now(),
        title: title,
        priority: priority,
        deadline: deadline,
        completed: false
    };

    tasks.push(newTask);
    save();
    taskInput.value     = '';
    deadlineInput.value = '';

    debouncedRender();
}

function toggleComplete(id) {
    let task = tasks.find(t => t.id == id);
    if (task) {
        task.completed = !task.completed;
        save();
        debouncedRender();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id != id);
    save();
    debouncedRender();
}

function setFilter(filter) {
    currentFilter = filter;
    debouncedRender();
}

const priorityOrder = { High: 1, Medium: 2, Low: 3 };

function getVisible() {
    let list = [...tasks];

    if (currentFilter == 'completed') list = list.filter(t => t.completed);
    if (currentFilter == 'pending')   list = list.filter(t => !t.completed);

    let sortValue = document.getElementById('sortSelect').value;

    if (sortValue == 'priority') {
        list.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortValue == 'deadline') {
        list.sort((a, b) => {
            if (!a.deadline && !b.deadline) return 0;
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline) - new Date(b.deadline);
        });
    }

    return list;
}

function priorityBadge(priority) {
    const map = { High: 'bg-danger', Medium: 'bg-warning text-dark', Low: 'bg-success' };
    return `<span class="badge ${map[priority]}">${priority}</span>`;
}

function render() {
    let taskList       = document.getElementById('taskList');
    let totalCount     = document.getElementById('totalCount');
    let completedCount = document.getElementById('completedCount');
    let pendingCount   = document.getElementById('pendingCount');

    let list = getVisible();

    totalCount.textContent     = tasks.length;
    completedCount.textContent = tasks.filter(t => t.completed).length;
    pendingCount.textContent   = tasks.filter(t => !t.completed).length;


    if (list.length == 0) {
        taskList.innerHTML = '<p class="text-center text-muted">No tasks found.</p>';
        return;
    }


    taskList.innerHTML = list.map(task => {
        let cardClass = task.completed ? 'task-completed' : '';

        let deadlineTag = task.deadline
            ? `<small class="text-muted ms-2">📅 ${task.deadline}</small>`
            : '';

        let btnLabel = task.completed ? 'Undo' : 'Complete';

      return `
    <div class="card mb-2 ${cardClass}">
        <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
                <span class="task-title fw-semibold ${task.completed ? 'text-decoration-line-through text-muted' : ''}">${task.title}</span>
                ${priorityBadge(task.priority)}
                ${deadlineTag}
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-success btn-sm" onclick="toggleComplete(${task.id})">${btnLabel}</button>
                <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        </div>
    </div>
`;
    }).join('');
}

const debouncedRender = debounce(render, 300);

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('taskInput').addEventListener('keydown', (e) => {
        if (e.key == 'Enter') addTask();
    });
    render();
});