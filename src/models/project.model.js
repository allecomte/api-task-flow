const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: false },
    isArchived: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] }
}, {timestamps: true});

module.exports = mongoose.model('Project', projectSchema);