/**
 * Admin-only user and role management.
 */
using { vin.claude as db } from '../db/schema';
using { vin.claude as common } from '../db/common';

@path: '/odata/v4/user-management'
@requires: 'Admin'
service UserManagement {

  entity Users     as projection on db.Users;
  entity Roles     as projection on common.Roles;
  entity UserRoles as projection on db.UserRoles;

  function lockUser(userId : UUID)   returns Boolean;
  function unlockUser(userId : UUID) returns Boolean;

  action createUser(firstName : String(80), lastName : String(80), email : String(120), roleId : String(10)) returns Users;
  action resetPassword(userId : UUID, newPassword : String) returns Boolean;
  action assignRole(userId : UUID, roleId : String(10))     returns Boolean;
  action unassignRole(userId : UUID, roleId : String(10))   returns Boolean;
}
