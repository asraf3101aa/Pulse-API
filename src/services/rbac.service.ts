import { db } from '../db';
import { roles, permissions, rolePermissions, userRoles } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';

import { NewRole, NewPermission } from '../models/rbac.model';
import { ALL_PERMISSIONS, ROLES } from '../config/rbac.config';

export const createRole = async (role: NewRole) => {
    const [newRole] = await db.insert(roles).values(role).returning();
    return newRole;
};

export const createPermission = async (permission: NewPermission) => {
    const [newPermission] = await db.insert(permissions).values(permission).returning();
    return newPermission;
};

export const assignPermissionToRole = async (roleId: number, permissionId: number) => {
    const [newRolePermission] = await db
        .insert(rolePermissions)
        .values({ roleId, permissionId })
        .returning();
    return newRolePermission;
};

export const assignRoleToUser = async (userId: number, roleId: number) => {
    const [newUserRole] = await db.insert(userRoles).values({ userId, roleId }).returning();
    return newUserRole;
};

export const getUserPermissions = async (userId: number) => {
    const result = await db
        .select({
            permission: permissions.name,
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(userRoles.userId, userId));

    return result.map((r) => r.permission);
};

export const getUserRoles = async (userId: number) => {
    const result = await db
        .select({
            role: roles.name,
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, userId));

    return result.map((r) => r.role);
};

export const seedRBAC = async () => {
    // 1. Seed Permissions
    for (const permissionName of ALL_PERMISSIONS) {
        const existing = await db.query.permissions.findFirst({
            where: eq(permissions.name, permissionName),
        });

        if (!existing) {
            await db.insert(permissions).values({
                name: permissionName,
                description: `Permission to ${permissionName.split('_').join(' ')}`,
            });
        }
    }

    // 2. Seed Roles and their Permissions
    for (const roleDef of Object.values(ROLES)) {
        let role = await db.query.roles.findFirst({
            where: eq(roles.name, roleDef.name),
        });

        if (!role) {
            [role] = await db.insert(roles).values({
                name: roleDef.name,
                description: roleDef.description,
            }).returning();
        }

        // Get all permission IDs for this role
        const rolePerms = await db.select()
            .from(permissions)
            .where(inArray(permissions.name, roleDef.permissions as string[]));

        for (const perm of rolePerms) {
            const existing = await db.query.rolePermissions.findFirst({
                where: (_, { and }) => and(
                    eq(rolePermissions.roleId, role!.id),
                    eq(rolePermissions.permissionId, perm.id)
                ),
            });

            if (!existing) {
                await db.insert(rolePermissions).values({
                    roleId: role!.id,
                    permissionId: perm.id,
                });
            }
        }
    }
};
