import client from './client';

export interface Tenant {
    id: string;
    name: string;
    subscription_plan: 'BASIC' | 'SILVER' | 'GOLD';
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export const getTenants = async (): Promise<Tenant[]> => {
    const response = await client.get('/admin/organizations');
    return response.data;
};

export const getTenant = async (id: string): Promise<Tenant> => {
    const response = await client.get(`/admin/organizations/${id}`);
    return response.data;
};

export const getTenantUsers = async (id: string): Promise<any[]> => {
    const response = await client.get(`/admin/organizations/${id}/users`);
    return response.data;
};

export const createTenant = async (data: any): Promise<Tenant> => {
    const response = await client.post('/admin/organizations', data);
    return response.data;
};

export const updateTenant = async (id: string, data: Partial<Tenant>): Promise<Tenant> => {
    const response = await client.patch(`/admin/organizations/${id}`, data);
    return response.data;
};

export const suspendTenant = async (id: string): Promise<Tenant> => {
    const response = await client.patch(`/admin/organizations/${id}/suspend`);
    return response.data;
};

export const activateTenant = async (id: string): Promise<Tenant> => {
    const response = await client.patch(`/admin/organizations/${id}/activate`);
    return response.data;
};

export const createTenantUser = async (data: any): Promise<any> => {
    const response = await client.post('/users', data);
    return response.data;
};

export const updateTenantUser = async (id: string, data: any): Promise<any> => {
    const response = await client.patch(`/users/${id}`, data);
    return response.data;
};

export const deleteTenantUser = async (id: string): Promise<any> => {
    const response = await client.delete(`/users/${id}`);
    return response.data;
};

// Also export as an object for compatibility
export const superAdminService = {
    getAllTenants: getTenants,
    getTenantById: getTenant,
    createTenant,
    updateTenant,
    suspendTenant,
    activateTenant,
    getTenantUsers,
    createUser: createTenantUser,
    updateUser: updateTenantUser,
    deleteUser: deleteTenantUser,
};
