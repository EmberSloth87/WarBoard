class ProjectEditor {
    constructor() {
        this.apiBase = 'http://127.0.0.1:5000/api';
        
        // ALGORITHM: Extract the project ID from the current browser URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.projectId = urlParams.get('id'); 
        
        this.tasks = []; // Stores our local copy of the task data
        
        this.init();
    }

    // ALGORITHM: Master initialization method that fetches data and binds all button listeners
    async init() {
        if (!this.projectId) {
            alert('No Project ID provided!');
            this.redirectHome();
            return;
        }

        await this.loadProjectData();
        this.bindEvents();
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
        //container.innerHTML = deadlines.map(d => `<p>${d.title}</p>`).join('');

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
            const deadlineElement = document.createElement('p');
            deadlineElement.textContent = `${deadline.title} - Due: ${deadline.date} ${deadline.time}`;
            deadlineDiv.appendChild(deadlineElement);
            container.appendChild(deadlineDiv);
        });

    }

    async renderTasks() {
        const response = await fetch(`${this.apiBase}/projects/${this.projectId}/tasks`);
        const tasks = await response.json();
        // Populate the tasks container
        const container = document.getElementById('associated-tasks-container');

        //container.innerHTML = tasks.map(t => `<p>${t.name}</p>`).join('');

        // ALGORITHM: Sort tasks by their due date (soonest first) before rendering. If two tasks have the same date, they will be sorted by their time in chronological order.
        tasks.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() === dateB.getTime()) {
                return new Date(a.time) - new Date(b.time);
            }
            return dateA.getTime() - dateB.getTime();
        });

        // ALGORITHM: Render each task as a box with its title and due date/time.
        tasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'box mb-2 p-3 is-flex is-align-items-center';
            const taskElement = document.createElement('p');
            taskElement.textContent = `${task.name}`;
            taskDiv.appendChild(taskElement);
            container.appendChild(taskDiv);
        });

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
        window.location.href = 'index.html'; 
    }
}

// Boot up the editor once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProjectEditor();
});