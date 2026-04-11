import { ref, computed } from 'vue'
import { getErrorMessageAxios } from '~/utils/handleError'

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

const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export const useRoles = () => {
    const { $axios } = useNuxtApp()

    const getRoles = async (): Promise<Role[]> => {
        loading.value = true
        error.value = null
        try {
            const response = await $axios.get('/api/roles')
            roles.value = response.data
            return response.data
        } catch (err: any) {
            console.error('Error fetching roles:', err)
            error.value = getErrorMessageAxios(err) || 'Gagal memuat data role'
            return []
        } finally {
            loading.value = false
        }
    }

    const getRoleById = (id: number): Role | undefined => {
        return roles.value.find(r => r.id === id)
    }

    const getPermissions = async (): Promise<Permission[]> => {
        loading.value = true
        try {
            const response = await $axios.get('/api/roles/permissions')
            permissions.value = response.data
            return response.data
        } catch (err) {
            error.value = getErrorMessageAxios(err) || 'Gagal memuat data permission'
            console.error('Error fetching permissions:', err)
            return []
        } finally {
            loading.value = false
        }
    }

    const getRolePermissions = (roleId: number): Permission[] => {
        const role = getRoleById(roleId)
        return role?.permissions || []
    }

    const updateRolePermissions = async (roleId: number, permissionIds: number[], name?: string): Promise<Role | null> => {
        loading.value = true
        try {
            const role = getRoleById(roleId)
            const roleName = name || role?.name || ''
            
            const response = await $axios.put(`/api/roles/${roleId}`, {
                name: roleName,
                permissionIds
            })
            
            // Update local state
            const index = roles.value.findIndex(r => r.id === roleId)
            if (index !== -1) {
                roles.value[index] = response.data
            }
            
            return response.data
        } catch (err) {
            error.value = getErrorMessageAxios(err) || 'Gagal memperbarui role'
            console.error('Error updating role:', err)
            throw new Error(error.value)
        } finally {
            loading.value = false
        }
    }

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
        permissions: computed(() => permissions.value),
        loading: computed(() => loading.value),
        error: computed(() => error.value)
    }
}
