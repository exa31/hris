import { JabatanEnum, DeparemenEnum, MaritalStatusEnum, GenderEnum, EmploymentTypeEnum } from '~/constants/enums';

// District Type
export interface District {
    id: number;
    regency_id: number;
    name: string;
}

// Regency Type
export interface Regency {
    id: number;
    province_id: number;
    name: string;
}

// Province Type
export interface Province {
    id: number;
    name: string;
}

// Employee Address Type
export interface EmployeeAddress {
    id: number;
    employee_id: number;
    birth_place_id: number;
    district_id: number;
    regency_id: number;
    province_id: number;
    full_address: string;
    created_at: string;
    updated_at: string;
}

// Employee Type
export interface Employee {
    id: number;
    nip: number;
    name: string;
    email: string;
    phone: string;
    birth_date: string;
    address_id: number;
    marital_status: MaritalStatusEnum;
    gender: GenderEnum;
    children_count: number;
    join_date: string;
    position: JabatanEnum;
    department: DeparemenEnum;
    type: EmploymentTypeEnum;
    status: boolean;
    created_at: string;
    updated_at: string;
}

// Employee with Address Details
export interface EmployeeWithAddress extends Employee {
    address: EmployeeAddress;
}

// Education Type
export interface Education {
    id: number;
    name: string;
}

// Employee Education Type
export interface EmployeeEducation {
    id: number;
    employee_id: number;
    education_id: number;
}

// Role Type
export interface Role {
    id: number;
    name: string;
}

// Permission Type
export interface Permission {
    id: number;
    name: string;
}

// Role Permission Type
export interface RolePermission {
    id: number;
    role_id: number;
    permission_id: number;
}

// User Type
export interface User {
    id: number;
    employee_id: number;
    username: string;
    password_hash: string;
    role_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// User with Employee and Role
export interface UserWithDetails extends User {
    employee: Employee;
    role: Role;
}

// Transport Setting Type
export interface TransportSetting {
    id: number;
    base_fare_per_km: number;
    created_at: string;
    updated_at: string;
}

// Transport Allowance Type
export interface TransportAllowance {
    id: number;
    employee_id: number;
    month: number;
    year: number;
    distance_km: number;
    allowance_amount: number;
    created_at: string;
    updated_at: string;
}

// Activity Log Type
export interface ActivityLog {
    id: number;
    user_id: number;
    action: string;
    module: string;
    description: string;
    metadata: Record<string, any>;
    created_at: string;
}
