document.addEventListener("DOMContentLoaded", () => {
    const todoInput = document.getElementById("todo-input");
    const addTaskButton = document.getElementById("add-task-btn");
    const todoList = document.getElementById("todo-list");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    tasks.forEach((task) => renderTasks(task));

    function addTask() {
        const taskText = todoInput.value.trim();
        if (taskText === "") return;

        const newTask = {
            id: Date.now(),
            text: taskText,
            isCompleted: false,
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks(newTask);
        todoInput.value = ""; // Clear input field
    }

    addTaskButton.addEventListener("click", addTask);

    todoInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            addTask();
        }
    });

    function renderTasks(task) {
        const li = document.createElement("li");
        li.setAttribute("data-id", task.id);
        if (task.isCompleted) li.classList.add("completed");
        li.innerHTML = `
            <span>${task.text}</span>
            <button>Delete</button>
        `;
        li.addEventListener("click", (e) => {
            if (e.target.tagName === "BUTTON") {
                e.stopPropagation(); // Prevent toggling completion
                const taskId = parseInt(li.getAttribute("data-id"));
                tasks = tasks.filter((t) => t.id !== taskId);
                li.remove();
                saveTasks();
                return;
            }
            // Toggle completion status
            const taskId = parseInt(li.getAttribute("data-id"));
            const taskIndex = tasks.findIndex((t) => t.id === taskId);
            if (taskIndex !== -1) {
                tasks[taskIndex].isCompleted = !tasks[taskIndex].isCompleted;
                li.classList.toggle("completed");
                saveTasks();
            }
        });
        todoList.appendChild(li);
    }

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }
});
