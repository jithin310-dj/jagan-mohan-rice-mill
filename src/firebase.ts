import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Order } from './types';

const firebaseConfig = {
  apiKey: "AIzaSyC6tJ7_GWTbLZGs630-V1seZeYKF61qg7g",
  authDomain: "gothic-quota-r40ks.firebaseapp.com",
  projectId: "gothic-quota-r40ks",
  storageBucket: "gothic-quota-r40ks.firebasestorage.app",
  messagingSenderId: "623839918708",
  appId: "1:623839918708:web:b5424e4a9dae3733e3af21",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID
const databaseId = "ai-studio-jaganmohanricemi-10075640-dbab-4b8e-9e46-0a5f6c00ad8f";
export const db = getFirestore(app, databaseId);

// Initialize Functions
export const functions = getFunctions(app);

/**
 * Sends an automated confirmation email using a Firebase Cloud Function.
 * @param order The successfully placed Order object.
 */
export async function sendOrderConfirmation(order: Order): Promise<any> {
  try {
    const sendEmailFn = httpsCallable<{ order: Order }, { success: boolean; message: string }>(
      functions,
      'sendOrderConfirmationEmail'
    );
    const result = await sendEmailFn({ order });
    console.log('Confirmation email function response:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error triggering order confirmation email Cloud Function:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
