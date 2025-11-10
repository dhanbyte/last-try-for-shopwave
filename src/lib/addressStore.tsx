
'use client'
import { create } from 'zustand'
import { safeGet, safeSet } from './storage'
import type { Address } from './types'

type AddressBookData = {
  [userId: string]: Address[]
}

type AddressState = {
  addresses: Address[]
  isLoading: boolean
  init: (userId: string) => void
  save: (userId: string, address: Omit<Address, 'id'> & { id?: string }) => void
  remove: (userId: string, addressId: string) => void
  setDefault: (userId: string, addressId: string) => void
  clear: () => void
}

const getAddressBook = (): AddressBookData => {
  return safeGet('address-book', {});
}

const saveAddressBook = (data: AddressBookData) => {
  safeSet('address-book', data);
}

export const useAddressBook = create<AddressState>()((set, get) => ({
  addresses: [],
  isLoading: true,
  init: (userId: string) => {
    // Load from localStorage immediately - no loading state
    const addressBook = getAddressBook();
    const localAddresses = addressBook[userId] || [];
    set({ addresses: localAddresses, isLoading: false });
    
    // Sync with server in background
    setTimeout(async () => {
      try {
        const response = await fetch(`/api/user-data?userId=${encodeURIComponent(userId)}&type=addresses`);
        
        if (response.ok) {
          const serverAddresses = await response.json();
          if (serverAddresses && Array.isArray(serverAddresses) && serverAddresses.length > 0) {
            const updatedAddressBook = getAddressBook();
            updatedAddressBook[userId] = serverAddresses;
            saveAddressBook(updatedAddressBook);
            set({ addresses: serverAddresses });
          }
        }
      } catch (error) {
        console.warn('Could not sync addresses with server:', error);
      }
    }, 0);
  },
  save: async (userId, address) => {
    const currentAddresses = get().addresses;
    const newId = address.id || `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const existingIndex = address.id ? currentAddresses.findIndex((a) => a.id === address.id) : -1;

    let updatedAddresses;

    if (existingIndex > -1) {
      // Update existing address
      updatedAddresses = currentAddresses.map((a, index) => 
        index === existingIndex ? { ...a, ...address, id: a.id } : a
      );
    } else {
      // Add new address - make it default if it's the first one
      const newAddress = { ...address, id: newId, default: currentAddresses.length === 0 };
      updatedAddresses = [...currentAddresses, newAddress];
    }

    // Update state immediately
    set({ addresses: updatedAddresses });
    
    // Update localStorage immediately
    const addressBook = getAddressBook();
    addressBook[userId] = updatedAddresses;
    saveAddressBook(addressBook);
    
    // Try to save to server in background
    setTimeout(async () => {
      try {
        await fetch('/api/user-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: userId, 
            type: 'addresses', 
            data: updatedAddresses 
          })
        });
      } catch (error) {
        console.warn('Network error saving address:', error);
      }
    }, 100);
  },
  remove: async (userId, addressId) => {
    const currentAddresses = get().addresses;
    const addressToRemove = currentAddresses.find(a => a.id === addressId);
    let newAddresses = currentAddresses.filter((a) => a.id !== addressId);
    
    // If the removed address was the default, make the first remaining address the new default
    if (addressToRemove?.default && newAddresses.length > 0) {
      newAddresses[0].default = true;
    }

    // Update state and localStorage immediately
    set({ addresses: newAddresses });
    const addressBook = getAddressBook();
    addressBook[userId] = newAddresses;
    saveAddressBook(addressBook);
    
    // Try to sync with server
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'addresses', data: newAddresses })
      });
    } catch (error) {
      console.warn('Error syncing address removal to server:', error);
    }
  },
  setDefault: async (userId, addressId) => {
    const currentAddresses = get().addresses;
    const newAddresses = currentAddresses.map((a) => ({ ...a, default: a.id === addressId }));
    
    // Update state and localStorage immediately
    set({ addresses: newAddresses });
    const addressBook = getAddressBook();
    addressBook[userId] = newAddresses;
    saveAddressBook(addressBook);
    
    // Try to sync with server
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'addresses', data: newAddresses })
      });
    } catch (error) {
      console.warn('Error syncing default address to server:', error);
    }
  },
  clear: () => {
    set({ addresses: [], isLoading: true });
  }
}))
