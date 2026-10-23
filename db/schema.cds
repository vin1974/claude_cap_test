/**
 * Business entities for the Vacation & Traveller Management app.
 * Reusable code lists and types are defined in common.cds.
 */
using { cuid, Currency, managed } from '@sap/cds/common';
using { vin.claude.AddressType, vin.claude.Status, vin.claude.Role } from './common';

namespace vin.claude;

// Main entities

entity Destinations : cuid {
  address    : String(255) @title: '{i18n>Address}';
  city       : String(40)  @title: '{i18n>City}';
  postalCode : String(8)   @title: '{i18n>PostalCode}';
  country    : String(40)  @title: '{i18n>Country}';
  traveller  : Association to Travellers @title: '{i18n>Traveller}';
}

entity Travellers : cuid, managed {
  @mandatory
  userName  : String(255) @title: '{i18n>UserName}';
  firstName : String(255) @title: '{i18n>FirstName}';
  lastName  : String(255) @title: '{i18n>LastName}';
  contacts  : Composition of many Contacts on contacts.traveller = $self @title: '{i18n>Contacts}';
  gender    : String(10)  @title: '{i18n>Gender}';
  age       : Integer     @title: '{i18n>Age}';
  status    : Status default 'A' @title: '{i18n>Status}';
  address   : Composition of Destinations @title: '{i18n>Address}';
  vacations : Composition of many Vacations on vacations.traveller = $self @title: '{i18n>Vacations}';
}

annotate Travellers with {
  ID         @title: '{i18n>ID}';
  modifiedAt @odata.etag;
}

entity Contacts : cuid {
  type      : AddressType  @title: '{i18n>Type}';
  address   : String(255)  @title: '{i18n>Address}';
  traveller : Association to Travellers @title: '{i18n>Traveller}';
}

entity Vacations : cuid {
  name        : String(255)  @title: '{i18n>Name}';
  budget      : Decimal(10, 2) @title: '{i18n>Budget}';
  currency    : Currency     @title: '{i18n>Currency}';
  description : String(1024) @title: '{i18n>Description}';
  startsAt    : DateTime     @title: '{i18n>StartsAt}';
  endsAt      : DateTime     @title: '{i18n>EndsAt}';
  traveller   : Association to Travellers @title: '{i18n>Traveller}';
}

// Users

entity AppUsers : cuid, managed {
  @mandatory
  userName    : String(100) @title: '{i18n>UserName}';
  @mandatory
  email       : String(255) @title: '{i18n>Email}';
  fullName    : String(255) @title: '{i18n>FullName}';
  role        : Role        @title: '{i18n>Role}';
  isActive    : Boolean default true @title: '{i18n>IsActive}';
  lastLoginAt : DateTime    @title: '{i18n>LastLoginAt}';
  traveller   : Association to Travellers @title: '{i18n>Traveller}'; // optional: set if the user is a traveller
}

// ID titles for entities using cuid

annotate Destinations with { ID @title: '{i18n>ID}'; };
annotate Contacts     with { ID @title: '{i18n>ID}'; };
annotate Vacations    with { ID @title: '{i18n>ID}'; };
annotate AppUsers     with { ID @title: '{i18n>ID}'; };
