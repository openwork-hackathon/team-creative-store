import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// ============================================================================
// Types
// ============================================================================

export type S3Config = {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
};

export type UploadImageInput = {
  key: string;
  data: Buffer;
  contentType: string;
};

export type UploadImageResult = {
  url: string;
  key: string;
};

// ============================================================================
// Errors
// ============================================================================

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "StorageError";
  }
}

// ============================================================================
// Helpers
// ============================================================================

export function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; mimeType: string } {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new StorageError("Invalid data URL format", "INVALID_DATA_URL");
  }

  const [, mimeType, base64Data] = matches;
  return {
    buffer: Buffer.from(base64Data, "base64"),
    mimeType
  };
}

export function mimeTypeToExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif"
  };
  return map[mimeType] ?? "png";
}

// ============================================================================
// S3 Storage Factory
// ============================================================================

export function createS3Storage(config: S3Config) {
  const client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    }
  });

  async function uploadImage(input: UploadImageInput): Promise<UploadImageResult> {
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: input.key,
          Body: input.data,
          ContentType: input.contentType
        })
      );

      const url = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${input.key}`;

      return { url, key: input.key };
    } catch (error) {
      const message = error instanceof Error ? error.message : "S3 upload failed";
      throw new StorageError(message, "S3_UPLOAD_FAILED");
    }
  }

  return { uploadImage };
}

export type S3Storage = ReturnType<typeof createS3Storage>;
