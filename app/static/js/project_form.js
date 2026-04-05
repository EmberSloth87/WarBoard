class ProjectEditor {
    constructor() {
        this.apiBase = '/api';
        
        // ALGORITHM: Extract the project ID from the current browser URL parameters
        this.projectId = window.location.pathname.split('/').pop();
        
        this.tasks = []; // Stores our local copy of the task data

        this.deadlines = []; // Stores our local copy of the deadline data

        this.focusBlocks = []; // Stores our local copy of the focus block data
        
        this.init();
    }

    // ALGORITHM: Master initialization method that fetches data and binds all button listeners
    async init() {
        if (!this.projectId) {
            alert('No Project ID provided!');
            this.redirectHome();
            return;
        }

        this.deadlines = await this.fetchDeadlines();
        this.tasks = await this.fetchTasks();
        this.focusBlocks = await this.fetchFocusBlocks();

        await this.loadProjectData();
        this.bindEvents();
    }

    async fetchDeadlines() {
        const response = await fetch(`${this.apiBase}/projects/${this.projectId}/due_dates`);
        return await response.json();
    }

    async fetchTasks() {
        const response = await fetch(`${this.apiBase}/projects/${this.projectId}/tasks`);
        return await response.json();
    }

    async fetchFocusBlocks() {
        const response = await fetch(`${this.apiBase}/focus_blocks`);
        return await response.json();
    }

    // ALGORITHM: Fetch the specific project data and populate the form inputs
    async loadProjectData() {
        const response = await fetch(`${this.apiBase}/projects/${this.projectId}`);
        const project = await response.json();

        // Populate the main form fields
        document.getElementById('name').value = project.name || '';
        document.getElementById('description').value = project.description || '';

        // Load associated deadlines and tasks
        await this.renderDeadlines();
        await this.renderTasks();

    }

    async renderDeadlines() {
        const response = await fetch(`${this.apiBase}/projects/${this.projectId}/due_dates`);
        const deadlines = await response.json();
        // Populate the deadlines container
        const container = document.getElementById('associated-deadlines-container');

        // ALGORITHM: Sort deadlines by their due date (soonest first) before rendering. If two deadlines have the same date, they will be sorted by their time in chronological order.
        deadlines.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() === dateB.getTime()) {
                return new Date(a.time) - new Date(b.time);
            }
            return dateA.getTime() - dateB.getTime();
        });

        // ALGORITHM: Render each deadline as a box with its title and due date/time.
        deadlines.forEach(deadline => {
            const deadlineDiv = document.createElement('div');
            deadlineDiv.className = 'box mb-2 p-3 is-flex is-align-items-center';
            
            const deadlineDateTimeElement = document.createElement('span');
            deadlineDateTimeElement.className = 'tag is-spaced is-rounded is-light ml-auto';
            deadlineDateTimeElement.textContent = `${deadline.date} ${deadline.time}`;

            const deadlineTitleElement = document.createElement('p');
            deadlineTitleElement.className = 'has-text-weight-bold';
            deadlineTitleElement.textContent = deadline.title;

            
            deadlineDiv.appendChild(deadlineTitleElement);
            deadlineDiv.appendChild(deadlineDateTimeElement);

            container.appendChild(deadlineDiv);
        });

        if (deadlines.length === 0) {
            const noDeadlinesElement = document.createElement('p');
            noDeadlinesElement.textContent = 'No deadlines associated with this project.';
            container.appendChild(noDeadlinesElement);
        }

    }

    async renderTasks() {
        const response = await fetch(`${this.apiBase}/projects/${this.projectId}/tasks`);
        const tasks = await response.json();
        // Populate the tasks container
        const container = document.getElementById('associated-tasks-container');

        // ALGORITHM: Sort tasks by their due date (soonest first) before rendering. If two tasks have the same date, they will be sorted by their time in chronological order.
        tasks.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() === dateB.getTime()) {
                return new Date(a.time) - new Date(b.time);
            }
            return dateA.getTime() - dateB.getTime();
        });

        // ALGORITHM: Render each task as a box with its title and focus block information (date and time) and order within the focus block.
        tasks.forEach(task => {
            // ALGORITHM: For each task, find the associated focus block to display its date and time. If the focus block is missing (which shouldn't happen), display "No Focus Block".
            const focusBlock = this.focusBlocks.find(fb => fb.id === task.focus_block_id);

            const focusBlockNameElement = document.createElement('span');
            focusBlockNameElement.className = 'tag is-spaced is-rounded is-info ml-2';
            focusBlockNameElement.textContent = focusBlock ? focusBlock.title : 'No Focus Block';

            const focusBlockDateTimeElement = document.createElement('span');
            focusBlockDateTimeElement.className = 'tag is-spaced is-rounded is-light ml-2';
            focusBlockDateTimeElement.textContent = focusBlock ? `${focusBlock.date} ${focusBlock.start_time}` : '';

            const focusBlockOrderElement = document.createElement('span');
            focusBlockOrderElement.className = 'tag is-spaced is-rounded is-light ml-2';
            focusBlockOrderElement.textContent = focusBlock ? `Task #${task.order}` : '';

            const taskDiv = document.createElement('div');
            taskDiv.className = 'box mb-2 p-3 is-flex is-align-items-center';
            const taskElement = document.createElement('p');
            taskElement.textContent = `${task.name}`;

            taskDiv.appendChild(focusBlockNameElement);
            if (focusBlock) {
                taskDiv.appendChild(focusBlockDateTimeElement);
                taskDiv.appendChild(focusBlockOrderElement);
            }
            
            taskDiv.appendChild(taskElement);

            container.appendChild(taskDiv);
        });

        if (tasks.length === 0) {
            const noTasksElement = document.createElement('p');
            noTasksElement.textContent = 'No tasks associated with this project.';
            container.appendChild(noTasksElement);
        }

    }

    // ALGORITHM: Attach event listeners to the static form buttons and the dynamic task container
    bindEvents() {
        document.getElementById('details-form').addEventListener('submit', (e) => this.handleUpdateProject(e));
        document.getElementById('delete-project-btn').addEventListener('click', () => this.handleDeleteProject());
        
        // Find the cancel button (it's the only is-light button in the grouped field)
        const cancelBtn = document.querySelector('.field.is-grouped .button.is-light');
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.redirectHome());
    }

    // ALGORITHM: Gather form data, send PUT request for the block, and redirect
    async handleUpdateProject(e) {
        e.preventDefault(); // Stop the form from refreshing the page

        const updateData = {
            name: document.getElementById('name').value.trim(),
            description: document.getElementById('description').value.trim()
        };

        if (!updateData.name) {
            alert('Name is required!');
            return;
        }


        const response = await fetch(`${this.apiBase}/projects/${this.projectId}`, {
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
    async handleDeleteProject() {
        if (confirm('Are you sure you want to delete this project?')) {
            const response = await fetch(`${this.apiBase}/projects/${this.projectId}`, { method: 'DELETE' });
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
    new ProjectEditor();
});