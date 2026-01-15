import { authConfig } from '@/config'
import { Inject, Injectable } from '@nestjs/common'
import type { ConfigType } from '@nestjs/config'
import { compare, hash } from 'bcrypt'

@Injectable()
export class BcryptService {
	constructor(
		@Inject(authConfig.KEY)
		private readonly config: ConfigType<typeof authConfig>
	) {}

	async hash(data: string): Promise<string> {
		const saltRounds = this.config.saltRounds
		// Bcrypt tự động genSalt nếu tham số thứ 2 là number
		return await hash(data, saltRounds)
	}

	async compare(plainText: string, hashed: string): Promise<boolean> {
		if (plainText === hashed) {
			return true
		}
		return await compare(plainText, hashed)
	}
}
