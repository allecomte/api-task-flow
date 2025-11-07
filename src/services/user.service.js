const User = require("../models/user.model");

async function addOneTaskToUser(userId, taskId) {
  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { tasksAssigned: taskId } }
  );
}

async function removeOneTaskFromUser(userId, taskId) {
  await User.findByIdAndUpdate(
    userId,
    { $pull: { tasksAssigned: taskId } }
  );
}

async function addOneProjectToUserMembership(userId, projectId) {
  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { projectsMemberOf: projectId } }
  );
}

async function removeOneProjectFromUserMembership(userId, projectId) {
  return await User.findByIdAndUpdate(
    userId,
    { $pull: { projectsMemberOf: projectId } },
    { new: true }
  );
}

async function addOneProjectToUserOwnership(userId, projectId) {
  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { projectsOwned: projectId } }
  );
}

module.exports = {
  addOneTaskToUser,
  removeOneTaskFromUser,
  addOneProjectToUserMembership,
  removeOneProjectFromUserMembership,
  addOneProjectToUserOwnership
};