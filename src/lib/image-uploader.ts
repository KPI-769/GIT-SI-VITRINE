// Helper utilitaire pour l'upload local de photos et vidéos
// Compresse intelligemment les images côté client avant stockage pour garantir rapidité et fluidité

export interface UploadedMediaItem {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  url: string; // Data URL Base64
  name: string;
  size: number;
  caption?: string;
}

export function readFileAsDataUrl(file: File): Promise<UploadedMediaItem> {
  return new Promise((resolve, reject) => {
    const isVideo = file.type.startsWith('video/');

    if (isVideo) {
      // Lecture directe pour les vidéos
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          type: 'VIDEO',
          url: reader.result as string,
          name: file.name,
          size: file.size,
          caption: file.name.replace(/\.[^/.]+$/, ''),
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    // Traitement d'image : redimensionnement / compression via Canvas HTML5
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new (window as any).Image();
      img.onload = () => {
        const MAX_WIDTH = 1400;
        const MAX_HEIGHT = 1050;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            type: 'IMAGE',
            url: e.target?.result as string,
            name: file.name,
            size: file.size,
            caption: file.name.replace(/\.[^/.]+$/, ''),
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Qualité 0.82 JPEG pour un rapport netteté/poids optimal
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

        resolve({
          id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          type: 'IMAGE',
          url: dataUrl,
          name: file.name,
          size: dataUrl.length,
          caption: file.name.replace(/\.[^/.]+$/, ''),
        });
      };
      img.onerror = () => {
        resolve({
          id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          type: 'IMAGE',
          url: e.target?.result as string,
          name: file.name,
          size: file.size,
          caption: file.name.replace(/\.[^/.]+$/, ''),
        });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function readMultipleFilesAsDataUrls(files: FileList | File[]): Promise<UploadedMediaItem[]> {
  const promises: Promise<UploadedMediaItem>[] = [];
  const fileArray = Array.from(files);

  for (const file of fileArray) {
    promises.push(readFileAsDataUrl(file));
  }

  return Promise.all(promises);
}
