const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    tasks: { type: [mongoose.Schema.Types.ObjectId], ref: 'Task', default: [] }
});

module.exports = mongoose.model('Tag', TagSchema);