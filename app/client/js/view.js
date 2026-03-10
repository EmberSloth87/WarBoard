class WarBoardView {
    constructor() {
        this.board = document.querySelector("#warboardColumns");
        this.projectList = document.querySelector("#projectList");
    }

    // ALGORITHM: Render the 14 columns of the WarBoard
    renderBoard(days) {
        
        days.forEach(day => {
            const col = document.createElement('div');
            col.className = 'column is-narrow day-column'; // is-narrow allows horizontal scroll logic
            
            // Sort focus blocks chronologically by start_time
            const sortedBlocks = day.focus_blocks.sort((a, b) => 
                new Date(a.start_time) - new Date(b.start_time)
            );

            const colContainer = document.createElement('div');
            colContainer.className = 'box p-2';

            const colHeading = document.createElement('p');
            colHeading.className = 'heading';
            colHeading.textContent = new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' });

            const dateElement = document.createElement('p');
            dateElement.className = 'title is-5';
            dateElement.textContent = day.date;

            const hrElement = document.createElement('hr');
            hrElement.className = 'my-2';

            const focusBlocksContainer = document.createElement('div');
            focusBlocksContainer.className = 'focus-blocks-container';
            this.renderBlocks(sortedBlocks, focusBlocksContainer);

            colContainer.appendChild(colHeading);
            colContainer.appendChild(dateElement);
            colContainer.appendChild(hrElement);
            colContainer.appendChild(focusBlocksContainer);
            col.appendChild(colContainer);

            this.board.appendChild(col);
        });
    }

    // ALGORITHM: Create HTML for focus blocks and their tasks
    renderBlocks(blocks, container) {
        blocks.forEach(block => {
            const blockElement = document.createElement('div');
            blockElement.className = 'focus-block mb-3 p-2';
            blockElement.setAttribute('data-id', block.id);

            const titleElement = document.createElement('p');
            titleElement.className = 'has-text-weight-bold is-size-6';
            titleElement.textContent = block.title;

            const tasksContainer = document.createElement('div');
            tasksContainer.className = 'task-list';
            tasksContainer.id = `tasks-block-${block.id}`;

            block.tasks.forEach(t => {
                const taskElement = document.createElement('div');
                taskElement.className = 'tag is-info is-light my-1 selectable-item';
                taskElement.setAttribute('data-type', 'task');
                taskElement.setAttribute('data-id', t.id);
                taskElement.textContent = `${t.name} (${t.time_allocated}m)`;
                tasksContainer.appendChild(taskElement);
            });

            blockElement.appendChild(titleElement);
            blockElement.appendChild(tasksContainer);
            container.appendChild(blockElement);
        });
    }

    // ALGORITHM: Toggle the visual "Targeting Mode" for deadlines
    setSelectionMode(active) {
        const prompt = document.getElementById('selectionPrompt');
        if (active) {
            prompt.classList.remove('is-hidden');
            document.querySelectorAll('.selectable-item').forEach(el => el.classList.add('has-text-weight-bold', 'is-primary'));
        } else {
            prompt.classList.add('is-hidden');
            document.querySelectorAll('.selectable-item').forEach(el => el.classList.remove('has-text-weight-bold', 'is-primary'));
        }
    }
}