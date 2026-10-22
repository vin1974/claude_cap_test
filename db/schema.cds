using { sap, cuid, Currency, managed } from '@sap/cds/common';

namespace vin.claude;

// Code lists

entity AddressTypes : sap.common.CodeList {
  key code : String(1); // e.g. Home, Office, Permanent, Temporary
}

entity TravellerStatus : sap.common.CodeList {
  key code : String(1); // e.g. Active, Inactive, Suspended
}

// Types

type AddressType : Association to AddressTypes;
type Status      : Association to TravellerStatus;

// Main entities

entity Destinations : cuid {
  address    : String(255);
  city       : String(40);
  postalCode : String(8);
  country    : String(40);
  traveller  : Association to Travellers;
}

entity Travellers : cuid, managed {
  @mandatory
  userName  : String(255);
  firstName : String(255);
  lastName  : String(255);
  contacts  : Composition of many Contacts on contacts.traveller = $self;
  gender    : String(10);
  age       : Integer;
  status    : Status default 'A';
  address   : Composition of Destinations;
  vacations : Composition of many Vacations on vacations.traveller = $self;
}

annotate Travellers with {
  modifiedAt @odata.etag;
}

entity Contacts : cuid {
  type      : AddressType;
  address   : String(255);
  traveller : Association to Travellers;
}

entity Vacations : cuid {
  name        : String(255);
  budget      : Decimal(10, 2);
  currency    : Currency;
  description : String(1024);
  startsAt    : DateTime;
  endsAt      : DateTime;
  traveller   : Association to Travellers;
}

// Users and roles

entity Roles : sap.common.CodeList {
  key code : String(10); // e.g. ADMIN, TRAVELLER, AGENT
}

entity AppUsers : cuid, managed {
  @mandatory
  userName    : String(100);
  @mandatory
  email       : String(255);
  fullName    : String(255);
  role        : Association to Roles;
  isActive    : Boolean default true;
  lastLoginAt : DateTime;
  traveller   : Association to Travellers; // optional: set if the user is a traveller
}
