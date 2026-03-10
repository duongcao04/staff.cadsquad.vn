import { z } from 'zod';
import { ApiResponse, axiosClient } from "../axios";

/**
 * Fetch data từ API và validate thông qua Zod Schema.
 * @template T - Kiểu dữ liệu mong muốn sau khi parse.
 * @param {string} url - Endpoint của API.
 * @param {z.ZodType<T>} schema - Zod Schema tương ứng.
 * @returns {Promise<T>} Dữ liệu đã chuẩn hóa.
 */
export async function fetchAndParse<T>(
	url: string,
	schema: z.ZodType<T>
): Promise<T> {
	// 1. Thực hiện Request với Axios
	const res = await axiosClient.get<ApiResponse<any>>(url);

	// 2. Lấy dữ liệu thô từ field 'result' (tùy theo cấu trúc ApiResponse của dự án)
	const rawDataResponse = res.data.result ?? {};

	// 3. Kiểm chứng dữ liệu bằng safeParse (không quăng error ra console)
	const parsedResult = schema.safeParse(rawDataResponse);

	if (!parsedResult.success) {
		console.error(`❌ [Zod Validation Failed] tại URL: ${url}`);
		console.error("Chi tiết lỗi:", parsedResult.error.format());

		// Trả về object chứa các giá trị mặc định đã định nghĩa trong Schema
		return schema.parse({});
	}

	// 4. Trả về dữ liệu sạch (đã lọc field thừa và ép kiểu thành công)
	return parsedResult.data;
}