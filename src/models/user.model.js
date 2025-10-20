const mongoose = require('mongoose');
const Role = require('../enum/role.enum');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    roles: { type: [String], enum: Object.values(Role), default: [Role.ROLE_USER] },
    projectsOwned: { type: [mongoose.Schema.Types.ObjectId], ref: 'Project', default: [] },
    projectsMemberOf: { type: [mongoose.Schema.Types.ObjectId], ref: 'Project', default: [] },
    tasksAssigned: { type: [mongoose.Schema.Types.ObjectId], ref: 'Task', default: [] }
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);