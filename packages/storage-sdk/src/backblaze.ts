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

  // --- Large file / multipart helpers ---
  async startLargeFile(fileName: string, contentType = 'application/octet-stream'): Promise<{ fileId: string }> {
    const auth = await this.authorizeAccount();
    const url = `${auth.apiUrl}/b2_start_large_file`;
    const res = await this.fetchJson<{ fileId: string }>(url, {
      method: 'POST',
      headers: { Authorization: auth.authorizationToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucketId: this.bucketId, fileName, contentType }),
    });
    return res;
  }

  async getUploadPartUrl(fileId: string): Promise<{ uploadUrl: string; authorizationToken: string }> {
    const auth = await this.authorizeAccount();
    const url = `${auth.apiUrl}/b2_get_upload_part_url`;
    const res = await this.fetchJson<{ uploadUrl: string; authorizationToken: string }>(url, {
      method: 'POST',
      headers: { Authorization: auth.authorizationToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId }),
    });
    return res;
  }

  async uploadPart(uploadUrl: string, authorizationToken: string, partNumber: number, data: Uint8Array | Buffer): Promise<{ contentSha1: string }> {
    const headers: any = {
      Authorization: authorizationToken,
      'Content-Type': 'application/octet-stream',
    };
    // Backblaze expects X-Bz-Part-Number header
    headers['X-Bz-Part-Number'] = String(partNumber);

    const response = await fetch(uploadUrl, { method: 'POST', headers, body: data as any });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`b2_upload_part failed: ${response.status} ${response.statusText} ${err}`);
    }
    return response.json();
  }

  async finishLargeFile(fileId: string, partSha1Array: string[]): Promise<any> {
    const auth = await this.authorizeAccount();
    const url = `${auth.apiUrl}/b2_finish_large_file`;
    const res = await this.fetchJson<any>(url, {
      method: 'POST',
      headers: { Authorization: auth.authorizationToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, partSha1Array }),
    });
    return res;
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

  async getFileInfoByName(fileName: string): Promise<{ fileId: string; size: number; contentSha1: string } | null> {
    const auth = await this.authorizeAccount();
    // Use b2_list_file_names to search for the file (may require pagination in large buckets).
    const url = `${auth.apiUrl}/b2_list_file_names`;
    const body = { bucketId: this.bucketId, startFileName: fileName, maxFileCount: 100 };
    const res = await this.fetchJson<{ files: Array<{ fileId: string; fileName: string; size: number; contentSha1: string }> }>(
      url,
      {
        method: 'POST',
        headers: { Authorization: auth.authorizationToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );

    const found = res.files.find((f) => f.fileName === fileName);
    if (!found) return null;
    return { fileId: found.fileId, size: found.size, contentSha1: found.contentSha1 };
  }

  async getFileInfoById(fileId: string): Promise<{ fileName: string; size: number; contentSha1: string } | null> {
    const auth = await this.authorizeAccount();
    const url = `${auth.apiUrl}/b2_get_file_info`;
    const res = await this.fetchJson<{ fileName: string; size: number; contentSha1: string }>(url, {
      method: 'POST',
      headers: { Authorization: auth.authorizationToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId }),
    });

    if (!res) return null;
    return { fileName: res.fileName, size: res.size, contentSha1: res.contentSha1 };
  }

  async downloadFileById(fileId: string): Promise<ArrayBuffer> {
    const auth = await this.authorizeAccount();
    const url = `${auth.apiUrl}/b2api/v2/b2_download_file_by_id?fileId=${encodeURIComponent(fileId)}`;
    const response = await fetch(url, { method: 'GET', headers: { Authorization: auth.authorizationToken } });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`b2_download_file_by_id failed: ${response.status} ${response.statusText} ${err}`);
    }
    return await response.arrayBuffer();
  }

  async getFileInfo(fileId: string): Promise<any> {
    // Redirect to getFileInfoById for typed response
    return this.getFileInfoById(fileId);
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
