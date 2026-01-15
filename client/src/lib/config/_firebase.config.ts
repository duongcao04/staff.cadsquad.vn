import { envConfig } from './_env.config'

export const firebaseConfig = {
    apiKey: envConfig.FIREBASE.apiKey,
    authDomain: envConfig.FIREBASE.authDomain,
    databaseURL: envConfig.FIREBASE.databaseURL,
    projectId: envConfig.FIREBASE.projectId,
    storageBucket: envConfig.FIREBASE.storageBucket,
    messagingSenderId: envConfig.FIREBASE.messagingSenderId,
    appId: envConfig.FIREBASE.appId,
    measurementId: envConfig.FIREBASE.measurementId,
}
