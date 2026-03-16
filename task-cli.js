#!/usr/bin/env node

/**
 * Task Tracker CLI
 * A simple command-line interface to track and manage tasks.
 * Tasks are stored in a local JSON file (tasks.json).
 */

const fs = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────

const TASKS_FILE = path.join(process.cwd(), 'tasks.json');

// ─── File Helpers ─────────────────────────────────────────────────────────────

/**
 * Load tasks from the JSON file.
 * Creates the file with an empty array if it doesn't exist.
 */
function loadTasks() {
  if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify([], null, 2), 'utf8');
    return [];
  }
  try {
    const raw = fs.readFileSync(TASKS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    console.error('Error: tasks.json is corrupted or contains invalid JSON.');
    process.exit(1);
  }
}

/**
 * Persist tasks array to the JSON file.
 */
function saveTasks(tasks) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}

// ─── ID Generator ─────────────────────────────────────────────────────────────

/**
 * Generate the next unique numeric ID based on existing tasks.
 */
function nextId(tasks) {
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map((t) => t.id)) + 1;
}

// ─── Commands ─────────────────────────────────────────────────────────────────

/**
 * Add a new task.
 * Usage: task-cli add "description"
 */
function addTask(description) {
  if (!description || description.trim() === '') {
    console.error('Error: Task description cannot be empty.');
    process.exit(1);
  }

  const tasks = loadTasks();
  const now = new Date().toISOString();
  const task = {
    id: nextId(tasks),
    description: description.trim(),
    status: 'todo',
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(task);
  saveTasks(tasks);
  console.log(`Task added successfully (ID: ${task.id})`);
}

/**
 * Update an existing task's description.
 * Usage: task-cli update <id> "new description"
 */
function updateTask(id, description) {
  if (!description || description.trim() === '') {
    console.error('Error: New description cannot be empty.');
    process.exit(1);
  }

  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    console.error(`Error: Task with ID ${id} not found.`);
    process.exit(1);
  }

  task.description = description.trim();
  task.updatedAt = new Date().toISOString();
  saveTasks(tasks);
  console.log(`Task ${id} updated successfully.`);
}

/**
 * Delete a task by ID.
 * Usage: task-cli delete <id>
 */
function deleteTask(id) {
  const tasks = loadTasks();
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    console.error(`Error: Task with ID ${id} not found.`);
    process.exit(1);
  }

  tasks.splice(index, 1);
  saveTasks(tasks);
  console.log(`Task ${id} deleted successfully.`);
}

/**
 * Update the status of a task.
 * @param {number} id - Task ID
 * @param {'todo'|'in-progress'|'done'} status - New status
 */
function markTask(id, status) {
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    console.error(`Error: Task with ID ${id} not found.`);
    process.exit(1);
  }

  task.status = status;
  task.updatedAt = new Date().toISOString();
  saveTasks(tasks);
  console.log(`Task ${id} marked as "${status}".`);
}

/**
 * List tasks, optionally filtered by status.
 * Usage: task-cli list [todo|in-progress|done]
 */
function listTasks(filter) {
  const VALID_FILTERS = ['todo', 'in-progress', 'done'];
  const tasks = loadTasks();

  let filtered = tasks;

  if (filter) {
    if (!VALID_FILTERS.includes(filter)) {
      console.error(
        `Error: Invalid filter "${filter}". Use one of: ${VALID_FILTERS.join(', ')}`
      );
      process.exit(1);
    }
    filtered = tasks.filter((t) => t.status === filter);
  }

  if (filtered.length === 0) {
    console.log(filter ? `No tasks with status "${filter}".` : 'No tasks found.');
    return;
  }

  // ── Pretty-print table ──────────────────────────────────────────────────
  const STATUS_ICONS = { todo: '○', 'in-progress': '◑', done: '●' };
  const STATUS_LABELS = { todo: 'todo', 'in-progress': 'in-progress', done: 'done' };

  // Calculate column widths
  const idWidth = Math.max(2, ...filtered.map((t) => String(t.id).length));
  const descWidth = Math.max(
    11,
    ...filtered.map((t) => t.description.length)
  );
  const statusWidth = 11;
  const dateWidth = 24;

  const pad = (str, len) => String(str).padEnd(len);
  const separator = `${'─'.repeat(idWidth + 2)}┼${'─'.repeat(descWidth + 2)}┼${'─'.repeat(statusWidth + 2)}┼${'─'.repeat(dateWidth + 2)}`;

  console.log(
    `  ${pad('ID', idWidth)}  │  ${pad('Description', descWidth)}  │  ${pad('Status', statusWidth)}  │  ${'Created At'}`
  );
  console.log(separator);

  for (const task of filtered) {
    const icon = STATUS_ICONS[task.status] || '?';
    const label = STATUS_LABELS[task.status] || task.status;
    const created = new Date(task.createdAt).toLocaleString();
    console.log(
      `  ${pad(task.id, idWidth)}  │  ${pad(task.description, descWidth)}  │  ${icon} ${pad(label, statusWidth - 2)}  │  ${created}`
    );
  }

  console.log(`\nTotal: ${filtered.length} task(s)`);
}

// ─── Help ─────────────────────────────────────────────────────────────────────

function showHelp() {
  console.log(`
Task Tracker CLI — manage your tasks from the command line

USAGE
  task-cli <command> [arguments]

COMMANDS
  add <description>              Add a new task
  update <id> <description>      Update a task's description
  delete <id>                    Delete a task
  mark-in-progress <id>          Mark a task as in-progress
  mark-done <id>                 Mark a task as done
  list [todo|in-progress|done]   List tasks (all or filtered by status)
  help                           Show this help message

EXAMPLES
  task-cli add "Buy groceries"
  task-cli update 1 "Buy groceries and cook dinner"
  task-cli delete 1
  task-cli mark-in-progress 1
  task-cli mark-done 1
  task-cli list
  task-cli list done
  task-cli list todo
  task-cli list in-progress
`);
}

// ─── Argument Parsing ─────────────────────────────────────────────────────────

/**
 * Parse and validate a task ID argument.
 * Exits with an error message if invalid.
 */
function parseId(raw, command) {
  const id = parseInt(raw, 10);
  if (isNaN(id) || id <= 0) {
    console.error(`Error: "${raw}" is not a valid task ID. IDs must be positive integers.`);
    process.exit(1);
  }
  return id;
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  switch (command) {
    case 'add': {
      if (args.length < 2) {
        console.error('Usage: task-cli add "Task description"');
        process.exit(1);
      }
      addTask(args[1]);
      break;
    }

    case 'update': {
      if (args.length < 3) {
        console.error('Usage: task-cli update <id> "New description"');
        process.exit(1);
      }
      updateTask(parseId(args[1], command), args[2]);
      break;
    }

    case 'delete': {
      if (args.length < 2) {
        console.error('Usage: task-cli delete <id>');
        process.exit(1);
      }
      deleteTask(parseId(args[1], command));
      break;
    }

    case 'mark-in-progress': {
      if (args.length < 2) {
        console.error('Usage: task-cli mark-in-progress <id>');
        process.exit(1);
      }
      markTask(parseId(args[1], command), 'in-progress');
      break;
    }

    case 'mark-done': {
      if (args.length < 2) {
        console.error('Usage: task-cli mark-done <id>');
        process.exit(1);
      }
      markTask(parseId(args[1], command), 'done');
      break;
    }

    case 'list': {
      listTasks(args[1]); // args[1] is optional filter
      break;
    }

    default: {
      console.error(`Error: Unknown command "${command}". Run "task-cli help" for usage.`);
      process.exit(1);
    }
  }
}

main();
