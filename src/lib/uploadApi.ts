const UPLOAD_API_URL = 'https://functions.poehali.dev/575c74cb-b97a-448b-b10a-c73b3b884705';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

export const uploadApi = {
  async uploadImage(file: File): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          
          const response = await fetch(UPLOAD_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: base64data,
              filename: file.name
            }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to upload image');
          }
          
          const result = await response.json();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }
};
