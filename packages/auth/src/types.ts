export interface BaseUserProfile {
  createdOn: string;
  modifiedOn: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  secondLastName?: string;
  gender?: string;
  email?: string;
  emailVerified: boolean;
  picture?: string;
  birthYear?: string;
  birthDay?: string;
  birthMonth?: string;
  contacts?: Array<Contact>;
  addresses?: Array<Address>;
  attributes?: Array<Attribute>;
  status?: "Active" | "Disabled" | "Anonymized" | "PendingAnonymize";
}
export interface UserProfile extends BaseUserProfile {
  uuid: string;
  identities: Array<ProfileIdentity>;
}

export interface ProfileIdentity {
  createdOn: string;
  createdBy: string;
  modifiedOn: string;
  modifiedBy: string;
  deletedOn: string;
  id: number;
  userName: string;
  passwordReset: boolean;
  type: "Identity" | "Facebook" | "Google";
  lastLoginDate: string;
  locked: boolean;
}

export interface Contact {
  phone: string;
  type: ContactType;
}
export declare type ContactType = "WORK" | "HOME" | "PRIMARY" | "OTHER";
export interface Attribute {
  name: string;
  value: string;
}
export interface Address {
  line1: string;
  line2?: string;
  locality: string;
  region?: string;
  postal?: string;
  country?: string;
  type: ContactType;
}

export interface APIErrorResponse {
  code: string;
  message: string;
  httpStatus?: number;
}

export interface UserIdentity {
  uuid?: string;
  accessToken: string;
  refreshToken: string;
  impersonator?: string;
  disqus?: {
    enabled: boolean;
    publicKey: string;
    ssoKey?: string;
  };
}
