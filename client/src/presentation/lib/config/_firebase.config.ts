import { envConfig } from './_env.config'

export const firebaseConfig = {
    apiKey: envConfig?.firebase?.apiKey,
    authDomain: envConfig?.firebase?.authDomain,
    databaseURL: envConfig?.firebase?.databaseURL,
    projectId: envConfig?.firebase?.projectId,
    storageBucket: envConfig?.firebase?.storageBucket,
    messagingSenderId: envConfig?.firebase?.messagingSenderId,
    appId: envConfig?.firebase?.appId,
    measurementId: envConfig?.firebase?.measurementId,
}
