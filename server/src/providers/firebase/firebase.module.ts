import { firebaseConfig } from '@/config'
import { Global, Module, Provider } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import * as admin from 'firebase-admin'
import { FirebaseService } from './firebase.service'

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN'

const firebaseProvider: Provider = {
	provide: FIREBASE_ADMIN,
	inject: [firebaseConfig.KEY],
	useFactory: (config: ConfigType<typeof firebaseConfig>) => {
		// Logic xử lý Singleton (Tránh lỗi initialized when hot-reload)
		if (admin.apps.length > 0) {
			return admin.app()
		}

		return admin.initializeApp({
			credential: admin.credential.cert({
				projectId: config.FIREBASE_PROJECT_ID,
				clientEmail: config.FIREBASE_CLIENT_EMAIL,
				// Xử lý ký tự xuống dòng trong Private Key từ .env
				privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
			}),
			databaseURL: config.FIREBASE_DATABASE_URL,
		})
	},
}

@Global()
@Module({
	providers: [firebaseProvider, FirebaseService],
	exports: [FIREBASE_ADMIN, FirebaseService],
})
export class FirebaseModule {}
