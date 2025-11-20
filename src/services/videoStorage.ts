// IndexedDB service for storing videos locally

const DB_NAME = 'KalpanaVideoDB';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

interface StoredVideo {
  id: string;
  projectId: string;
  productName: string;
  brandName: string;
  videoBlob: Blob;
  thumbnail?: string;
  duration: number;
  createdAt: string;
  metadata: any;
}

class VideoStorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
          resolve();
          return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('projectId', 'projectId', { unique: false });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async saveVideo(video: StoredVideo): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(video);

      request.onsuccess = () => {
        console.log('[VideoStorage] Video saved:', video.id);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getVideo(id: string): Promise<StoredVideo | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllVideos(): Promise<StoredVideo[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteVideo(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('[VideoStorage] Video deleted:', id);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getStorageSize(): Promise<number> {
    const videos = await this.getAllVideos();
    let totalSize = 0;
    
    for (const video of videos) {
      totalSize += video.videoBlob.size;
    }
    
    return totalSize;
  }

  async generateThumbnail(videoBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadeddata = () => {
        video.currentTime = 1; // Seek to 1 second to get a good frame
      };
      
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.7));
        URL.revokeObjectURL(video.src);
      };

      video.onerror = (e) => {
          reject(new Error('Failed to load video for thumbnail generation.'));
          URL.revokeObjectURL(video.src);
      };

      video.src = URL.createObjectURL(videoBlob);
    });
  }
}

export const videoStorage = new VideoStorageService();
