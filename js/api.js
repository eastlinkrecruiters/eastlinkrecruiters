// API Wrapper - Firestore CRUD, Functions calls
import { addDoc, getDoc, setDoc, updateDoc, deleteDoc, collection, doc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js';
import { httpsCallable } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-functions.js';

const { db, storage, app } = FirebaseApp;

export async function apiCall(action, data = {}) {
  try {
    const uid = FirebaseApp.auth.currentUser?.uid;
    if (!uid && !['signin', 'signup'].includes(action)) throw new Error('Not authenticated');

    switch (action) {
      case 'createUser':
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, { ...data, role: data.role, createdAt: serverTimestamp(), premium: false });
        return userRef;

      case 'getUserRole':
        const userDoc = await getDoc(doc(db, 'users', uid));
        return userDoc.exists() ? userDoc.data().role : null;

      case 'getUserProfile':
        const profileDoc = await getDoc(doc(db, 'users', uid));
        return profileDoc.exists() ? profileDoc.data() : {};

      case 'updateProfile':
        await updateDoc(doc(db, 'users', uid), data);
        return { success: true };

      case 'submitApplication':
        const appRef = await addDoc(collection(db, 'applications'), { ...data, seekerId: uid, timestamp: serverTimestamp(), status: 'pending' });
        // Realtime update job filled for free
        if (data.jobType === 'free') {
          const jobDoc = doc(db, 'jobs', data.jobId);
          await updateDoc(jobDoc, { filled: uid, status: 'filled' });
        }
        return appRef;

      case 'getPremiumJobs':
        const premiumQuery = query(collection(db, 'jobs'), where('premium', '==', true), where('status', '==', 'approved'));
        const snap = await getDocs(premiumQuery); // Import getDocs if needed
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));

      case 'upgradePremium':
        await updateDoc(doc(db, 'users', data.uid), { premium: true, upgradedAt: serverTimestamp() });
        // Functions for payment log
        await callableFunction('logUpgrade', data);
        return { success: true };

      case 'getNotifications':
        const notifsQuery = query(collection(db, 'notifications'), where('uid', '==', uid), orderBy('timestamp', 'desc'));
        const notifSnap = await getDocs(notifsQuery);
        return notifSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      case 'markRead':
        data.ids.forEach(id => updateDoc(doc(db, 'notifications', id), { read: true }));
        return { success: true };

      case 'deleteNotification':
        await deleteDoc(doc(db, 'notifications', data.id));
        return { success: true };

      case 'toggleAlerts':
        await updateDoc(doc(db, 'users', data.uid), { alertsEnabled: data.enabled });
        if (data.enabled) {
          // Subscribe FCM topic via Functions
          await callableFunction('subscribeFCM', { uid: data.uid });
        }
        return { success: true };

      case 'getAdminMetrics':
        return await callableFunction('getMetrics'); // Functions aggregate

      case 'getAdminLogs':
        const logsQuery = query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(50));
        const logsSnap = await getDocs(logsQuery);
        return logsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      case 'sendNotification':
        await addDoc(collection(db, 'notifications'), { ...data, uid: data.uid || uid, timestamp: serverTimestamp(), read: false });
        // Push via FCM Functions
        await callableFunction('sendFCM', data);
        return { success: true };

      case 'uploadCV':
        const cvRef = ref(storage, `cvs/${uid}/${data.fileName}`);
        await uploadBytes(cvRef, data.file);
        const url = await getDownloadURL(cvRef);
        await updateDoc(doc(db, 'users', uid), { cvUrl: url });
        return url;

      // Add more: getJobs, postJob, etc.
      default:
        return await callableFunction(action, data);
    }
  } catch (error) {
    console.error('API Error:', error);
    throw error; // Handled by error-handler.js
  }
}

async function callableFunction(funcName, data = {}) {
  const functions = getFunctions(app);
  const callable = httpsCallable(functions, funcName);
  const result = await callable(data);
  return result.data;
}

// Render utils etc. can be here or in dashboard
export { apiCall }; // Default export for convenience
