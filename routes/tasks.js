const express = require('express');
const router = express.Router();
const Task = require('../models/task'); // Assuming you have a Task model

// Get all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a specific task by ID
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new task
router.post('/', async (req, res) => {
    try {
        const { title, description, body, todoList, isPinned } = req.body;
        const userId = req.userId; // Retrieve userId from verified token

        const newTask = new Task({
            title,
            description,
            body,
            todoList,
            isPinned,
            user: userId // Assign userId to the user field
        });

        const savedTask = await newTask.save();
        res.json(savedTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a task by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Add a new todo to a task
router.post('/:id/todos', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const { title, isComplete } = req.body;
        const newTodo = { title, isComplete };

        task.todoList.push(newTodo);
        await task.save();

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a todo in a task
router.put('/:id/todos/:todoIndex', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const { todoIndex } = req.params;
        const { title, isComplete } = req.body;

        // Ensure todoIndex is a valid number
        const index = parseInt(todoIndex);

        if (index >= 0 && index < task.todoList.length) {
            task.todoList[index].title = title;
            task.todoList[index].isComplete = isComplete;

            await task.save();
            res.json(task);
        } else {
            res.status(404).json({ message: 'Todo not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a todo from a task
// Delete a todo from a task
router.delete('/:taskId/todos/:index', async (req, res) => {
    try {
        const { taskId, index } = req.params;

        // Find the task by taskId and then find and delete the todo by index
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Ensure index is a valid number
        const todoIndex = parseInt(index);

        // Check if todoIndex is valid
        if (todoIndex >= 0 && todoIndex < task.todoList.length) {
            // Remove the todo from the task's todoList array by index
            task.todoList.splice(todoIndex, 1);
            await task.save();

            res.json(task);
        } else {
            res.status(404).json({ message: 'Todo not found' });
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = router;
