/**
 * Audit-log annotations for @cap-js/audit-logging: Users are the data subjects,
 * so write operations in UserManagement produce audit events.
 */
using { vin.claude as db } from '../db/schema';

annotate db.Users with @PersonalData: {
  EntitySemantics : 'DataSubject',
  DataSubjectRole : 'User'
} {
  ID        @PersonalData.FieldSemantics: 'DataSubjectID';
  loginName @PersonalData.IsPotentiallyPersonal;
  firstName @PersonalData.IsPotentiallyPersonal;
  lastName  @PersonalData.IsPotentiallyPersonal;
};

annotate db.UserRoles with @AuditLog.Operation: { Insert: true, Update: true, Delete: true };
