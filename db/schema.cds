/**
 * Business entities for the Vacation & Traveller Management app.
 * Reusable code lists and types are defined in common.cds.
 */
using { cuid, managed } from '@sap/cds/common';
using { vin.claude.AddressType, vin.claude.Status, vin.claude.Role, vin.claude.TravellerType } from './common';

namespace vin.claude;

// Main entities

entity Travellers : cuid, managed {
  @mandatory
  firstName   : String(80)  @title: '{i18n>FirstName}';
  @mandatory
  lastName    : String(80)  @title: '{i18n>LastName}';
  @mandatory
  email       : String(120) @title: '{i18n>Email}';
  phone       : String(20)  @title: '{i18n>Phone}';
  addressType : AddressType @title: '{i18n>AddressType}';
  @mandatory
  type        : TravellerType @title: '{i18n>TravellerType}';
  status      : Status default 'A' @title: '{i18n>Status}';
  @mandatory
  userID      : String(100) @title: '{i18n>UserID}'; // BTP user ID, row-level filter key
  locations   : Composition of many TravelledLocations on locations.traveller = $self @title: '{i18n>Locations}';
}

annotate Travellers with {
  ID         @title: '{i18n>ID}';
  modifiedAt @odata.etag;
};

annotate Travellers with @assert.unique: { email: [email] };

entity Destinations : cuid {
  @mandatory
  name        : String(200) @title: '{i18n>Name}';
  @mandatory
  country     : String(100) @title: '{i18n>Country}';
  @mandatory
  city        : String(100) @title: '{i18n>City}';
  region      : String(100) @title: '{i18n>Region}';
  description : LargeString @title: '{i18n>Description}';
}

annotate Destinations with @assert.unique: { name: [name] };

entity TravelledLocations : cuid {
  @mandatory
  traveller   : Association to Travellers @title: '{i18n>Traveller}';
  @mandatory
  destination : Association to Destinations @title: '{i18n>Destination}';
  @mandatory
  travelFrom  : Date        @title: '{i18n>TravelFrom}';
  @mandatory
  travelTo    : Date        @title: '{i18n>TravelTo}';
  notes       : LargeString @title: '{i18n>Notes}';
}

// Users and role assignments

entity Users : cuid {
  @mandatory
  loginName : String(120) @title: '{i18n>LoginName}'; // BTP login / email
  @mandatory
  firstName : String(80)  @title: '{i18n>FirstName}';
  @mandatory
  lastName  : String(80)  @title: '{i18n>LastName}';
  isLocked  : Boolean default false @title: '{i18n>IsLocked}';
  createdAt : Timestamp @cds.on.insert: $now @title: '{i18n>CreatedAt}';
  roles     : Composition of many UserRoles on roles.user = $self @title: '{i18n>Roles}';
}

annotate Users with @assert.unique: { loginName: [loginName] };

entity UserRoles : cuid {
  user : Association to Users @title: '{i18n>User}';
  role : Role                 @title: '{i18n>Role}';
}

annotate UserRoles with @assert.unique: { assignment: [user, role] };

// ID titles for entities using cuid

annotate Destinations         with { ID @title: '{i18n>ID}'; };
annotate TravelledLocations   with { ID @title: '{i18n>ID}'; };
annotate Users                with { ID @title: '{i18n>ID}'; };
annotate UserRoles            with { ID @title: '{i18n>ID}'; };
