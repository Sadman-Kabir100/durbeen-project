import { SetMetadata } from "@nestjs/common";
import { ROLES_KEY } from "../constants/auth.constants";

/** ব্যবহার: @Roles('admin', 'staff') — role slug অনুযায়ী */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
