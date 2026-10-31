const cds = require('@sap/cds');

module.exports = class UserManagement extends cds.ApplicationService {
  async init() {
    const { Users, Roles, UserRoles } = this.entities;

    const requireUser = async (id, req) => {
      const user = await SELECT.one.from(Users).where({ ID: id });
      if (!user) req.reject(404, 'User not found');
      return user;
    };
    const requireRole = async (code, req) => {
      const role = await SELECT.one.from(Roles).where({ code });
      if (!role) req.reject(404, 'Role not found');
      return role;
    };
    const setLocked = async (req, locked) => {
      const user = await requireUser(req.data.userId, req);
      if (!!user.isLocked === locked) return false;
      await UPDATE(Users, user.ID).with({ isLocked: locked });
      return true;
    };

    this.on('lockUser',   req => setLocked(req, true));
    this.on('unlockUser', req => setLocked(req, false));

    this.on('createUser', async (req) => {
      const { firstName, lastName, email, roleId } = req.data;
      if (!firstName?.trim() || !lastName?.trim()) req.reject(400, 'First name and last name are required');
      await requireRole(roleId, req);
      const existing = await SELECT.one.from(Users).columns('ID').where({ loginName: email });
      if (existing) req.reject(409, 'User already exists');
      const ID = cds.utils.uuid();
      await INSERT.into(Users).entries({
        ID, loginName: email, firstName, lastName,
        roles: [{ role_code: roleId }]
      });
      return SELECT.one.from(Users).where({ ID });
    });

    this.on('resetPassword', async (req) => {
      const { userId, newPassword } = req.data;
      if (!newPassword) req.reject(400, 'Password must not be empty');
      if (newPassword.length < 8) req.reject(400, 'Password must be at least 8 characters');
      await requireUser(userId, req);
      // Identity lives in XSUAA/IAS: nothing is stored locally, the audit log records the event
      return true;
    });

    this.on('assignRole', async (req) => {
      const { userId, roleId } = req.data;
      await requireUser(userId, req);
      await requireRole(roleId, req);
      const existing = await SELECT.one.from(UserRoles).where({ user_ID: userId, role_code: roleId });
      if (!existing) await INSERT.into(UserRoles).entries({ user_ID: userId, role_code: roleId });
      return true;
    });

    this.on('unassignRole', async (req) => {
      const { userId, roleId } = req.data;
      const n = await DELETE.from(UserRoles).where({ user_ID: userId, role_code: roleId });
      if (!n) req.reject(404, 'Role assignment not found');
      return true;
    });

    return super.init();
  }
};
