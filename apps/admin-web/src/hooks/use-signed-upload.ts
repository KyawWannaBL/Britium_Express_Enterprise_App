import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useSignedUpload() {
  return useMutation({
    mutationFn: async (payload: {
      kind: "IMAGE" | "PDF" | "DOCUMENT" | "SIGNATURE" | "LABEL" | "QR";
      mimeType: string;
      fileName: string;
      shipmentId?: string;
      dataEntryRecordId?: string;
      comment?: string;
    }) => {
      const response = await api.post("/api/uploads/signed-upload", payload);
      return response.data;
    },
  });
}
