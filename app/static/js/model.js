'use strict'

class WarBoardModel {
    constructor() {
        this.apiBase = '/api'; // The base URL for our Flask routes
    }

    async deletePastInfo() {
        const response = await fetch(`${this.apiBase}/cleanup`, {
            method: 'DELETE'
        });
        return await response.json();
    }

    // ALGORITHM: Fetch 14-day board data from the server
    async getBoardData() {
        const response = await fetch(`${this.apiBase}/board`);
        return await response.json();
    }

    async getDays() {
        const response = await fetch(`${this.apiBase}/days`);
        return await response.json();
    }

    // ALGORITHM: Fetch all projects for the sidebar and dropdowns
    async getProjects() {
        const response = await fetch(`${this.apiBase}/projects`);
        return await response.json();
    }

    // ALGORITHM: Update the order of projects after an arrow click
    async updateProjectOrder(projectId, newOrder) {
        return await fetch(`${this.apiBase}/projects/${projectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: newOrder })
        });
    }


    // ALGORITHM: Send a new project to the server
    async addProject(projectData) {
        const response = await fetch(`${this.apiBase}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });
        return await response.json();
    }

    async deleteProject(projectId) {
        const response = await fetch(`${this.apiBase}/projects/${projectId}`, {
            method: 'DELETE'
        });
        return await response.json();
    }

    async addBlock(blockData) {
        const response = await fetch(`${this.apiBase}/focus_blocks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(blockData)
        });
        return await response.json();
    }

    async deleteBlock(blockId) {
        const response = await fetch(`${this.apiBase}/focus_blocks/${blockId}`, {
            method: 'DELETE'
        });
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


    async addDeadline(deadlineData) {
        const response = await fetch(`${this.apiBase}/due_dates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deadlineData)
        });
        return await response.json();
    }
}