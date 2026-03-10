"""
Routes for the WarBoard app. 

This file defines the routes for the WarBoard app, which is a project management tool. 
The routes are defined using Flask's blueprint system, and they handle the various endpoints for the app, 
such as viewing the warboard, creating new projects, and managing tasks.

"""

from flask import Blueprint, jsonify, request
from datetime import date, datetime, timedelta
from app.server import db
from app.server.models import Day, FocusBlock, Task, Project, DueDate

# ALGORITHM: Initialize a Blueprint to group all API routes under the '/api' prefix
api_bp = Blueprint('api', __name__, url_prefix='/api')

# ==========================================
# BOARD VIEW ROUTE
# ==========================================

# ALGORITHM: Fetch 14 days of data starting from today and format it for the frontend
@api_bp.route('/board', methods=['GET'])
def get_board_view():
    today = datetime.today().date()
    end_date = today + timedelta(days=13) # ALGORITHM: Evaluates the exact date 13 days in the future to establish our 14-day view horizon

    # ALGORITHM: Evaluate if we have at least 14 days in the database starting from today, and if not, creates new Day records until we do. 
    # This ensures our board view always has a full 14-day window of data to work with, even if the user hasn't been using the app consistently.
    days_in_db = Day.query.filter(Day.date >= today, Day.date <= end_date).count()
    if days_in_db < 14:
        for i in range(14 - days_in_db, 14):
            new_day = Day(date=today + timedelta(days=i))
            db.session.add(new_day)
        db.session.commit()

    # ALGORITHM: Query the database for all days falling within our 14-day window
    days = Day.query.filter(Day.date >= today, Day.date <= end_date).order_by(Day.date).all()
    
    board_data = []
    
    # ALGORITHM: Iterate through each day and serialize its relationships into a Python dictionary
    for day in days:
        day_dict = {
            'id': day.id,
            'date': day.date.isoformat(),
            'focus_blocks': [],
            'due_dates': [{
                'id': dd.id, 
                'time': dd.time.isoformat() if dd.time else None, 
                'type': dd.due_date_type, 
                'task_id': dd.task_id, 
                'project_id': dd.project_id
            } for dd in day.due_dates]
        }
        
        # ALGORITHM: Iterate through focus blocks for the current day and serialize their tasks
        for block in day.focus_blocks:
            block_dict = {
                'id': block.id,
                'start_time': block.start_time.isoformat(),
                'duration': block.duration,
                'notes': block.notes,
                'tasks': []
            }
            
            # ALGORITHM: Iterate through tasks within the focus block, sorting them by their order value
            for task in sorted(block.tasks, key=lambda x: x.order or 0):
                block_dict['tasks'].append({
                    'id': task.id,
                    'name': task.name,
                    'time_allocated': task.time_allocated,
                    'order': task.order,
                    'project_id': task.project_id
                })
            
            day_dict['focus_blocks'].append(block_dict)
            
        board_data.append(day_dict)

    return jsonify(board_data), 200

# ==========================================
# PROJECT ROUTES
# ==========================================

# ==========================================
# DUE DATE ROUTES
# ==========================================

# ==========================================
# FOCUS BLOCK ROUTES
# ==========================================

# ALGORITHM: Parse incoming JSON data to create and save a new Focus Block
@api_bp.route('/focus_blocks', methods=['POST'])
def create_focus_block():
    data = request.get_json()
    
    if not data or 'day_id' not in data or 'start_time' not in data or 'duration' not in data: # Evaluates if the incoming payload is missing required fields
        return jsonify({'error': 'Missing required fields'}), 400
        
    try:
        start_time = datetime.fromisoformat(data['start_time'])
        new_block = FocusBlock(
            start_time=start_time,
            duration=data['duration'],
            notes=data.get('notes', ''),
            day_id=data['day_id']
        )
        
        db.session.add(new_block)
        db.session.commit()
        return jsonify({'message': 'Focus block created successfully', 'id': new_block.id}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ALGORITHM: Find an existing Focus Block by ID and update its attributes based on provided JSON data
@api_bp.route('/focus_blocks/<int:block_id>', methods=['PUT'])
def update_focus_block(block_id):
    block = FocusBlock.query.get_or_404(block_id)
    data = request.get_json()
    
    if 'duration' in data: # Evaluates if the user provided a new duration to update
        block.duration = data['duration']
    if 'notes' in data: # Evaluates if the user provided new notes to update
        block.notes = data['notes']
        
    db.session.commit()
    return jsonify({'message': 'Focus block updated successfully'}), 200

# ALGORITHM: Find a Focus Block by ID and remove it from the database
@api_bp.route('/focus_blocks/<int:block_id>', methods=['DELETE'])
def delete_focus_block(block_id):
    block = FocusBlock.query.get_or_404(block_id)
    db.session.delete(block)
    db.session.commit()
    return jsonify({'message': 'Focus block deleted successfully'}), 200

# ==========================================
# TASK ROUTES
# ==========================================

# ALGORITHM: Parse JSON data to create a new task, ensuring any provided due date is valid
@api_bp.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    
    if not data or 'name' not in data: # Evaluates if the payload is missing the required task name
        return jsonify({'error': 'Task name is required'}), 400
        
    new_task = Task(
        name=data['name'],
        time_allocated=data.get('time_allocated'),
        order=data.get('order', 0),
        project_id=data.get('project_id'),
        focus_block_id=data.get('focus_block_id')
    )
    
    db.session.add(new_task)
    db.session.commit()
    
    # ALGORITHM: Check if a due date was provided, validate it, and create the DueDate record
    if 'due_date' in data: # Evaluates if the user decided to attach a due date to this new task
        due_date_info = data['due_date']
        project_id = due_date_info.get('project_id')
        
        if not new_task.id and not project_id: # Evaluates if the due date is orphaned (has neither a task nor project attached), enforcing our strict rule
            db.session.rollback()
            return jsonify({'error': 'Due date must be associated with a task or project.'}), 400
            
        new_due_date = DueDate(
            time=datetime.strptime(due_date_info['time'], '%H:%M').time() if 'time' in due_date_info else None,
            due_date_type='task' if not project_id else 'both',
            task_id=new_task.id,
            project_id=project_id,
            day_id=due_date_info.get('day_id')
        )
        db.session.add(new_due_date)
        db.session.commit()
        
    return jsonify({'message': 'Task created successfully', 'id': new_task.id}), 201

# ALGORITHM: Handle task updates, specifically listening for reordering data
@api_bp.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    
    if 'name' in data: # Evaluates if the task name is being updated
        task.name = data['name']
    if 'order' in data: # Evaluates if the task is being reordered within its block
        task.order = data['order']
    if 'focus_block_id' in data: # Evaluates if the task is being moved to an entirely different focus block
        task.focus_block_id = data['focus_block_id']
        
    db.session.commit()
    return jsonify({'message': 'Task updated successfully'}), 200

# ALGORITHM: Find a Task by ID and remove it from the database
@api_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted successfully'}), 200