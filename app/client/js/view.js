'use strict'

class WarBoardView {
    constructor() {
        this.board = document.querySelector("#warboardColumns");
        this.projectList = document.querySelector("#projectList");
    }

    getProjectElement(projectId) {
        return this.projectList.querySelector(`.panel-block[data-id="${projectId}"]`);
    }

    getBlocksContainer(date) {
        const dayColumn = this.board.querySelector(`.day-column[data-date="${date}"]`);
        console.log('getBlocksContainer called with date:', date, 'Found dayColumn:', dayColumn);
        
        return dayColumn ? dayColumn.querySelector('.focus-blocks-container') : null;
    }

    getDeadlinesContainer(date) {
        const dayColumn = this.board.querySelector(`.day-column[data-date="${date}"]`);
        return dayColumn ? dayColumn.querySelector('.deadlines-container') : null;
    }

    // ALGORITHM: Render the 14 columns of the WarBoard
    renderBoard(days) {
        
        days.forEach(day => {
            const col = document.createElement('div');
            col.className = 'column is-narrow day-column'; // is-narrow allows horizontal scroll logic
            
            // Sort focus blocks chronologically by start_time
            let sortedBlocks = day.focus_blocks.sort((a, b) => 
                a.start_time.localeCompare(b.start_time)
            );

            // Sort deadlines chronologically by start_time
            let sortedDeadlines = day.due_dates.sort((a, b) => 
                a.time.localeCompare(b.time)
            );

            console.log('Rendering day:', day.date, 'with sorted blocks:', sortedBlocks);

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

            const noBlocksElement = document.createElement('p');
            if (!sortedBlocks || sortedBlocks.length === 0) {
                noBlocksElement.className = 'is-size-5 is-bold has-text-black-bis is-flex is-justify-content-center mt-4';
                noBlocksElement.textContent = 'No focus blocks scheduled';
            }

            const btnDiv = document.createElement('div');
            btnDiv.className = 'level is-mobile';

            const createBlockBtn = document.createElement('button');
            createBlockBtn.className = 'button is-small is-primary is-fullwidth';
            createBlockBtn.id = 'addBlockBtn'
            createBlockBtn.textContent = 'Add Focus Block';
            createBlockBtn.setAttribute('data-date', day.date);

            
            const deadlinesContainer = document.createElement('div');
            deadlinesContainer.className = 'deadlines-container mt-2';
            this.renderDeadlines(sortedDeadlines, deadlinesContainer);
            
            const createDeadlineBtn = document.createElement('button');
            createDeadlineBtn.className = 'button is-small is-primary is-fullwidth';
            createDeadlineBtn.id = 'addDeadlineBtn';
            createDeadlineBtn.textContent = 'Add Deadline';
            createDeadlineBtn.setAttribute('data-date', day.date);
            
            const noDeadlinesElement = document.createElement('p');
            if (!sortedDeadlines || sortedDeadlines.length === 0) {
                noDeadlinesElement.className = 'is-size-5 is-bold has-text-black-bis is-flex is-justify-content-center mt-4';
                noDeadlinesElement.textContent = 'No deadlines due';
            }
            
            
            btnDiv.appendChild(createBlockBtn);
            focusBlocksContainer.appendChild(btnDiv);

            
            focusBlocksContainer.appendChild(noBlocksElement);

            colContainer.appendChild(colHeading);
            colContainer.appendChild(dateElement);
            colContainer.appendChild(hrElement);
            colContainer.appendChild(focusBlocksContainer);

            deadlinesContainer.appendChild(createDeadlineBtn);
            deadlinesContainer.appendChild(noDeadlinesElement);

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
            
            const editBtn = document.createElement('a');
            editBtn.className = 'button is-small is-warning ml-2';
            editBtn.href = `project_form.html?id=${project.id}`;
            editBtn.id = 'editProjectBtn';
            editBtn.setAttribute('data-type', 'edit-project');
            editBtn.setAttribute('data-id', project.id);
            editBtn.textContent = 'Edit';

            projectDiv.appendChild(editBtn);
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
            titleElement.textContent = block.title || 'untitled'; // Fallback title if none provided

            // Grouping the Time and Duration tags together for a cleaner look
            const metaTags = document.createElement('div');
            metaTags.className = 'tags are-small';
        
            // EVALUATES: Converts the ISO timestamp into a human-readable 12-hour format
            const timeTag = document.createElement('span');
            timeTag.className = 'tag is-rounded is-light';
            const formattedTime = String(block.start_time).substring(0, 5); // Extracts HH:MM from the time string
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
            editLink.className = 'button is-small is-warning';
            editLink.innerHTML = '<span>Edit</span>';

            headerDiv.appendChild(titleSection);
            headerDiv.appendChild(editLink);

            const divider = document.createElement('hr');
            divider.className = 'my-1';

            // ALGORITHM: Create the task container with a subtle background to separate it from the header
            const tasksContainer = document.createElement('div');
            tasksContainer.className = 'task-list mt-2 pt-2 border-top-thin';
            tasksContainer.id = `tasks-block-${block.id}`;

            if (block.tasks && block.tasks.length > 0) {
                // Sort tasks by 'order' property before rendering
                block.tasks.sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(t => {
                    const taskDiv = document.createElement('div');
                    taskDiv.className = 'is-size-7 py-1 is-flex is-align-items-center selectable-item';
                    taskDiv.setAttribute('data-type', 'task');
                    taskDiv.setAttribute('data-id', t.id);
                
                    // Using a simple bullet point for a professional list appearance
                    const taskText = document.createElement('span');
                    taskText.className = 'ml-2 is-size-6';
                    taskText.textContent = t.name;

                    const taskProject = document.createElement('span');
                    taskProject.className = 'tag is-rounded is-info ml-2';
                    taskProject.textContent = t.project_id ? (this.getProjectElement(t.project_id)?.textContent || 'Unknown Project') : 'No Project';

                    const taskTime = document.createElement('span');
                    taskTime.className = 'tag is-rounded is-light ml-auto';
                    const taskDuration = `${t.time_allocated}m`;
                    taskTime.textContent = taskDuration;

                    
                    taskDiv.appendChild(taskProject);
                    taskDiv.appendChild(taskText);
                    taskDiv.appendChild(taskTime);
                    tasksContainer.appendChild(taskDiv);

                    tasksContainer.appendChild(divider.cloneNode()); // Add a divider between tasks for better separation
                });
            } else {
                const noTasksElement = document.createElement('p');
                noTasksElement.className = 'is-size-7 is-italic has-text-grey-light';
                noTasksElement.textContent = 'No tasks assigned';
                tasksContainer.appendChild(noTasksElement);
            }

            blockElement.appendChild(headerDiv);
            blockElement.appendChild(divider);
            blockElement.appendChild(tasksContainer);
            container.appendChild(blockElement);
        });
    }

    renderDeadlines(deadlines, container) {
        deadlines.forEach(deadline => {
            const deadlineElement = document.createElement('div');
            deadlineElement.className = 'deadline is-shadowless border-light';
            deadlineElement.setAttribute('data-type', 'deadline');
            deadlineElement.setAttribute('data-id', deadline.id);
            // deadlineElement.textContent = `${deadline.title} (Due: ${deadline.time ? deadline.time.substring(0, 5) : 'No time'})`;

            const line1 = document.createElement('div');
            line1.className = 'is-flex is-justify-content-space-between is-align-items-center mb-1';

            const line2 = document.createElement('div');
            line2.className = 'is-flex is-align-items-center';

            const projectElement = document.createElement('span');
            projectElement.className = 'tag is-rounded is-info mr-2';
            // ALGORITHM: Query for the project name using the project ID
            // Display the project name associated with the deadline, or a default message if none exists
            projectElement.textContent = deadline.project_id ? (this.getProjectElement(deadline.project_id)?.textContent || 'Unknown Project') : 'No Project';
            

            const titleElement = document.createElement('span');
            titleElement.className = 'has-text-weight-bold is-size-6 mb-1';
            titleElement.textContent = deadline.title || 'untitled'; // Fallback title if none provided

            const dueTimeElement = document.createElement('span');
            dueTimeElement.className = 'tag is-rounded is-light ml-2';
            const formattedDueTime = deadline.time ? deadline.time.substring(0, 5) : 'No time';
            dueTimeElement.textContent = `Due: ${formattedDueTime}`;

            const editButton = document.createElement('a');
            editButton.href = `deadline_form.html?id=${deadline.id}`;
            editButton.className = 'button is-small is-warning ml-auto';
            editButton.innerHTML = '<span>Edit</span>';

            const separator = document.createElement('div');
            separator.className = 'is-flex-grow-1'; // This will push the Edit button to the right while keeping the title and time on the left

            
            line1.appendChild(titleElement);
            line1.appendChild(separator);
            line1.appendChild(editButton);

            line2.appendChild(projectElement);
            line2.appendChild(dueTimeElement);

            deadlineElement.appendChild(line1);
            deadlineElement.appendChild(line2);
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