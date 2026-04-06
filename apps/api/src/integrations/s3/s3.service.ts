import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.getOrThrow<string>("S3_ENDPOINT");
    const region = this.configService.getOrThrow<string>("S3_REGION");
    const accessKeyId = this.configService.getOrThrow<string>("S3_ACCESS_KEY");
    const secretAccessKey = this.configService.getOrThrow<string>("S3_SECRET_KEY");

    this.bucket = this.configService.getOrThrow<string>("S3_BUCKET");

    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  getBucket() {
    return this.bucket;
  }

  async createSignedUploadUrl(params: {
    objectKey: string;
    contentType: string;
    expiresIn?: number;
  }) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.objectKey,
      ContentType: params.contentType,
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: params.expiresIn ?? 300,
    });

    return {
      bucket: this.bucket,
      objectKey: params.objectKey,
      url,
      expiresIn: params.expiresIn ?? 300,
    };
  }

  async createSignedDownloadUrl(params: {
    objectKey: string;
    expiresIn?: number;
  }) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: params.objectKey,
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: params.expiresIn ?? 300,
    });

    return {
      bucket: this.bucket,
      objectKey: params.objectKey,
      url,
      expiresIn: params.expiresIn ?? 300,
    };
  }
}
