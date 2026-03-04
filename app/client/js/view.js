class WarBoardView {
    constructor() {
        this.board = document.getElementById('warboardColumns');
        this.projectList = document.getElementById('projectList');
    }

    // ALGORITHM: Render the 14 columns of the WarBoard
    renderBoard(days) {
        this.board.innerHTML = '';
        
        days.forEach(day => {
            const col = document.createElement('div');
            col.className = 'column is-narrow day-column'; // is-narrow allows horizontal scroll logic
            
            // Sort focus blocks chronologically by start_time
            const sortedBlocks = day.focus_blocks.sort((a, b) => 
                new Date(a.start_time) - new Date(b.start_time)
            );

            col.innerHTML = `
                <div class="box p-2">
                    <p class="heading">${new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                    <p class="title is-5">${day.date}</p>
                    <hr class="my-2">
                    <div class="focus-blocks-container">
                        ${this.renderBlocks(sortedBlocks)}
                    </div>
                </div>
            `;
            this.board.appendChild(col);
        });
    }

    // ALGORITHM: Create HTML for focus blocks and their tasks
    renderBlocks(blocks) {
        return blocks.map(block => `
            <div class="focus-block mb-3 p-2" data-id="${block.id}">
                <p class="has-text-weight-bold is-size-6">${block.title}</p>
                <div class="task-list" id="tasks-block-${block.id}">
                    ${block.tasks.map(t => `
                        <div class="tag is-info is-light my-1 selectable-item" data-type="task" data-id="${t.id}">
                            ${t.name} (${t.time_allocated}m)
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
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