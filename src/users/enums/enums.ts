export enum RoleEnum {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  USER = 'user',
}

export const RoleHierarchy = {
  [RoleEnum.USER]: [RoleEnum.USER],
  [RoleEnum.ADMIN]: [RoleEnum.USER, RoleEnum.ADMIN],
  [RoleEnum.SUPER_ADMIN]: [RoleEnum.USER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN],
};
