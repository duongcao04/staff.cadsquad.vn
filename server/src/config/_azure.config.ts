import { registerAs } from '@nestjs/config'
import { z } from 'zod'

const schema = z.object({
	AZURE_TENANT_ID: z.string().uuid(),
	AZURE_CLIENT_ID: z.string().uuid(),
	AZURE_CLIENT_SECRET: z.string().min(1),
})

export default registerAs('azure', () => {
	const parsed = schema.safeParse(process.env)
	if (!parsed.success) {
		console.error('❌ Azure Config Error:', parsed.error.format())
		throw new Error('Invalid Azure/Microsoft Configuration')
	}
	return {
		azure: {
			tenantId: parsed.data.AZURE_TENANT_ID,
			clientId: parsed.data.AZURE_CLIENT_ID,
			clientSecret: parsed.data.AZURE_CLIENT_SECRET,
		},
	}
})
