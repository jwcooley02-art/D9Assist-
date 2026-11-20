import { ModuleItem, OrderRecord, WaitlistEntry } from '../types';
import { INITIAL_MODULES } from '../data/initialModules';

const STORAGE_KEYS = {
  MODULES: 'd9assist_modules_v3',
  ACTIVE_MODULE_ID: 'd9assist_active_module_id_v3',
  ORDERS: 'd9assist_user_orders_v3',
  WAITLIST: 'd9assist_waitlist_records_v3',
};

export const loadStoredModules = (): ModuleItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MODULES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(INITIAL_MODULES));
      return INITIAL_MODULES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MODULES;
  } catch {
    return INITIAL_MODULES;
  }
};

export const saveStoredModules = (modules: ModuleItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(modules));
  } catch (err) {
    console.error('Failed to save modules to localStorage:', err);
  }
};

export const loadActiveModuleId = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_MODULE_ID) || INITIAL_MODULES[0].id;
  } catch {
    return INITIAL_MODULES[0].id;
  }
};

export const saveActiveModuleId = (id: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MODULE_ID, id);
  } catch (err) {
    console.error('Failed to save active module ID:', err);
  }
};

export const loadStoredOrders = (): OrderRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredOrder = (order: OrderRecord): OrderRecord[] => {
  try {
    const current = loadStoredOrders();
    const updated = [order, ...current];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

export const loadStoredWaitlist = (): WaitlistEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WAITLIST);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredWaitlist = (entry: WaitlistEntry): WaitlistEntry[] => {
  try {
    const current = loadStoredWaitlist();
    const updated = [entry, ...current];
    localStorage.setItem(STORAGE_KEYS.WAITLIST, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

export const generateLicenseKey = (gameCode: string = 'EFT'): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const chunk = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `D9A-${gameCode.toUpperCase().slice(0, 3)}-${chunk()}-${chunk()}`;
};
