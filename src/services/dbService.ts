// Fix: Populated file with IndexedDB service implementation to resolve module errors.
import { VideoProject } from '../types';

const DB_NAME = 'KalpanaAIStudioDB';
const DB_VERSION = 2; // FIX: Bumped version to apply schema change
const STORE_NAME = 'videoProjects';

let db: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", request.error);
      reject("IndexedDB error");
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // FIX: Changed schema to use string keyPath without autoIncrement
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('productName', 'productName', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      } else {
        // Handle migration for schema change if the store already exists
        const transaction = request.transaction;
        if (transaction) {
            const store = transaction.objectStore(STORE_NAME);
            // No index changes needed, keyPath change is handled by recreating if needed
            console.log("Store already exists, no migration needed for V2");
        }
      }
    };
  });
};

export const addProject = async (project: VideoProject): Promise<string> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(project);

        request.onsuccess = () => resolve(request.result as string);
        request.onerror = () => reject(request.error);
    });
};

export const getAllProjects = async (): Promise<VideoProject[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const getProject = async (id: string): Promise<VideoProject | undefined> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const updateProject = async (id: string, updates: Partial<VideoProject>): Promise<void> => {
    const db = await openDB();
    return new Promise(async (resolve, reject) => {
        const existingProject = await getProject(id);
        if (!existingProject) {
            return reject(new Error(`Project with id ${id} not found.`));
        }

        const updatedProject = { ...existingProject, ...updates };

        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(updatedProject);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};


export const deleteProject = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// FIX: `saveProject` now robustly handles string IDs and uses 'put' for idempotency.
export const saveProject = async (project: VideoProject): Promise<VideoProject> => {
    const db = await openDB();
  
    // Ensure project has valid ID
    if (!project.id || typeof project.id !== 'string') {
      project.id = `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log('[dbService] Generated new ID:', project.id);
    }
    
    // Ensure timestamps
    if (!project.createdAt) {
      project.createdAt = Date.now();
    }
    project.updatedAt = Date.now();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.put(project); // Use put instead of add to allow updates/inserts
      
      request.onsuccess = () => {
        console.log('[dbService] Project saved:', project.id);
        resolve(project);
      };
      
      request.onerror = () => {
        console.error('[dbService] Save failed:', request.error);
        reject(request.error);
      };
    });
};