/**
 * Example JavaScript code for Moodle Exam Simulator
 * This demonstrates a simple web application with DOM manipulation
 */

// Wait for DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the task list application
    initTaskList();
});

/**
 * Initialize the task list application
 */
function initTaskList() {
    const taskInput = document.getElementById('taskInput');
    const addButton = document.getElementById('addTask');
    const taskList = document.getElementById('taskList');
    const clearButton = document.getElementById('clearTasks');
    
    // Add task when button is clicked
    addButton.addEventListener('click', function() {
        addTask(taskInput, taskList);
    });
    
    // Add task when Enter key is pressed
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask(taskInput, taskList);
        }
    });
    
    // Clear all tasks
    clearButton.addEventListener('click', function() {
        taskList.innerHTML = '';
        saveTasks([]);
    });
    
    // Load tasks from localStorage
    loadTasks(taskList);
}

/**
 * Add a new task to the list
 * @param {HTMLElement} input - The input element
 * @param {HTMLElement} list - The task list element
 */
function addTask(input, list) {
    const taskText = input.value.trim();
    
    if (taskText === '') {
        return;
    }
    
    // Create new task item
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';
    
    // Create task text
    const taskTextSpan = document.createElement('span');
    taskTextSpan.textContent = taskText;
    
    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '×';
    deleteButton.className = 'delete-task';
    deleteButton.addEventListener('click', function() {
        list.removeChild(taskItem);
        saveTasksFromList(list);
    });
    
    // Create complete button
    const completeButton = document.createElement('button');
    completeButton.textContent = '✓';
    completeButton.className = 'complete-task';
    completeButton.addEventListener('click', function() {
        taskTextSpan.classList.toggle('completed');
        saveTasksFromList(list);
    });
    
    // Append elements to task item
    taskItem.appendChild(completeButton);
    taskItem.appendChild(taskTextSpan);
    taskItem.appendChild(deleteButton);
    
    // Add task to list
    list.appendChild(taskItem);
    
    // Clear input
    input.value = '';
    
    // Save tasks to localStorage
    saveTasksFromList(list);
}

/**
 * Save tasks from the current list to localStorage
 * @param {HTMLElement} list - The task list element
 */
function saveTasksFromList(list) {
    const tasks = [];
    
    for (const taskItem of list.querySelectorAll('li')) {
        const taskText = taskItem.querySelector('span').textContent;
        const isCompleted = taskItem.querySelector('span').classList.contains('completed');
        
        tasks.push({
            text: taskText,
            completed: isCompleted
        });
    }
    
    saveTasks(tasks);
}

/**
 * Save tasks to localStorage
 * @param {Array} tasks - Array of task objects
 */
function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Load tasks from localStorage
 * @param {HTMLElement} list - The task list element
 */
function loadTasks(list) {
    const tasksJSON = localStorage.getItem('tasks');
    
    if (!tasksJSON) {
        return;
    }
    
    const tasks = JSON.parse(tasksJSON);
    
    for (const task of tasks) {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
        
        const taskTextSpan = document.createElement('span');
        taskTextSpan.textContent = task.text;
        
        if (task.completed) {
            taskTextSpan.classList.add('completed');
        }
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '×';
        deleteButton.className = 'delete-task';
        deleteButton.addEventListener('click', function() {
            list.removeChild(taskItem);
            saveTasksFromList(list);
        });
        
        const completeButton = document.createElement('button');
        completeButton.textContent = '✓';
        completeButton.className = 'complete-task';
        completeButton.addEventListener('click', function() {
            taskTextSpan.classList.toggle('completed');
            saveTasksFromList(list);
        });
        
        taskItem.appendChild(completeButton);
        taskItem.appendChild(taskTextSpan);
        taskItem.appendChild(deleteButton);
        
        list.appendChild(taskItem);
    }
}
