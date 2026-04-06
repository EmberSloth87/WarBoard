class FocusBlockEditor {
    constructor() {
        this.apiBase = '/api';
        
        // ALGORITHM: Extract the block ID from the URL Path (e.g., /api/focus-block-form/123)
        this.blockId = window.location.pathname.split('/').pop(); // Get the last segment of the path as the block ID
        
        this.tasks = []; // Stores our local copy of the task data

        this.projects = []; // Store projects for easy access when rendering tasks
        
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
        this.projects = projects; // Save for later use when rendering tasks
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
            const projectName = task.project_id ? `${this.projects.find(p => p.id === task.project_id)?.name || 'Unknown Project'}` : 'No Project';

            const projectNameElement = document.createElement('span');
            projectNameElement.className = 'tag is-spaced is-rounded is-info ml-2';
            projectNameElement.textContent = projectName;

            const taskNameElement = document.createElement('span');
            taskNameElement.className = 'has-text-weight-bold is-spaced';
            taskNameElement.textContent = task.name;

            const timeElement = document.createElement('span');
            timeElement.className = 'tag is-spaced is-rounded is-light ml-auto';
            timeElement.textContent = `${task.time_allocated} mins`;

            const operationsDiv = document.createElement('div');
            operationsDiv.className = 'is-flex is-align-items-center';

            const reorderDiv = document.createElement('div');
            reorderDiv.className = 'is-flex is-flex-direction-column mr-3';
            
            const moveUpBtn = document.createElement('button');
            moveUpBtn.type = 'button';
            moveUpBtn.className = 'button is-small is-light move-up-btn';
            moveUpBtn.dataset.index = index;
            moveUpBtn.textContent = '▲';

            const moveDownBtn = document.createElement('button');
            moveDownBtn.type = 'button';
            moveDownBtn.className = 'button is-small is-light move-down-btn mt-1';
            moveDownBtn.dataset.index = index;
            moveDownBtn.textContent = '▼';

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'button is-danger is-small delete-task-btn';
            deleteBtn.dataset.id = task.id;
            deleteBtn.textContent = 'X';

            reorderDiv.appendChild(moveUpBtn);
            reorderDiv.appendChild(moveDownBtn);
            operationsDiv.appendChild(reorderDiv);
            operationsDiv.appendChild(deleteBtn);

            taskBox.appendChild(projectNameElement);
            taskBox.appendChild(taskNameElement);
            taskBox.appendChild(timeElement);
            taskBox.appendChild(operationsDiv);

            container.appendChild(taskBox);
        });

        if (this.tasks.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'has-text-centered has-text-grey';
            emptyMessage.textContent = 'No tasks added yet. Use the form below to add your first task!';
            container.appendChild(emptyMessage);
        }
    }

    // ALGORITHM: Attach event listeners to the static form buttons and the dynamic task container
    bindEvents() {
        // ALGORITHM: Catch ALL submission attempts (clicks OR Enter key)
        const form = document.getElementById('details-form');

        document.getElementById('add-task-btn').addEventListener('click', (e) => {e.preventDefault(); this.handleAddTask(e)});
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
    async handleAddTask(e) {
        if (e) e.preventDefault();

        const nameInput = document.getElementById('task-name');
        const projectInput = document.getElementById('task-project');
        const durationInput = document.getElementById('task-duration');

        // ALGORITHM: Save the current block form data so we can restore it after the page refreshes from adding a task
        const savedData = {
            title: document.getElementById('title').value,
            start_time: document.getElementById('start_time').value,
            duration: document.getElementById('duration').value
        };

        if (!nameInput.value) {
            alert('Task name is required!');
            return;
        }

        const newTaskData = {
            name: nameInput.value,
            // EVALUATES: Converts the string ID from the input into an integer or null if empty
            project_id: projectInput.value ? parseInt(projectInput.value) : null, 
            time_allocated: parseInt(durationInput.value) || 0,
            focus_block_id: this.blockId,
            order: this.tasks.length 
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
            
            this.renderTasks();
            
            // Clear inputs for the next task
            nameInput.value = '';
            projectInput.value = '';
            durationInput.value = '';

            document.getElementById('title').value = savedData.title || '';

            document.getElementById('start_time').value = savedData.start_time || '';
        
            document.getElementById('duration').value = savedData.duration || '';
            
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
        window.location.href = '/'; // Redirect to the main board page (adjust if your homepage is different)
    }
}

// Boot up the editor once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new FocusBlockEditor();
});

