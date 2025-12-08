import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as ImageIcon, Trash2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { IMAGE_GALLERY, type GalleryImage } from "@shared/imageGallery";

interface DeletedImage extends GalleryImage {
  deletedAt: number; // Unix timestamp
  daysRemaining: number;
}

export function GalleryPanel() {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [deletedImages, setDeletedImages] = useState<DeletedImage[]>([]);
  const [selectedDeleted, setSelectedDeleted] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // Calculate days remaining for deleted images
  const updateDeletedImages = (images: DeletedImage[]): DeletedImage[] => {
    const now = Date.now();
    return images.map(img => {
      const daysPassed = Math.floor((now - img.deletedAt) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, 30 - daysPassed);
      return { ...img, daysRemaining };
    }).filter(img => img.daysRemaining > 0); // Auto-remove expired items
  };

  const handleImageClick = (imageId: string) => {
    if (isMultiSelectMode) {
      const newSelected = new Set(selectedImages);
      if (newSelected.has(imageId)) {
        newSelected.delete(imageId);
      } else {
        newSelected.add(imageId);
      }
      setSelectedImages(newSelected);
    } else {
      // Single select - toggle
      if (selectedImages.has(imageId)) {
        setSelectedImages(new Set());
      } else {
        setSelectedImages(new Set([imageId]));
      }
    }
  };

  const handleDeleteSelected = () => {
    if (selectedImages.size === 0) {
      toast.error("No images selected");
      return;
    }

    const now = Date.now();
    const imagesToDelete = IMAGE_GALLERY.filter(img => selectedImages.has(img.id));
    const newDeleted: DeletedImage[] = imagesToDelete.map(img => ({
      ...img,
      deletedAt: now,
      daysRemaining: 30
    }));

    setDeletedImages(prev => updateDeletedImages([...prev, ...newDeleted]));
    setSelectedImages(new Set());
    
    toast.success(`Moved ${imagesToDelete.length} image(s) to Recently Deleted`);
    
    // TODO: Update IMAGE_GALLERY to remove deleted images
    // This would require backend integration
  };

  const handleRestoreSelected = () => {
    if (selectedDeleted.size === 0) {
      toast.error("No images selected");
      return;
    }

    const imagesToRestore = deletedImages.filter(img => selectedDeleted.has(img.id));
    setDeletedImages(prev => updateDeletedImages(prev.filter(img => !selectedDeleted.has(img.id))));
    setSelectedDeleted(new Set());
    
    toast.success(`Restored ${imagesToRestore.length} image(s)`);
    
    // TODO: Add back to IMAGE_GALLERY
  };

  const handleDeleteNow = () => {
    if (selectedDeleted.size === 0) {
      toast.error("No images selected");
      return;
    }

    const count = selectedDeleted.size;
    setDeletedImages(prev => updateDeletedImages(prev.filter(img => !selectedDeleted.has(img.id))));
    setSelectedDeleted(new Set());
    
    toast.success(`Permanently deleted ${count} image(s)`);
    
    // TODO: Permanently delete from backend
  };

  const handleDeletedImageClick = (imageId: string) => {
    const newSelected = new Set(selectedDeleted);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedDeleted(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedImages.size === IMAGE_GALLERY.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(IMAGE_GALLERY.map(img => img.id)));
    }
  };

  const handleSelectAllDeleted = () => {
    if (selectedDeleted.size === deletedImages.length) {
      setSelectedDeleted(new Set());
    } else {
      setSelectedDeleted(new Set(deletedImages.map(img => img.id)));
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <ImageIcon className="mr-2 h-4 w-4" />
          Gallery
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>Image Gallery</SheetTitle>
          <SheetDescription>
            Manage your holiday bingo images
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="gallery" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery">
              Gallery ({IMAGE_GALLERY.length})
            </TabsTrigger>
            <TabsTrigger value="deleted">
              Recently Deleted ({deletedImages.length})
            </TabsTrigger>
          </TabsList>

          {/* Main Gallery Tab */}
          <TabsContent value="gallery" className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant={isMultiSelectMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setIsMultiSelectMode(!isMultiSelectMode);
                    setSelectedImages(new Set());
                  }}
                >
                  {isMultiSelectMode ? "Multi-Select ON" : "Multi-Select OFF"}
                </Button>
                {isMultiSelectMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedImages.size === IMAGE_GALLERY.length ? "Deselect All" : "Select All"}
                  </Button>
                )}
              </div>
              
              {selectedImages.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedImages.size} selected
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-3 gap-4">
              {IMAGE_GALLERY.map((image) => {
                const isSelected = selectedImages.has(image.id);
                return (
                  <div
                    key={image.id}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleImageClick(image.id)}
                  >
                    {isMultiSelectMode && (
                      <div className="absolute top-2 left-2 z-10">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleImageClick(image.id)}
                          className="bg-background"
                        />
                      </div>
                    )}
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-xs text-white truncate">{image.alt}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Recently Deleted Tab */}
          <TabsContent value="deleted" className="space-y-4">
            {deletedImages.length === 0 ? (
              <div className="text-center py-12">
                <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No recently deleted images</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Deleted images will appear here for 30 days
                </p>
              </div>
            ) : (
              <>
                {/* Controls */}
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllDeleted}
                  >
                    {selectedDeleted.size === deletedImages.length ? "Deselect All" : "Select All"}
                  </Button>
                  
                  {selectedDeleted.size > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedDeleted.size} selected
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRestoreSelected}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restore
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteNow}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Delete Now
                      </Button>
                    </div>
                  )}
                </div>

                {/* Deleted Images Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {deletedImages.map((image) => {
                    const isSelected = selectedDeleted.has(image.id);
                    return (
                      <div
                        key={image.id}
                        className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all opacity-60 ${
                          isSelected
                            ? "border-primary ring-2 ring-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handleDeletedImageClick(image.id)}
                      >
                        <div className="absolute top-2 left-2 z-10">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleDeletedImageClick(image.id)}
                            className="bg-background"
                          />
                        </div>
                        <div className="absolute top-2 right-2 z-10 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-semibold">
                          {image.daysRemaining}d
                        </div>
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full aspect-square object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-xs text-white truncate">{image.alt}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Images will be permanently deleted after 30 days
                </p>
              </>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
