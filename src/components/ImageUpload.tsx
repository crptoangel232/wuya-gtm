import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Camera, X, Loader2, ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  signalId: string;
  images: { id: string; storage_path: string; file_name: string }[];
  onImagesChange: () => void;
  maxImages?: number;
}

export function ImageUpload({ signalId, images, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('produce-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast({ title: `Maximum ${maxImages} photos allowed`, variant: 'destructive' });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    setIsUploading(true);

    try {
      for (const file of filesToUpload) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) {
          toast({ title: `${file.name} is too large (max 5MB)`, variant: 'destructive' });
          continue;
        }

        const ext = file.name.split('.').pop();
        const storagePath = `${signalId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('produce-images')
          .upload(storagePath, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('signal_images')
          .insert({
            signal_id: signalId,
            storage_path: storagePath,
            file_name: file.name,
            file_size: file.size,
          });

        if (dbError) throw dbError;
      }

      toast({ title: `${filesToUpload.length} photo(s) uploaded` });
      onImagesChange();
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (imageId: string, storagePath: string) => {
    try {
      await supabase.storage.from('produce-images').remove([storagePath]);
      await supabase.from('signal_images').delete().eq('id', imageId);
      onImagesChange();
      toast({ title: 'Photo removed' });
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: 'Could not remove photo', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-3">
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={getPublicUrl(img.storage_path)}
                alt={img.file_name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <button
                onClick={() => handleDelete(img.id, img.storage_path)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            {isUploading ? 'Uploading...' : `Add Photos (${images.length}/${maxImages})`}
          </Button>
        </div>
      )}

      {images.length === 0 && !isUploading && (
        <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          <ImageIcon className="h-5 w-5" />
          <span>Add photos of the produce to help buyers see what's available</span>
        </div>
      )}
    </div>
  );
}
