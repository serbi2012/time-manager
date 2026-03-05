import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA0lZIaII1T18jX6lKygATpRr6ChJ4W-dU",
    authDomain: "timer-manager-f54b1.firebaseapp.com",
    projectId: "timer-manager-f54b1",
    storageBucket: "timer-manager-f54b1.firebasestorage.app",
    messagingSenderId: "993376896770",
    appId: "1:993376896770:web:f1b1d71d9c0117fa9be41b",
    measurementId: "G-BTMH0B061B",
};

let _auth: Auth;
let _db: Firestore;
let _googleProvider: InstanceType<
    typeof import("firebase/auth").GoogleAuthProvider
>;
let _initPromise: Promise<void> | null = null;

async function _init(): Promise<void> {
    const [{ initializeApp }, { getAuth, GoogleAuthProvider }, { getFirestore }] =
        await Promise.all([
            import("firebase/app"),
            import("firebase/auth"),
            import("firebase/firestore"),
        ]);

    const app = initializeApp(firebaseConfig);
    _auth = getAuth(app);
    _googleProvider = new GoogleAuthProvider();
    _db = getFirestore(app);
}

function ensureInit(): Promise<void> {
    if (!_initPromise) _initPromise = _init();
    return _initPromise;
}

export async function getAuthInstance(): Promise<Auth> {
    await ensureInit();
    return _auth;
}

export async function getDbInstance(): Promise<Firestore> {
    await ensureInit();
    return _db;
}

export async function getGoogleProviderInstance() {
    await ensureInit();
    return _googleProvider;
}
