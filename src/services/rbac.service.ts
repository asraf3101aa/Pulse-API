import { db } from '../db';
import { roles, permissions, rolePermissions, userRoles } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { NewRole, NewPermission } from '../models/rbac.model';
import { ALL_PERMISSIONS, ROLES } from '../config/rbac.config';
import { serviceError } from '../utils/serviceError';

export const createRole = async (role: NewRole) => {
    try {
        const [newRole] = await db.insert(roles).values(role).returning();
        return { role: newRole, message: 'Role created successfully' };
    } catch (error: any) {
        return { role: null, ...serviceError(error, 'Failed to create role') };
    }
};

export const createPermission = async (permission: NewPermission) => {
    try {
        const [newPermission] = await db.insert(permissions).values(permission).returning();
        return { permission: newPermission, message: 'Permission created successfully' };
    } catch (error: any) {
        return { permission: null, ...serviceError(error, 'Failed to create permission') };
    }
};

export const assignPermissionToRole = async (roleId: number, permissionId: number) => {
    try {
        const [newRolePermission] = await db
            .insert(rolePermissions)
            .values({ roleId, permissionId })
            .returning();
        return { rolePermission: newRolePermission, message: 'Permission assigned to role successfully' };
    } catch (error: any) {
        return { rolePermission: null, ...serviceError(error, 'Failed to assign permission') };
    }
};

export const assignRoleToUser = async (userId: number, roleId: number) => {
    try {
        const [newUserRole] = await db.insert(userRoles).values({ userId, roleId }).returning();
        return { userRole: newUserRole, message: 'Role assigned to user successfully' };
    } catch (error: any) {
        return { userRole: null, ...serviceError(error, 'Failed to assign role') };
    }
};

export const getUserPermissions = async (userId: number) => {
    try {
        const result = await db
            .select({
                permission: permissions.name,
            })
            .from(userRoles)
            .innerJoin(roles, eq(userRoles.roleId, roles.id))
            .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
            .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
            .where(eq(userRoles.userId, userId));

        return { permissions: result.map((r) => r.permission), message: 'User permissions fetched successfully' };
    } catch (error: any) {
        return { permissions: [], ...serviceError(error, 'Failed to fetch user permissions') };
    }
};

export const getUserRoles = async (userId: number) => {
    try {
        const result = await db
            .select({
                role: roles.name,
            })
            .from(userRoles)
            .innerJoin(roles, eq(userRoles.roleId, roles.id))
            .where(eq(userRoles.userId, userId));

        return { roles: result.map((r) => r.role), message: 'User roles fetched successfully' };
    } catch (error: any) {
        return { roles: [], ...serviceError(error, 'Failed to fetch user roles') };
    }
};

export const seedRBAC = async () => {
    try {
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
        return { success: true, message: 'RBAC seeded successfully' };
    } catch (error: any) {
        return { success: false, ...serviceError(error, 'Failed to seed RBAC') };
    }
};
