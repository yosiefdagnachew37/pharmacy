import client from './client';

/**
 * Organization Profile & Settings
 */
export const getMyOrganization = async () => {
    const res = await client.get('/organizations/my-org');
    return res.data;
};

export const updateMyOrganization = async (data: any) => {
    const res = await client.patch('/organizations/my-org', data);
    return res.data;
};

/**
 * Subscription Management
 */
export const getMySubscription = async () => {
    const res = await client.get('/organizations/subscription');
    return res.data;
};

export const requestUpgrade = async (planId: string, notes?: string) => {
    const res = await client.post('/organizations/request-upgrade', { planId, notes });
    return res.data;
};

/**
 * Staff Management (Scoped to current organization)
 */
export const getMyStaff = async () => {
    const res = await client.get('/users');
    return res.data;
};

export const createStaff = async (data: any) => {
    const res = await client.post('/users', data);
    return res.data;
};

export const updateStaff = async (userId: string, data: any) => {
    const res = await client.patch(`/users/${userId}`, data);
    return res.data;
};

export const deleteStaff = async (userId: string) => {
    const res = await client.delete(`/users/${userId}`);
    return res.data;
};
 Riverside:1-55
