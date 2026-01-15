export function renderTemplate(template: string, data: Record<string, string>) {
	return template.replace(/{{(\w+)}}/g, (_, key) => data[key] ?? '')
}