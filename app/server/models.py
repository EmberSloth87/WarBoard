from datetime import datetime
from app.server import db

'''
Models for WarBoard app

* Day: Represents a single day on the warboard, with a date and optional notes.
* Focus Block: Represents a block of focused work time, with a start and end time, and optional notes.
* Task: Represents a task or project, with a name, associated project, and time allocated to it.
* Project: Represents a project, with a name and optional description.
* Due Date: Represents a due date for a task or project, with a date, and time.

'''

class Day(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, unique=True)

    focus_blocks = db.relationship('FocusBlock', backref='day', lazy=True)
    due_dates = db.relationship('DueDate', backref='day', lazy=True)

    '''
    Focus blocks are created within a day, and multiple focus blocks can be associated with a single day. 
    The backref allows us to access the day from a focus block, 
    and lazy loading means the focus blocks will be loaded from the database when accessed, 
    rather than all at once when the day is loaded.
    '''


class FocusBlock(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # Duration in minutes
    notes = db.Column(db.Text)

    date = db.Column(db.Date, db.ForeignKey('day.date'), nullable=False)

    tasks = db.relationship('Task', backref='focus_block', lazy=True)

    '''
    Tasks are created within a focus block, and multiple tasks can be associated with a single focus block. 
    The backref allows us to access the focus block from a task, 
    and lazy loading means the tasks will be loaded from the database when accessed, 
    rather than all at once when the focus block is loaded.
    '''


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    time_allocated = db.Column(db.Integer)  # Time in minutes

    order = db.Column(db.Integer, nullable=True)  # Order of the task within the focus block

    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=True)
    due_date = db.relationship('DueDate', backref='task', uselist=False)
    focus_block_id = db.Column(db.Integer, db.ForeignKey('focus_block.id'), nullable=True)

    '''
    A task can be associated with a project, but it is not required.
    A task can be associated with a focus block, but it is not required.
    A task can have a due date, but it is not required.
    This allows for flexibility in how tasks are organized and tracked.

    If a task is associated with a focus block, it will be displayed within that block on the warboard.
    If a task is associated with a project, it can be grouped with other tasks from the same project for better organization and tracking.
    If a task is not associated with a focus block, it can still be tracked and managed independently, and may be displayed in a separate section of the warboard for unscheduled tasks.
    If a task is not associated with a project, it can still be tracked and managed independently, and may be listed as a general task.
    '''


class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)


    tasks = db.relationship('Task', backref='project', lazy=True)
    due_dates = db.relationship('DueDate', backref='project', lazy=True)

    '''
    Projects can have multiple tasks associated with them, and multiple due dates associated with them.
    The backref allows us to access the project from a task or due date, 
    and lazy loading means the tasks and due dates will be loaded from the database when accessed, 
    rather than all at once when the project is loaded.

    Projects can be used to group related tasks together, and to track progress towards larger goals.
    Due dates can be associated with projects to help track deadlines and milestones.
    
    A one-to-many relationship is established between projects and tasks, and between projects and due dates,
    meaning that each project can have multiple tasks and due dates, but each task and due date is associated with only one project.

    '''

class DueDate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.Time)

    due_date_type = db.Column(db.String(20), nullable=False)  # 'task' or 'project'

    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=True)
    day_id = db.Column(db.Integer, db.ForeignKey('day.id'), nullable=True)

    '''
    A due date can be associated with a task, a project, or both.
    This allows for flexibility in how deadlines are tracked and managed.
    If a due date is associated with a task, it will be displayed on the warboard in relation to that task.
    If a due date is associated with a project, it can be used to track deadlines and milestones for the project as a whole, 
    and may be displayed in a separate section of the warboard for project deadlines.

    A due date can be associated with both a task and a project, allowing for more specific tracking of 
    deadlines in relation to both the individual task and the larger project it is part of.

    A due date must be associated with at least one of either a task or a project, 
    ensuring that all due dates are relevant to the work being tracked on the warboard.
    '''


