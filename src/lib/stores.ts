// src/lib/stores.ts
import { writable } from 'svelte/store';
import type { SignedMetadata } from '$lib/TufJSON/types';

interface TufRepository {
    files: {
        [key: string]: SignedMetadata;
    };
    keyInfo: {
        [key: string]: any;
    };
    currentPath?: string;
}

function createTufStore() {
    const { subscribe, set, update } = writable<TufRepository>({
        files: {},
        keyInfo: {},
    });

    return {
        subscribe,
        addFile: (name: string, content: SignedMetadata) => 
            update(store => ({
                ...store,
                files: { ...store.files, [name]: content }
            })),
        addKeyInfo: (content: any) => 
            update(store => ({
                ...store,
                keyInfo: content
            })),
        setPath: (path: string) =>
            update(store => ({
                ...store,
                currentPath: path
            })),
        reset: () => set({ files: {}, keyInfo: {} })
    };
}

export const tufStore = createTufStore();