'use strict'

class WarBoardController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.isSelectingForDeadline = false;

        this.setupGlobalListeners();

        this.init();
    }

    // ALGORITHM: Listen for clicks on the entire board and filter for our specific buttons
    setupGlobalListeners() {
        document.addEventListener('click', (e) => {
            // EVALUATES: Does the click originate from or within the "Add Project" button?
            const addProjectBtn = e.target.closest('#addProjectBtn');
            if (addProjectBtn) {
                this.handleAddProject();
                return; // Exit early to prevent overlapping checks
            }

            // EVALUATES: Does the click originate from or within a "Delete Project" button?
            const deleteProjectBtn = e.target.closest('#deleteProjectBtn');
            if (deleteProjectBtn) {
                e.preventDefault();
                const projectId = deleteProjectBtn.dataset.id;
                this.model.deleteProject(projectId).then(() => {
                    // Remove the project from the UI
                    deleteProjectBtn.closest('.panel-block').remove();
                });
                return;
            }

            // EVALUATES: Does the click originate from or within an "Add Block" button?
            const addBlockBtn = e.target.closest('#addBlockBtn');
            if (addBlockBtn) {
                e.preventDefault();
                let date = addBlockBtn.dataset.date;
                date = date.replace(/-/g, '/'); // Convert "YYYY-MM-DD" to "YYYY/MM/DD" for Date parsing
                date = new Date(date).toISOString().split('T')[0]; // Normalize to "YYYY-MM-DD"
                this.handleAddBlock(date);
                return;
            }

            // EVALUATES: Does the click originate from or within an "Add Task" button?
            const addDeadlineBtn = e.target.closest('#addDeadlineBtn');
            if (addDeadlineBtn) {
                e.preventDefault();
                let date = addDeadlineBtn.dataset.date;
                date = date.replace(/-/g, '/'); // Convert "YYYY-MM-DD" to "YYYY/MM/DD" for Date parsing
                date = new Date(date).toISOString().split('T')[0]; // Normalize to "YYYY-MM-DD"
                this.handleAddDeadline(date);
                return;
            }
        });
    }

    async init() {
        this.model.deletePastInfo(); // Clear out old data on initialization
        
        const boardData = await this.model.getBoardData();
        const projectData = await this.model.getProjects();
        this.view.renderProjects(projectData);
        this.view.renderBoard(boardData);
        this.setupDragAndDrop();
    }

    // ALGORITHM: Initialize SortableJS on all task lists to handle reordering
    setupDragAndDrop() {
        document.querySelectorAll('.task-list').forEach(list => {
            new Sortable(list, {
                group: 'tasks',
                animation: 150,
                onEnd: (evt) => {
                    // Evaluates the new position index after the drop is completed
                    const taskId = evt.item.dataset.id;
                    const newIndex = evt.newIndex;
                    this.model.updateTaskOrder(taskId, newIndex);
                }
            });
        });
    }

    // ALGORITHM: Handle the "Add Project" button click by prompting for a name and sending it to the server
    handleAddProject() {
        console.log('Add Project button clicked');
        const projectName = prompt('Enter new project name:');
        if (projectName) {
            this.model.addProject({ name: projectName }).then(newProject => {
                // Update the UI to include the new project
                this.view.renderProjects([newProject]);
            });
        }
    }

    // ALGORITHM: Handle the "Add Block" button click by creating a new block with default values and sending it to the server
    async handleAddBlock(date) {
        console.log(`Add Block button for date ${date} clicked`);

        // Create focus block with default values. User will edit these in the block form after creation.
        const blockData = {
            title: "Focus Block",
            date: date,
            start_time: '00:00',
            duration: 60
        };
        this.model.addBlock(blockData).then(newBlock => {
            // Update the UI to include the new block
            this.view.renderBlocks([newBlock], this.view.getBlocksContainer(date));
        });       
    }

    async handleAddDeadline(date) {
        console.log(`Add Deadline button for date ${date} clicked`);

        const deadlineData = {
            title: "New Deadline",
            date: date,
            time: '23:59'
        };
        this.model.addDeadline(deadlineData).then(newDeadline => {
            // Update the UI to include the new block
            this.view.renderBlocks([newDeadline], this.view.getDeadlinesContainer(date));
        });       
    }

    // ALGORITHM: Handle clicks on tasks/projects specifically during deadline selection
    handleGlobalClick(e) {
        if (this.isSelectingForDeadline) {
            const target = e.target.closest('.selectable-item');
            if (target) {
                const id = target.dataset.id;
                const type = target.dataset.type;
                // Logic to finalize deadline creation would go here
                console.log(`Linking deadline to ${type} ID: ${id}`);
                this.isSelectingForDeadline = false;
                this.view.setSelectionMode(false);
            }
        }
    }

    
    
}

// Start the app
document.addEventListener('DOMContentLoaded', () => {
    const app = new WarBoardController(new WarBoardModel(), new WarBoardView());
});