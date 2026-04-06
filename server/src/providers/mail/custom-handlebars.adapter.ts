import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

export class CustomHandlebarsAdapter {
	// Cache compiled templates in memory so we don't read from disk on every email sent
	private precompiledTemplates: Record<string, handlebars.TemplateDelegate> = {};

	// 1. Changed 'Function' to 'any' so it safely accepts your custom 'eq' helper
	constructor(private readonly helpers: Record<string, any> = {}) {
		Object.keys(this.helpers).forEach((key) => {
			// 2. Cast it as 'handlebars.HelperDelegate' to satisfy the strict TypeScript compiler
			handlebars.registerHelper(key, this.helpers[key] as handlebars.HelperDelegate);
		});
	}

	public compile(mail: any, callback: (err?: any) => void, mailerOptions: any): void {
		const templateExt = '.hbs';
		const templateName = mail.data.template;
		const templateDir = mailerOptions.template?.dir || '';
		const templatePath = path.join(templateDir, templateName + templateExt);

		try {
			// Check cache first
			if (!this.precompiledTemplates[templateName]) {
				const templateContent = fs.readFileSync(templatePath, 'utf-8');
				this.precompiledTemplates[templateName] = handlebars.compile(
					templateContent,
					mailerOptions.template?.options
				);
			}

			// Execute the template with the provided context variables
			mail.data.html = this.precompiledTemplates[templateName](mail.data.context);

			return callback(); // Success
		} catch (err) {
			return callback(err); // Failure
		}
	}
}