document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');
    
    hamburger.addEventListener('click', function() {
        navList.classList.toggle('active');
    });
    
    // Close menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navList.classList.remove('active');
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ================ TO-DO LIST FUNCTIONALITY ================
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const filterOptions = document.querySelectorAll('.filter-option');
    const clearBtn = document.getElementById('clear-btn');
    
    // Task management state
    let tasks = [];
    let editingTaskIndex = null;
    
    // Load tasks from localStorage
    function loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        tasks = savedTasks ? JSON.parse(savedTasks) : [];
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Get current active filter
    function getCurrentFilter() {
        return document.querySelector('.filter-option.active').dataset.filter;
    }
    
    // Create task element
    function createTaskElement(task, index) {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';
        li.dataset.index = index;
        
        // Checkbox for task completion
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.className = 'task-checkbox';
        
        // Task text container
        const taskTextContainer = document.createElement('div');
        taskTextContainer.className = 'task-text-container';
        
        // Task text span (for display mode)
        const span = document.createElement('span');
        span.textContent = task.text;
        span.className = 'task-text';
        
        // Task edit input (for edit mode)
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = task.text;
        editInput.className = 'task-edit-input';
        editInput.style.display = 'none';
        
        // Action buttons container
        const actions = document.createElement('div');
        actions.className = 'task-actions';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✏️';
        editBtn.className = 'edit-btn';
        editBtn.title = 'Edit task';
        
        // Save button (hidden initially)
        const saveBtn = document.createElement('button');
        saveBtn.innerHTML = '✅';
        saveBtn.className = 'save-btn';
        saveBtn.style.display = 'none';
        saveBtn.title = 'Save changes';
        
        // Cancel button (hidden initially)
        const cancelBtn = document.createElement('button');
        cancelBtn.innerHTML = '❌';
        cancelBtn.className = 'cancel-btn';
        cancelBtn.style.display = 'none';
        cancelBtn.title = 'Cancel editing';
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.className = 'delete-btn';
        deleteBtn.title = 'Delete task';
        
        // Assemble the task element
        taskTextContainer.appendChild(span);
        taskTextContainer.appendChild(editInput);
        
        actions.appendChild(editBtn);
        actions.appendChild(saveBtn);
        actions.appendChild(cancelBtn);
        actions.appendChild(deleteBtn);
        
        li.appendChild(checkbox);
        li.appendChild(taskTextContainer);
        li.appendChild(actions);
        
        return li;
    }
    
    // Render tasks based on current filter
    function renderTasks() {
        todoList.innerHTML = '';
        const currentFilter = getCurrentFilter();
        
        tasks.forEach((task, index) => {
            if (
                (currentFilter === 'all') ||
                (currentFilter === 'active' && !task.completed) ||
                (currentFilter === 'completed' && task.completed)
            ) {
                const taskElement = createTaskElement(task, index);
                todoList.appendChild(taskElement);
            }
        });
        
        // Add event listeners to the newly created elements
        attachTaskEventListeners();
    }
    
    // Attach event listeners to task elements
    function attachTaskEventListeners() {
        // Checkbox listeners
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const index = parseInt(this.closest('li').dataset.index);
                toggleTaskCompletion(index);
            });
        });
        
        // Edit button listeners
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const li = this.closest('li');
                const index = parseInt(li.dataset.index);
                enterEditMode(li, index);
            });
        });
        
        // Save button listeners
        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const li = this.closest('li');
                const index = parseInt(li.dataset.index);
                saveTaskEdit(li, index);
            });
        });
        
        // Cancel button listeners
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const li = this.closest('li');
                exitEditMode(li);
            });
        });
        
        // Delete button listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.closest('li').dataset.index);
                deleteTask(index);
            });
        });
        
        // Double-click on task text to edit
        document.querySelectorAll('.task-text').forEach(span => {
            span.addEventListener('dblclick', function() {
                const li = this.closest('li');
                const index = parseInt(li.dataset.index);
                enterEditMode(li, index);
            });
        });
        
        // Handle enter key in edit input
        document.querySelectorAll('.task-edit-input').forEach(input => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const li = this.closest('li');
                    const index = parseInt(li.dataset.index);
                    saveTaskEdit(li, index);
                }
            });
            
            // Handle escape key in edit input
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    const li = this.closest('li');
                    exitEditMode(li);
                }
            });
        });
    }
    
    // Enter edit mode for a task
    function enterEditMode(li, index) {
        // If already editing another task, exit that edit mode first
        if (editingTaskIndex !== null && editingTaskIndex !== index) {
            const previousLi = document.querySelector(`li[data-index="${editingTaskIndex}"]`);
            if (previousLi) {
                exitEditMode(previousLi);
            }
        }
        
        editingTaskIndex = index;
        
        const span = li.querySelector('.task-text');
        const input = li.querySelector('.task-edit-input');
        const editBtn = li.querySelector('.edit-btn');
        const saveBtn = li.querySelector('.save-btn');
        const cancelBtn = li.querySelector('.cancel-btn');
        
        // Hide display elements, show edit elements
        span.style.display = 'none';
        input.style.display = 'block';
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline';
        cancelBtn.style.display = 'inline';
        
        // Focus and select the input text
        input.focus();
        input.select();
    }
    
    // Exit edit mode without saving
    function exitEditMode(li) {
        const span = li.querySelector('.task-text');
        const input = li.querySelector('.task-edit-input');
        const editBtn = li.querySelector('.edit-btn');
        const saveBtn = li.querySelector('.save-btn');
        const cancelBtn = li.querySelector('.cancel-btn');
        
        // Reset input value to original text
        const index = parseInt(li.dataset.index);
        input.value = tasks[index].text;
        
        // Show display elements, hide edit elements
        span.style.display = 'inline';
        input.style.display = 'none';
        editBtn.style.display = 'inline';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
        
        editingTaskIndex = null;
    }
    
    // Save edited task
    function saveTaskEdit(li, index) {
        const input = li.querySelector('.task-edit-input');
        const newText = input.value.trim();
        
        if (newText) {
            // Update task in array and save to localStorage
            tasks[index].text = newText;
            saveTasks();
            
            // Update the display text
            li.querySelector('.task-text').textContent = newText;
            
            // Exit edit mode
            exitEditMode(li);
        }
    }
    
    // Add new task
    window.addTask = function() {
        const taskText = todoInput.value.trim();
        
        if (taskText) {
            // Add new task to array
            tasks.push({
                text: taskText,
                completed: false
            });
            
            // Save and render
            saveTasks();
            todoInput.value = '';
            
            // Optimize: Instead of full re-render, just add the new task if it matches current filter
            const currentFilter = getCurrentFilter();
            if (currentFilter === 'all' || currentFilter === 'active') {
                const newIndex = tasks.length - 1;
                const taskElement = createTaskElement(tasks[newIndex], newIndex);
                todoList.appendChild(taskElement);
                attachTaskEventListeners();
            }
        }
    };
    
    // Toggle task completion
    function toggleTaskCompletion(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        
        const currentFilter = getCurrentFilter();
        if (currentFilter !== 'all') {
            // If we're filtering, we need to remove tasks that no longer match the filter
            renderTasks();
        } else {
            // If showing all tasks, just update the class
            const li = document.querySelector(`li[data-index="${index}"]`);
            if (li) {
                li.className = tasks[index].completed ? 'completed' : '';
            }
        }
    }
    
    // Delete task
    function deleteTask(index) {
        // Create a fade-out effect before removing
        const li = document.querySelector(`li[data-index="${index}"]`);
        if (li) {
            li.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            li.style.opacity = '0';
            li.style.transform = 'translateX(20px)';
            
            // Remove the element after animation
            setTimeout(() => {
                // Remove from array
                tasks.splice(index, 1);
                saveTasks();
                
                // Re-render all tasks to update indices
                renderTasks();
            }, 300);
        }
    }
    
    // Filter tasks
    function setupFilterListeners() {
        filterOptions.forEach(option => {
            option.addEventListener('click', function() {
                filterOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                renderTasks();
            });
        });
    }
    
    // Clear completed tasks
    function setupClearCompletedListener() {
        clearBtn.addEventListener('click', function() {
            // Filter out completed tasks
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderTasks();
        });
    }
    
    // Initialize To-Do list
    function initTodoList() {
        loadTasks();
        renderTasks();
        setupFilterListeners();
        setupClearCompletedListener();
        
        // Form submission
        todoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            window.addTask();
        });
    }
    
    // ================ OTHER FUNCTIONALITY ================
    
    // Form validation for contact form
    const contactForm = document.querySelector('#contact form');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        
        // Simple validation
        if (name && email && message) {
            // This would typically send the form data to a server
            alert(`Thank you for your message, ${name}! I'll get back to you soon.`);
            contactForm.reset();
        }
    });
    
    // Scroll reveal animation
    const revealElements = document.querySelectorAll('section, .about-grid, .skills-container, .hobbies-flex');
    
    function checkScroll() {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('revealed');
            }
        });
    }
    
    // Add reveal class to CSS
    const style = document.createElement('style');
    style.textContent = `
        section, .about-grid, .skills-container, .hobbies-flex {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        section.revealed, .about-grid.revealed, .skills-container.revealed, .hobbies-flex.revealed {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* To-Do List Styles */
        #todo-list li {
            display: flex;
            align-items: center;
            gap: 10px;
            transition: opacity 0.3s ease, transform 0.3s ease, background-color 0.3s ease;
        }
        
        .task-text-container {
            flex-grow: 1;
        }
        
        .task-edit-input {
            width: 100%;
            padding: 8px;
            border: 1px solid var(--primary-color);
            border-radius: 4px;
        }
        
        .task-actions {
            display: flex;
            gap: 5px;
        }
        
        .task-actions button {
            background: none;
            border: none;
            cursor: pointer;
            padding: 5px;
            font-size: 1rem;
            border-radius: 4px;
            transition: background-color 0.2s ease;
        }
        
        .task-actions button:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
    `;
    document.head.appendChild(style);
    
    // Check elements on load and scroll
    window.addEventListener('scroll', checkScroll);
    window.addEventListener('load', checkScroll);
    
    // Initialize the application
    initTodoList();
});
