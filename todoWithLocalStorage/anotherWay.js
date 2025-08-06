document.addEventListener("DOMContentLoaded", () => {
    const todoInput = document.getElementById("todo-input");
    const addTaskButton = document.getElementById("add-task-btn");
    const todoList = document.getElementById("todo-list");

    let tasks = [];

    // Initialize app
    init();

    function init() {
        loadTasks();
        addEventListeners();
    }

    function addEventListeners() {
        addTaskButton.addEventListener("click", addTask);
        todoInput.addEventListener("keypress", keypressHandler);
    }

    function keypressHandler(event) {
        if (event.key === "Enter") {
            addTask();
        }
    }

    function addTask() {
        const taskText = todoInput.value.trim();
        if (!taskText) {
            showError("Please enter a task!");
            return;
        }

        const newTask = createTask(taskText);
        tasks.push(newTask);
        saveTasks();
        renderTask(newTask);
        clearInput();
    }

    function createTask(text) {
        return {
            id: Date.now(),
            text: text,
            isCompleted: false,
            createdAt: new Date().toISOString()
        };
    }
    
    function clearInput() {
        todoInput.value = "";
        todoInput.focus();
    }

    function showError(message) {
        todoInput.style.borderColor = "#e53e3e";
        todoInput.placeholder = message;
        setTimeout(() => {
            todoInput.style.borderColor = "";
            todoInput.placeholder = "Add a new task";
        }, 2000);
    }

    function renderTask(task) {
        const li = createTaskElement(task);
        attachTaskEventListeners(li);
        todoList.appendChild(li);
    }

    function createTaskElement(task) {
        const li = document.createElement("li");
        li.setAttribute("data-id", task.id);
        li.className = task.isCompleted ? "completed" : "";

        li.innerHTML = `
            <span class="task-text">${task.text}</span>
            <button class="delete-btn" aria-label="Delete task">Delete</button>
        `;

        return li;
    }

    function attachTaskEventListeners(li) {
        li.addEventListener("click", handleTaskClick);
    }

    function handleTaskClick(event) {
        const li = event.currentTarget;
        const taskId = parseInt(li.getAttribute("data-id"));
        if (event.target.classList.contains("delete-btn")) {
            event.stopPropagation();
            deleteTask(taskId, li);
        } else {
            toggleTaskCompletion(taskId, li);
        }
    }

    function deleteTask(taskId, li) {
        if (confirm("Are you sure you want to delete this task?")) {
            tasks = tasks.filter(task => task.id !== taskId);
            li.remove();
            saveTasks();
        }
    }

    function toggleTaskCompletion(taskId, li) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].isCompleted = !tasks[taskIndex].isCompleted;
            li.classList.toggle("completed");
            saveTasks();
        }
    }

    function saveTasks() {
        try {
            localStorage.setItem("tasks", JSON.stringify(tasks));
        } catch (error) {
            console.error("Error saving tasks to localStorage:", error);
            showError("Failed to save tasks. Please try again.");
        }
    }

    function loadTasks() {
        try {
            tasks = JSON.parse(localStorage.getItem("tasks")) || [];
            clearTaskList();
            tasks.forEach(task => renderTask(task));
        } catch (error) {
            console.error("Error loading tasks:", error);
            showError("Failed to load tasks. Please refresh the page.");
        }
    }

    function clearTaskList() {
        todoList.innerHTML = "";
    }

});