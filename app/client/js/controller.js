class WarBoardController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.isSelectingForDeadline = false;

        this.init();
    }

    async init() {
        const boardData = await this.model.getBoardData();
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
const app = new WarBoardController(new WarBoardModel(), new WarBoardView());