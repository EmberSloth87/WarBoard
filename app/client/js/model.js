class WarBoardModel {
    constructor() {
        this.apiBase = 'http://127.0.0.1:5000/api'; // The base URL for our Flask routes
    }

    // ALGORITHM: Fetch 14-day board data from the server
    async getBoardData() {
        const response = await fetch(`${this.apiBase}/board`);
        return await response.json();
    }

    // ALGORITHM: Fetch all projects for the sidebar and dropdowns
    async getProjects() {
        const response = await fetch(`${this.apiBase}/projects`);
        return await response.json();
    }

    // ALGORITHM: Send a new task to the server
    async addTask(taskData) {
        const response = await fetch(`${this.apiBase}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        return await response.json();
    }

    // ALGORITHM: Update task order in the DB after drag-and-drop
    async updateTaskOrder(taskId, newOrder) {
        return await fetch(`${this.apiBase}/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: newOrder })
        });
    }
}