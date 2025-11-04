const UPLOAD_API_URL = 'https://functions.poehali.dev/575c74cb-b97a-448b-b10a-c73b3b884705';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

export const uploadApi = {
  async uploadImage(file: File): Promise<UploadResponse> {
    const fileReader = new FileReader();
    
    return new Promise((resolve, reject) => {
      fileReader.onloadend = async () => {
        try {
          const base64Content = fileReader.result as string;
          
          const uploadResponse = await fetch(UPLOAD_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: base64Content,
              filename: file.name
            }),
          });
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Failed to upload image');
          }
          
          const uploadResult = await uploadResponse.json();
          resolve(uploadResult);
        } catch (uploadError) {
          reject(uploadError);
        }
      };
      
      fileReader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      fileReader.readAsDataURL(file);
    });
  }
};