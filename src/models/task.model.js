const mongoose = require('mongoose');
const Priority = require('../enum/priority.enum');
const State = require('../enum/state.enum');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueAt: { type: Date, required: true },
    priority: { type: Priority, default: Priority.MEDIUM },
    state: { type: State, default: State.OPEN },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: { type: [mongoose.Schema.Types.ObjectId], ref: 'Tag', default: [] }
}, {timestamps: true});

module.exports = mongoose.model('Task', taskSchema);