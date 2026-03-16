'use strict'

class WarBoardView {
    constructor() {
        this.board = document.querySelector("#warboardColumns");
        this.projectList = document.querySelector("#projectList");
    }

    getBlocksContainer(date) {
        const dayColumn = this.board.querySelector(`.day-column[data-date="${date}"]`);
        return dayColumn ? dayColumn.querySelector('.focus-blocks-container') : null;
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

            const btnDiv = document.createElement('div');
            btnDiv.className = 'level is-mobile';

            const createBlockBtn = document.createElement('button');
            createBlockBtn.className = 'button is-small is-primary is-fullwidth';
            createBlockBtn.id = 'addBlockBtn'
            createBlockBtn.textContent = '+';
            createBlockBtn.setAttribute('data-date', day.date);

            
            const deadlinesContainer = document.createElement('div');
            deadlinesContainer.className = 'deadlines-container mt-2';
            this.renderDeadlines(day.due_dates, deadlinesContainer);
            
            
            btnDiv.appendChild(createBlockBtn);
            focusBlocksContainer.appendChild(btnDiv);

            colContainer.appendChild(colHeading);
            colContainer.appendChild(dateElement);
            colContainer.appendChild(hrElement);
            colContainer.appendChild(focusBlocksContainer);
            colContainer.appendChild(deadlinesContainer);
            col.appendChild(colContainer);

            this.board.appendChild(col);
        });
    }

    // ALGORITHM: Render the list of projects in the sidebar
    renderProjects(projects) {
        projects.forEach(project => {
            const projectDiv = document.createElement('div');
            projectDiv.className = 'panel-block is-clickable selectable-item';
            projectDiv.setAttribute('data-type', 'project');

            const projectElement = document.createElement('a');
            projectElement.className = 'panel-block is-clickable selectable-item';
            projectElement.setAttribute('data-type', 'project');
            projectElement.setAttribute('data-id', project.id);
            projectElement.textContent = project.name;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete is-small ml-2';
            deleteBtn.id = 'deleteProjectBtn';
            deleteBtn.setAttribute('data-type', 'delete-project');
            deleteBtn.setAttribute('data-id', project.id);
            
            projectDiv.appendChild(deleteBtn);
            projectDiv.appendChild(projectElement);
            this.projectList.appendChild(projectDiv);
        });
    }

    // ALGORITHM: Iterate through focus blocks and generate a structured, card-like UI for each
    renderBlocks(blocks, container) {
        container.innerHTML = ''; // Clear existing blocks to prevent duplication
    
        blocks.forEach(block => {
            const blockElement = document.createElement('div');
            // Added 'is-clickable' and 'has-shadow' for a better interactive feel
            blockElement.className = 'focus-block is-shadowless border-light'; 
            blockElement.setAttribute('data-id', block.id);

            // ALGORITHM: Create the header area containing the Title and the Edit button
            const headerDiv = document.createElement('div');
            headerDiv.className = 'is-flex is-justify-content-space-between is-align-items-start mb-2';

            const titleSection = document.createElement('div');
        
            const titleElement = document.createElement('p');
            titleElement.className = 'has-text-weight-bold is-size-6 mb-1';
            titleElement.textContent = block.title || "Untitled Block";

            // Grouping the Time and Duration tags together for a cleaner look
            const metaTags = document.createElement('div');
            metaTags.className = 'tags are-small';
        
            // EVALUATES: Converts the ISO timestamp into a human-readable 12-hour format
            const timeTag = document.createElement('span');
            timeTag.className = 'tag is-rounded is-light';
            const formattedTime = new Date(block.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            timeTag.textContent = formattedTime;

            const durationTag = document.createElement('span');
            durationTag.className = 'tag is-rounded is-light';
            durationTag.textContent = `${block.duration}m`;

            metaTags.appendChild(timeTag);
            metaTags.appendChild(durationTag);
            titleSection.appendChild(titleElement);
            titleSection.appendChild(metaTags);

            // ALGORITHM: Replace the 'X' delete button with an Edit button linked to the form
            const editLink = document.createElement('a');
            // Navigates to the form with the specific block ID in the URL
            editLink.href = `focus_block_form.html?id=${block.id}`; 
            editLink.className = 'button is-small is-primary is-outlined';
            editLink.innerHTML = '<span>Edit</span>';

            headerDiv.appendChild(titleSection);
            headerDiv.appendChild(editLink);

            // ALGORITHM: Create the task container with a subtle background to separate it from the header
            const tasksContainer = document.createElement('div');
            tasksContainer.className = 'task-list mt-2 pt-2 border-top-thin';
            tasksContainer.id = `tasks-block-${block.id}`;

            if (block.tasks && block.tasks.length > 0) {
                // Sort tasks by 'order' property before rendering
                block.tasks.sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(t => {
                    const taskElement = document.createElement('div');
                    taskElement.className = 'is-size-7 py-1 is-flex is-align-items-center selectable-item';
                    taskElement.setAttribute('data-type', 'task');
                    taskElement.setAttribute('data-id', t.id);
                
                    // Using a simple bullet point for a professional list appearance
                    taskElement.innerHTML = `<span class="has-text-grey-light mr-2">•</span> ${t.name}`;
                    tasksContainer.appendChild(taskElement);
                });
            } else {
                const noTasksElement = document.createElement('p');
                noTasksElement.className = 'is-size-7 is-italic has-text-grey-light';
                noTasksElement.textContent = 'No tasks assigned';
                tasksContainer.appendChild(noTasksElement);
            }

            blockElement.appendChild(headerDiv);
            blockElement.appendChild(tasksContainer);
            container.appendChild(blockElement);
        });
    }

    renderDeadlines(deadlines, container) {
        deadlines.forEach(deadline => {
            const deadlineElement = document.createElement('div');
            deadlineElement.className = 'notification is-warning is-light selectable-item';
            deadlineElement.setAttribute('data-type', 'deadline');
            deadlineElement.setAttribute('data-id', deadline.id);
            deadlineElement.textContent = `${deadline.name} (Due: ${new Date(deadline.due_time).toLocaleTimeString()})`;
            container.appendChild(deadlineElement);
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