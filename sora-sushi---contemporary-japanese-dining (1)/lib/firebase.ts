
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

import { collection, addDoc, serverTimestamp, doc, getDocFromServer } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);

// Use initializeFirestore with settings to enable long-polling and persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  experimentalForceLongPolling: true, // Forces long-polling for better compatibility with restricted networks
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection: OK");
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      // Permission denied still means we connected to the server successfully
      console.log("Firebase connection: OK (Authenticated access restricted)");
    } else if (error.message?.includes('offline') || error.code === 'unavailable') {
      console.error("Firebase connection: OFFLINE. Please check your internet or Firebase config.");
    } else {
      console.error("Firebase connection: FAILED", error);
    }
  }
}
// testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const createNotification = async (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  const path = 'notifications';
  try {
    await addDoc(collection(db, path), {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const notifyOwner = async (title: string, message: string) => {
  const OWNER_EMAIL = 'francasayo@gmail.com';
  // In a real app, you'd lookup the owner's UID in a profiles collection
  // For now we'll just log it or if we find a user with this email we notify them
  console.log(`Notification for owner (${OWNER_EMAIL}): ${title} - ${message}`);
  // If we had the owner's UID (which we usually do as they are the first user)
  // we would call createNotification(ownerUid, title, message);
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};
