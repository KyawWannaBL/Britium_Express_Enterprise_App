import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { S3Service } from "src/integrations/s3/s3.service";

@Injectable()
export class UploadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async createSignedUpload(params: {
    kind: "IMAGE" | "PDF" | "DOCUMENT" | "SIGNATURE" | "LABEL" | "QR";
    mimeType: string;
    fileName: string;
    uploadedById?: string;
    shipmentId?: string;
    dataEntryRecordId?: string;
    comment?: string;
  }) {
    const safeFileName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectKey = `${params.kind.toLowerCase()}/${Date.now()}-${safeFileName}`;

    const signed = await this.s3Service.createSignedUploadUrl({
      objectKey,
      contentType: params.mimeType,
    });

    const attachment = await this.prisma.attachment.create({
      data: {
        kind: params.kind,
        bucket: signed.bucket,
        objectKey: signed.objectKey,
        mimeType: params.mimeType,
        fileName: params.fileName,
        uploadedById: params.uploadedById,
        shipmentId: params.shipmentId,
        dataEntryRecordId: params.dataEntryRecordId,
        comment: params.comment,
      },
    });

    return {
      attachment,
      upload: signed,
    };
  }

  async createSignedDownload(attachmentId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new Error("Attachment not found");
    }

    const download = await this.s3Service.createSignedDownloadUrl({
      objectKey: attachment.objectKey,
    });

    return {
      attachment,
      download,
    };
  }
}
