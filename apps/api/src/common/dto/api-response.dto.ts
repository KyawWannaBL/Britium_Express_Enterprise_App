export type ApiMeta = { page?: number; pageSize?: number; total?: number; [key: string]: unknown; };
export class ApiResponseDto<T> {
  ok: boolean; message: string; data: T; meta?: ApiMeta;
  constructor(params: { ok?: boolean; message?: string; data: T; meta?: ApiMeta; }) {
    this.ok = params.ok ?? true;
    this.message = params.message ?? "Success";
    this.data = params.data;
    this.meta = params.meta;
  }
}
export function okResponse<T>(data: T, message = "Success", meta?: ApiMeta) {
  return new ApiResponseDto<T>({ ok: true, message, data, meta });
}
