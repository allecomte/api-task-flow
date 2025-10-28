const Role = require("../enum/role.enum");
const Access = require("../enum/access.enum");

function canAccessProject(user, project, strategy) {
  const isManager = user.roles.includes(Role.ROLE_MANAGER);
  const isMember = project.members.map(String).includes(user.id);
  const isOwner = (project.owner ? project.owner.toString() : "") === user.id;
  let hasAccess = false;
  switch (strategy) {
    case Access.MEMBERS_AND_MANAGERS:
      hasAccess = isManager || isMember;
      break;
    case Access.ALL_MANAGERS:
      hasAccess = isManager;
      break;
    case Access.ONLY_MANAGER_OWNER:
      hasAccess = isManager && isOwner;
      break;
    default:
      hasAccess = isOwner;
      break;
  }
  if (!hasAccess) throw new Error("Not authorized");
  return true;
}

function canAccessTask(user, task, project, strategy) {
  const isProjectOwner =
    (project.owner ? project.owner.toString() : "") === user.id;
  const isAssignee =
    (task.assignee ? task.assignee.toString() : "") === user.id;
  let hasAccess = false;
  switch (strategy) {
    case Access.ONLY_PROJECT_OWNER:
      hasAccess = isProjectOwner;
      break;
    case Access.ASSIGNEE_AND_PROJECT_OWNER:
      hasAccess = isProjectOwner || isAssignee;
      break;
    default:
      hasAccess = isProjectOwner;
      break;
  }
  if (!hasAccess) throw new Error("Not authorized");
  return true;
}

function canAccessTag(user, project, strategy) {
  const isProjectOwner =
    (project.owner ? project.owner.toString() : "") === user.id;
  const isMember = project.members.map(String).includes(user.id);
  let hasAccess = false;
  switch (strategy) {
    case Access.ONLY_PROJECT_OWNER:
      hasAccess = isProjectOwner;
      break;
    case Access.MEMBERS_AND_PROJECT_OWNER:
      hasAccess = isMember || isProjectOwner;
      break;
    default:
      hasAccess = isProjectOwner;
      break;
  }
  if (!hasAccess) throw new Error("Not authorized");
  return true;
}

module.exports = { canAccessProject, canAccessTask, canAccessTag };
