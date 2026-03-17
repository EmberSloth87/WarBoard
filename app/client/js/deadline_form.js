class FocusBlockEditor {
    constructor() {
        this.apiBase = 'http://127.0.0.1:5000/api';
        
        // ALGORITHM: Extract the block ID from the current browser URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.blockId = urlParams.get('id'); 
        
        this.tasks = []; // Stores our local copy of the task data
        
        this.init();
    }

    // ALGORITHM: Master initialization method that fetches data and binds all button listeners
    async init() {
        if (!this.blockId) {
            alert('No Focus Block ID provided!');
            this.redirectHome();
            return;
        }

        await this.loadProjects();
        await this.loadBlockData();
        this.bindEvents();
    }

    // ALGORITHM: Fetch projects from the API and populate the dropdown menu
    async loadProjects() {
        const response = await fetch(`${this.apiBase}/projects`);
        const projects = await response.json();
        
        const projectSelect = document.getElementById('task-project');
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            projectSelect.appendChild(option);
        });
    }

    // ALGORITHM: Fetch the specific focus block data and populate the form inputs
    async loadBlockData() {
        const response = await fetch(`${this.apiBase}/focus_blocks/${this.blockId}`);
        const block = await response.json();
        
        this.tasks = block.tasks || [];

        // Populate the main form fields
        document.getElementById('title').value = block.title || '';

        document.getElementById('start_time').value = block.start_time || '';
        
        document.getElementById('duration').value = block.duration || '';

        this.renderTasks();
    }

    // ALGORITHM: Generate the HTML for the task list, including reordering arrows and delete buttons
    renderTasks() {
        const container = document.getElementById('tasks-container');
        container.innerHTML = ''; // Clear existing tasks before rendering
        
        // Sort tasks by their order property before displaying
        this.tasks.sort((a, b) => a.order - b.order).forEach((task, index) => {
            const taskBox = document.createElement('div');
            taskBox.className = 'box mb-2 p-3 is-flex is-justify-content-space-between is-align-items-center';
            taskBox.dataset.id = task.id; // Store ID on the element for easy access later
            
            // Format project name gracefully if it doesn't exist
            const projectName = task.project_id ? `Project ID: ${task.project_id}` : 'No Project';

            taskBox.innerHTML = `
                <div>
                    <p class="is-size-7 has-text-grey">${projectName}</p>
                    <p class="has-text-weight-bold">${task.name}</p>
                    <p class="is-size-7">${task.time_allocated} mins</p>
                </div>
                <div class="is-flex is-align-items-center">
                    <div class="is-flex is-flex-direction-column mr-3">
                        <button type="button" class="button is-small is-light move-up-btn" data-index="${index}">▲</button>
                        <button type="button" class="button is-small is-light move-down-btn mt-1" data-index="${index}">▼</button>
                    </div>
                    <button type="button" class="button is-danger is-small delete-task-btn" data-id="${task.id}">X</button>
                </div>
            `;
            container.appendChild(taskBox);
        });
    }

    // ALGORITHM: Attach event listeners to the static form buttons and the dynamic task container
    bindEvents() {
        document.getElementById('add-task-btn').addEventListener('click', () => this.handleAddTask());
        document.getElementById('details-form').addEventListener('submit', (e) => this.handleUpdateBlock(e));
        document.getElementById('delete-focus-block-btn').addEventListener('click', () => this.handleDeleteBlock());
        
        // Find the cancel button (it's the only is-light button in the grouped field)
        const cancelBtn = document.querySelector('.field.is-grouped .button.is-light');
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.redirectHome());

        // Event Delegation for dynamically rendered task buttons
        document.getElementById('tasks-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-task-btn')) {
                this.handleDeleteTask(e.target.dataset.id);
            } else if (e.target.classList.contains('move-up-btn')) {
                this.handleReorder(parseInt(e.target.dataset.index), -1);
            } else if (e.target.classList.contains('move-down-btn')) {
                this.handleReorder(parseInt(e.target.dataset.index), 1);
            }
        });
    }

    // ALGORITHM: Gather task input data, POST to API, and re-render the list
    async handleAddTask() {
        const nameInput = document.getElementById('task-name');
        const projectInput = document.getElementById('task-project');
        const durationInput = document.getElementById('task-duration');

        if (!nameInput.value) {
            alert('Task name is required!');
            return;
        }

        const newTaskData = {
            name: nameInput.value,
            project_id: projectInput.value || null,
            time_allocated: parseInt(durationInput.value) || 0,
            focus_block_id: this.blockId,
            order: this.tasks.length // Place new task at the very end
        };

        const response = await fetch(`${this.apiBase}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTaskData)
        });

        if (response.ok) {
            const createdTask = await response.json();
            newTaskData.id = createdTask.id; 
            this.tasks.push(newTaskData); 
            
            // Clear inputs for the next task
            nameInput.value = '';
            projectInput.value = '';
            durationInput.value = '';
            
            this.renderTasks();
        }
    }

    // ALGORITHM: Send DELETE request to API and remove task from local array
    async handleDeleteTask(taskId) {
        // Double equals allows comparison between string dataset ID and integer model ID
        const taskIndex = this.tasks.findIndex(t => t.id == taskId); 
        
        if (taskIndex > -1) {
            await fetch(`${this.apiBase}/tasks/${taskId}`, { method: 'DELETE' });
            this.tasks.splice(taskIndex, 1); 
            this.renderTasks();
        }
    }

    // ALGORITHM: Swap task positions in the local array, then update the backend order for all tasks
    async handleReorder(index, direction) {
        const newIndex = index + direction;
        
        // Evaluates if the move is out of bounds (e.g., moving the first item up)
        if (newIndex < 0 || newIndex >= this.tasks.length) return; 

        // Swap the elements in our local array
        const temp = this.tasks[index];
        this.tasks[index] = this.tasks[newIndex];
        this.tasks[newIndex] = temp;

        // Update the 'order' property for every task to match their new array index
        this.tasks.forEach((task, i) => { task.order = i; });

        this.renderTasks(); // Instantly update the UI so it feels snappy to the user

        // Silently update the backend for all tasks so the database matches the screen
        for (const task of this.tasks) {
            await fetch(`${this.apiBase}/tasks/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: task.order })
            });
        }
    }

    // ALGORITHM: Gather form data, send PUT request for the block, and redirect
    async handleUpdateBlock(e) {
        e.preventDefault(); // Stop the form from refreshing the page

        const updateData = {
            title: document.getElementById('title').value,
            start_time: document.getElementById('start_time').value, // Only include if user provided a value
            duration: parseInt(document.getElementById('duration').value)
        };

        if (!updateData.title) {
            alert('Title is required!');
            return;
        }
        else if (!updateData.start_time) {
            alert('Start time is required!');
            return;
        }
        else if (!updateData.duration) {
            alert('Duration is required!');
            return;
        }


        const response = await fetch(`${this.apiBase}/focus_blocks/${this.blockId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            this.redirectHome();
        } else {
            alert('Failed to update the focus block. Please check your inputs.');
        }
    }

    // ALGORITHM: Send DELETE request for the entire block and redirect
    async handleDeleteBlock() {
        if (confirm('Are you sure you want to delete this focus block? All associated tasks will be lost!')) {
            const response = await fetch(`${this.apiBase}/focus_blocks/${this.blockId}`, { method: 'DELETE' });
            if (response.ok) {
                this.redirectHome();
            }
        }
    }

    // ALGORITHM: Act like a digital traffic cop and send the user back to the main board
    redirectHome() {
        window.location.href = 'index.html'; 
    }
}

// Boot up the editor once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new FocusBlockEditor();
});