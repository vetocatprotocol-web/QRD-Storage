export class BackblazeB2Client {
    accountId;
    applicationKey;
    bucketId;
    constructor(config) {
        this.accountId = config.accountId;
        this.applicationKey = config.applicationKey;
        this.bucketId = config.bucketId;
    }
    async generateUploadUrl(fileName, contentType) {
        const auth = await this.authorizeAccount();
        const uploadUrlResponse = await this.fetchJson(`${auth.apiUrl}/b2_get_upload_url`, {
            method: 'POST',
            headers: {
                Authorization: auth.authorizationToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bucketId: this.bucketId }),
        });
        return `${uploadUrlResponse.uploadUrl}?bucketId=${encodeURIComponent(this.bucketId)}&fileName=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(contentType)}`;
    }
    async authorizeAccount() {
        const url = 'https://api.backblazeb2.com/b2api/v2/b2_authorize_account';
        const credentials = Buffer.from(`${this.accountId}:${this.applicationKey}`).toString('base64');
        return this.fetchJson(url, {
            method: 'GET',
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        });
    }
    async fetchJson(url, init) {
        const response = await fetch(url, init);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Backblaze B2 request failed: ${response.status} ${response.statusText} ${errorBody}`);
        }
        return response.json();
    }
}
