const { Types } = require("mongoose");
// Enums
const Priority = require("../../src/enum/priority.enum");
const State = require("../../src/enum/state.enum");

const tasks = [
    {
        id: new Types.ObjectId(),
        title: "Task One",
        description: "Description for Task One",
        dueAt: "2026-01-01T00:00:00.000Z",
        priority: Priority.MEDIUM,
        state: State.OPEN
    },
    {
        id: new Types.ObjectId(),
        title: "Task Two",
        description: "Description for Task Two",
        dueAt: "2026-01-01T00:00:00.000Z",
        priority: Priority.LOW,
        state: State.IN_PROGRESS
    },
    {
        id: new Types.ObjectId(),
        title: "Task Three",
        description: "Description for Task Three",
        dueAt: "2026-01-01T00:00:00.000Z",
        priority: Priority.HIGH,
        state: State.OPEN
    }
];

module.exports = { tasks };