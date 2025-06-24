import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ImageDown, ListChecks, DollarSign, MapPin as MapPinIcon, Star as StarIcon, BadgeInfo as InfoIcon, Image as ImageIcon, UploadCloud } from 'lucide-react';

const ResortFormDialog = ({ isOpen, setIsOpen, onSubmit, initialData, editingId }) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputFieldClass = "mt-1 block w-full";
  const labelClass = "text-sm font-medium text-muted-foreground";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 custom-scrollbar">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-semibold text-foreground">{editingId ? 'Edit Resort Details' : 'Add New Resort'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <Label htmlFor="name" className={labelClass}><InfoIcon className="inline mr-1.5 h-4 w-4 text-accent"/>Resort Name</Label>
                <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} className={inputFieldClass} placeholder="e.g., Paradise Cove Resort" required/>
              </div>
              <div>
                <Label htmlFor="location" className={labelClass}><MapPinIcon className="inline mr-1.5 h-4 w-4 text-accent"/>Location</Label>
                <Input id="location" name="location" value={formData.location || ''} onChange={handleInputChange} className={inputFieldClass} placeholder="e.g., Kerala, India" required/>
              </div>
            </div>
            <div>
              <Label htmlFor="description" className={labelClass}><InfoIcon className="inline mr-1.5 h-4 w-4 text-accent"/>Description</Label>
              <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} className={`${inputFieldClass} min-h-[100px]`} placeholder="Describe the resort, its unique features, and ambiance..."/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <Label htmlFor="pricePerNight" className={labelClass}><DollarSign className="inline mr-1.5 h-4 w-4 text-accent"/>Average Price/Night (₹)</Label>
                <Input id="pricePerNight" name="pricePerNight" type="number" value={formData.pricePerNight || ''} onChange={handleInputChange} className={inputFieldClass} placeholder="e.g., 4500"/>
                <p className="text-xs text-muted-foreground mt-1">Display only. Actual prices set per stay option.</p>
              </div>
              <div>
                <Label htmlFor="rating" className={labelClass}><StarIcon className="inline mr-1.5 h-4 w-4 text-accent"/>Rating (0-5)</Label>
                <Input id="rating" name="rating" type="number" step="0.1" min="0" max="5" value={formData.rating || ''} onChange={handleInputChange} className={inputFieldClass} placeholder="e.g., 4.7"/>
              </div>
            </div>
             <div>
                <Label htmlFor="imageUrl" className={labelClass}><ImageDown className="inline mr-1.5 h-4 w-4 text-accent"/>Main Image URL Key</Label>
                <Input id="imageUrl" name="imageUrl" value={formData.imageUrl || ''} onChange={handleInputChange} className={inputFieldClass} placeholder="e.g., kerala-resort-main-hero (for listing cards)"/>
                <p className="text-xs text-muted-foreground mt-1">This is a key/name for an image hosted elsewhere (e.g., Unsplash ID, or Supabase Storage path after setup).</p>
            </div>
            <div>
                <Label htmlFor="gallery" className={labelClass}><ImageIcon className="inline mr-1.5 h-4 w-4 text-accent"/>Resort Gallery Image URL Keys</Label>
                <Input id="gallery" name="gallery" value={formData.gallery || ''} onChange={handleInputChange} className={inputFieldClass} placeholder="Comma-separated: resort-lobby, resort-pool-view"/>
                <p className="text-xs text-muted-foreground mt-1">Provide comma-separated keys for multiple gallery images.</p>
            </div>
            <div>
                <Label className={labelClass}><UploadCloud className="inline mr-1.5 h-4 w-4 text-accent"/>Image Upload Note</Label>
                <p className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-md border border-border/70">
                  Direct image uploads require backend integration (e.g., Supabase Storage). For now, please use keys/names that correspond to images hosted externally or that you will upload to a service later.
                </p>
            </div>
            <div>
              <Label htmlFor="amenities" className={labelClass}><ListChecks className="inline mr-1.5 h-4 w-4 text-accent"/>Resort-Level Amenities</Label>
              <Input id="amenities" name="amenities" value={formData.amenities || ''} onChange={handleInputChange} className={inputFieldClass} placeholder="Comma-separated: Large Pool, Spa Center, Free Wi-Fi"/>
            </div>
          </div>
          <DialogFooter className="mt-6 pt-4 border-t border-border">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">{editingId ? 'Save Changes' : 'Add Resort'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResortFormDialog;