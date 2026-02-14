import { eq } from 'drizzle-orm';
import { db } from '../db';
import { userLoggedInDevices } from '../db/schema';
import { NewUserLoggedInDevice } from '../models/user.model';
import { serviceError } from '../utils/serviceError';

export const createDevice = async (device: NewUserLoggedInDevice) => {
  try {
    const [newDevice] = await db.insert(userLoggedInDevices).values(device).returning();
    if (!newDevice) {
      throw new Error('Failed to create device');
    }
    return { device: newDevice, message: 'Device created successfully' };
  } catch (error: any) {
    return { device: null, ...serviceError(error, 'Failed to create device') };
  }
};

export const getDevicesByUserId = async (userId: number) => {
  try {
    const devices = await db.select().from(userLoggedInDevices).where(eq(userLoggedInDevices.userId, userId));
    return { devices, message: 'Devices fetched successfully' };
  } catch (error: any) {
    return { devices: [], ...serviceError(error, 'Failed to fetch devices') };
  }
};

export const deleteDevicebyToken = async (token: string) => {
  try {
    await db.delete(userLoggedInDevices).where(eq(userLoggedInDevices.deviceToken, token));
    return { message: 'Device deleted successfully' };
  } catch (error: any) {
    return { ...serviceError(error, 'Failed to delete device') };
  }
};
