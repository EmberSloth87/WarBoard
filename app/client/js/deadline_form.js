class DeadlineEditor {
    constructor() {
        this.apiBase = 'http://127.0.0.1:5000/api';
        
        // ALGORITHM: Extract the deadline ID from the current browser URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.deadlineId = urlParams.get('id'); 
        
        this.tasks = []; // Stores our local copy of the task data
        
        this.init();
    }

    // ALGORITHM: Master initialization method that fetches data and binds all button listeners
    async init() {
        if (!this.deadlineId) {
            alert('No Deadline ID provided!');
            this.redirectHome();
            return;
        }

        await this.loadProjects();
        await this.loadDeadlineData();
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
    async loadDeadlineData() {
        const response = await fetch(`${this.apiBase}/due_dates/${this.deadlineId}`);
        const projects = await fetch(`${this.apiBase}/projects`).then(res => res.json());
        const deadline = await response.json();

        // Populate the main form fields
        document.getElementById('title').value = deadline.title || '';

        // ALGORITHM: Set the project dropdown to the correct value by querying for the project name using the project ID
        document.getElementById('task-project').value = projects.find(p => p.id === deadline.project_id)?.id || '';

        document.getElementById('deadline-time').value = deadline.time || '';

    }

    // ALGORITHM: Attach event listeners to the static form buttons and the dynamic task container
    bindEvents() {
        document.getElementById('details-form').addEventListener('submit', (e) => this.handleUpdateDeadline(e));
        document.getElementById('delete-deadline-btn').addEventListener('click', () => this.handleDeleteDeadline());
        
        // Find the cancel button (it's the only is-light button in the grouped field)
        const cancelBtn = document.querySelector('.field.is-grouped .button.is-light');
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.redirectHome());
    }

    // ALGORITHM: Gather form data, send PUT request for the block, and redirect
    async handleUpdateDeadline(e) {
        e.preventDefault(); // Stop the form from refreshing the page

        const updateData = {
            title: document.getElementById('title').value,
            time: document.getElementById('deadline-time').value,
            project_id: document.getElementById('task-project').value || null
        };

        if (!updateData.title) {
            alert('Title is required!');
            return;
        }
        else if (!updateData.time) {
            alert('Time is required!');
            return;
        }


        const response = await fetch(`${this.apiBase}/due_dates/${this.deadlineId}`, {
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
    async handleDeleteDeadline() {
        if (confirm('Are you sure you want to delete this deadline?')) {
            const response = await fetch(`${this.apiBase}/due_dates/${this.deadlineId}`, { method: 'DELETE' });
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
    new DeadlineEditor();
});