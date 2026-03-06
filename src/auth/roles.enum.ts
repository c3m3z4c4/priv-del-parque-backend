export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  PRESIDENTE = 'PRESIDENTE',
  SECRETARIO = 'SECRETARIO',
  TESORERO = 'TESORERO',
  VECINO = 'VECINO',
}

/** Roles that are unique — only one user per role allowed in the DB */
export const UNIQUE_ROLES: Role[] = [
  Role.PRESIDENTE,
  Role.SECRETARIO,
  Role.TESORERO,
];

/** Roles with admin-level privileges */
export const ADMIN_ROLES: Role[] = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.PRESIDENTE,
  Role.SECRETARIO,
  Role.TESORERO,
];
