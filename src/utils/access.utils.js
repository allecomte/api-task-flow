const Role = require("../enum/role.enum");
const Access = require("../enum/access.enum");

function canAccessProject (user, project, strategy, res) {
  const isManager = user.roles.includes(Role.ROLE_MANAGER);
  const isMember = project.members.map(String).includes(user.id);
  const isOwner = (project.owner ? project.owner.toString() : '') === user.id;
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
  // if (!hasAccess) {
  //   return res.status(403).json({ message: "Not authorized" });
  // }
  return true;
};

module.exports = { canAccessProject };