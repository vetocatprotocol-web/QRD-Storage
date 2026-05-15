export interface BackblazeConfig {
  accountId: string;
  applicationKey: string;
  bucketId: string;
}

interface AuthorizeAccountResponse {
  apiUrl: string;
  authorizationToken: string;
}

interface UploadUrlPayload {
  uploadUrl: string;
  authorizationToken: string;
}

export class BackblazeB2Client {
  private readonly accountId: string;
  private readonly applicationKey: string;
  private readonly bucketId: string;

  constructor(config: BackblazeConfig) {
    this.accountId = config.accountId;
    this.applicationKey = config.applicationKey;
    this.bucketId = config.bucketId;
  }

  async generateUploadUrl(fileName: string, contentType: string): Promise<UploadUrlPayload> {
    const auth = await this.authorizeAccount();
    const uploadUrlResponse = await this.fetchJson<UploadUrlPayload>(
      `${auth.apiUrl}/b2_get_upload_url`,
      {
        method: 'POST',
        headers: {
          Authorization: auth.authorizationToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bucketId: this.bucketId }),
      },
    );

    return uploadUrlResponse;
  }

  private async authorizeAccount(): Promise<AuthorizeAccountResponse> {
    const url = 'https://api.backblazeb2.com/b2api/v2/b2_authorize_account';
    const credentials = Buffer.from(`${this.accountId}:${this.applicationKey}`).toString('base64');
    return this.fetchJson<AuthorizeAccountResponse>(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });
  }

  private async fetchJson<T>(url: string, init: RequestInit): Promise<T> {
    const response = await fetch(url, init);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Backblaze B2 request failed: ${response.status} ${response.statusText} ${errorBody}`);
    }
    return response.json() as Promise<T>;
  }
}
