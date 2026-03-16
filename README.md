# Task-Tracker

A lightweight command-line tool to add, update, delete, and track the status of your tasks — no frameworks, no external dependencies. Tasks are persisted in a `tasks.json` file in your current working directory.
https://roadmap.sh/projects/task-tracker

---

## Requirements

- [Node.js](https://nodejs.org/) v14 or later

---

## Installation

### Option A — Run directly with Node

```bash
node task-cli.js <command> [arguments]
```

### Option B — Install globally as `task-cli`

```bash
# From the project directory:
npm install -g .

# Now you can use it anywhere:
task-cli <command> [arguments]
```

To uninstall:

```bash
npm uninstall -g task-cli
```

---

## Usage

```
task-cli <command> [arguments]
```

### Commands

| Command | Description |
|---|---|
| `add "description"` | Add a new task |
| `update <id> "description"` | Update a task's description |
| `delete <id>` | Delete a task |
| `mark-in-progress <id>` | Mark a task as in-progress |
| `mark-done <id>` | Mark a task as done |
| `list` | List all tasks |
| `list todo` | List only tasks with status `todo` |
| `list in-progress` | List only tasks in progress |
| `list done` | List only completed tasks |
| `help` | Show help message |

---

## Examples

```bash
# Add tasks
task-cli add "Buy groceries"
# → Task added successfully (ID: 1)

task-cli add "Write project report"
# → Task added successfully (ID: 2)

# Update a task
task-cli update 1 "Buy groceries and cook dinner"

# Mark tasks
task-cli mark-in-progress 2
task-cli mark-done 1

# List all tasks
task-cli list

# List filtered
task-cli list done
task-cli list in-progress
task-cli list todo

# Delete a task
task-cli delete 1
```

---

## Task Properties

Each task stored in `tasks.json` has the following fields:

| Field | Type | Description |
|---|---|---|
| `id` | number | Auto-incremented unique identifier |
| `description` | string | Short description of the task |
| `status` | string | One of: `todo`, `in-progress`, `done` |
| `createdAt` | ISO 8601 string | Timestamp when the task was created |
| `updatedAt` | ISO 8601 string | Timestamp when the task was last modified |

### Example `tasks.json`

```json
[
  {
    "id": 1,
    "description": "Buy groceries and cook dinner",
    "status": "done",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T14:00:00.000Z"
  },
  {
    "id": 2,
    "description": "Write project report",
    "status": "in-progress",
    "createdAt": "2025-01-15T11:00:00.000Z",
    "updatedAt": "2025-01-15T13:00:00.000Z"
  }
]
```

---

## Error Handling

The CLI handles common error cases gracefully:

- Adding a task with an empty description
- Updating or deleting a non-existent task ID
- Providing a non-numeric or invalid ID
- Using an unsupported `list` filter value
- Corrupted or invalid `tasks.json` content

---

## Project Structure

```
task-cli/
├── task-cli.js     # Main CLI application (zero dependencies)
├── package.json    # Project metadata and bin entry
├── README.md       # This file
└── tasks.json      # Auto-created on first use
```

---

