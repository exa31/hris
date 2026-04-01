import { ref, computed } from 'vue'

export interface Permission {
    id: number
    name: string
    module: string
    action: string
}

export interface Role {
    id: number
    name: string
    permissions?: Permission[]
}

export interface RolePermission {
    role_id: number
    permission_id: number
}

// Dummy Permissions Data
const dummyPermissions: Permission[] = [
    { id: 1, name: 'View Employees', module: 'Employees', action: 'read' },
    { id: 2, name: 'Create Employee', module: 'Employees', action: 'create' },
    { id: 3, name: 'Edit Employee', module: 'Employees', action: 'update' },
    { id: 4, name: 'Delete Employee', module: 'Employees', action: 'delete' },
    { id: 5, name: 'View Transport Allowance', module: 'Transport Allowance', action: 'read' },
    { id: 6, name: 'Create Transport Allowance', module: 'Transport Allowance', action: 'create' },
    { id: 7, name: 'Edit Transport Allowance', module: 'Transport Allowance', action: 'update' },
    { id: 8, name: 'Delete Transport Allowance', module: 'Transport Allowance', action: 'delete' },
    { id: 9, name: 'View Audit Log', module: 'Audit Log', action: 'read' },
    { id: 10, name: 'Manage Users', module: 'Users', action: 'manage' },
    { id: 11, name: 'Manage Roles', module: 'Roles', action: 'manage' },
    { id: 12, name: 'View Settings', module: 'Settings', action: 'read' },
    { id: 13, name: 'Edit Settings', module: 'Settings', action: 'update' }
]

// Dummy Roles Data with Permissions
const dummyRoles: Role[] = [
    {
        id: 1,
        name: 'Superadmin',
        permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as unknown as Permission[]
    },
    {
        id: 2,
        name: 'Manager HRD',
        permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9] as unknown as Permission[]
    },
    {
        id: 3,
        name: 'Admin HRD',
        permissions: [1, 5, 6] as unknown as Permission[]
    }
]

// Fix permissions reference
dummyRoles.forEach(role => {
    role.permissions = (role.permissions as unknown as number[]).map(permId =>
        dummyPermissions.find(p => p.id === permId)
    ).filter(p => p) as Permission[]
})

const roles = ref<Role[]>(dummyRoles)
const permissions = ref<Permission[]>(dummyPermissions)

export const useRoles = () => {
    /**
     * Fetch All Roles
     * TODO: Replace with API call to /api/roles
     */
    const getRoles = async (): Promise<Role[]> => {
        // return await $fetch('/api/roles')
        return roles.value
    }

    const getRoleById = (id: number): Role | undefined => {
        return roles.value.find(r => r.id === id)
    }

    /**
     * Get all available permissions
     * TODO: Replace with API call to /api/permissions
     */
    const getPermissions = async (): Promise<Permission[]> => {
        // return await $fetch('/api/permissions')
        return permissions.value
    }

    /**
     * Get permissions for a role
     */
    const getRolePermissions = (roleId: number): Permission[] => {
        const role = getRoleById(roleId)
        return role?.permissions || []
    }

    /**
     * Update role permissions
     */
    const updateRolePermissions = async (roleId: number, permissionIds: number[]): Promise<Role | null> => {
        const role = getRoleById(roleId)
        if (!role) return null

        role.permissions = permissionIds
            .map(id => permissions.value.find(p => p.id === id))
            .filter(p => p) as Permission[]

        return role
    }

    /**
     * Get permissions grouped by module
     */
    const getPermissionsByModule = computed(() => {
        const grouped: Record<string, Permission[]> = {}
        permissions.value.forEach(permission => {
            if (!grouped[permission.module]) {
                grouped[permission.module] = []
            }
            grouped[permission.module]!.push(permission)
        })
        return grouped
    })

    return {
        getRoles,
        getRoleById,
        getPermissions,
        getRolePermissions,
        updateRolePermissions,
        getPermissionsByModule,
        roles: computed(() => roles.value),
        permissions: computed(() => permissions.value)
    }
}
