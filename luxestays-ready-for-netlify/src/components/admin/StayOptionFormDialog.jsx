import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ImageDown, ListChecks, DollarSign, BedDouble, BadgeInfo as InfoIcon, Image as ImageIcon, Users, CheckCircle, SlidersHorizontal } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const StayOptionFormDialog = ({ isOpen, setIsOpen, onSubmit, initialData, editingId }) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData({ 
      ...initialData, 
      pricingModel: initialData.pricingModel || 'per_option',
      availabilityStatus: initialData.availabilityStatus || 'available',
      capacity: initialData.capacity || 1,
    });
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) : value }));
  };

  const handleSelectChange = (name, value) => {
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
          <DialogTitle className="text-2xl font-semibold text-foreground">{editingId ? 'Edit Stay Option' : 'Add New Stay Option'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-y-4 gap-x-6 py-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <Label htmlFor="stay-name" className={labelClass}><BedDouble className="inline mr-1.5 h-4 w-4 text-accent"/>Stay Option Name</Label>
                <Input id="stay-name" name="name" value={formData.name || ''} onChange={handleInputChange} className={inputFieldClass} placeholder="e.g., Deluxe Pool Villa, Cozy Garden Tent" required/>
              </div>
              <div>
                <Label htmlFor="stay-price" className={labelClass}><DollarSign className="inline mr-1.5 h-4 w-4 text-accent"/>Price/Night (₹)</Label>
                <Input id="stay-price" name="price" type="number" value={formData.price || ''} onChange={handleInputChange} className={inputFieldClass} placeholder="e.g., 6000" required/>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                    <Label htmlFor="pricing-model" className={labelClass}><Users className="inline mr-1.5 h-4 w-4 text-accent"/>Pricing Model</Label>
                    <Select value={formData.pricingModel} onValueChange={(value) => handleSelectChange('pricingModel', value)}>
                        <SelectTrigger id="pricing-model" className={inputFieldClass}>
                            <SelectValue placeholder="Select pricing model" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="per_option">Price for Option (e.g., Villa)</SelectItem>
                            <SelectItem value="per_person">Price Per Person</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="availabilityStatus" className={labelClass}><CheckCircle className="inline mr-1.5 h-4 w-4 text-accent"/>Availability Status</Label>
                    <Select value={formData.availabilityStatus} onValueChange={(value) => handleSelectChange('availabilityStatus', value)}>
                        <SelectTrigger id="availabilityStatus" className={inputFieldClass}>
                            <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="limited">Limited Availability</SelectItem>
                            <SelectItem value="booked_out">Booked Out</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div>
                <Label htmlFor="capacity" className={labelClass}><Users className="inline mr-1.5 h-4 w-4 text-accent"/>Capacity (Max Guests)</Label>
                <Input id="capacity" name="capacity" type="number" min="1" value={formData.capacity || ''} onChange={handleInputChange} className={inputFieldClass} placeholder="e.g., 2"/>
            </div>
            <div>
              <Label htmlFor="stay-description" className={labelClass}><InfoIcon className="inline mr-1.5 h-4 w-4 text-accent"/>Description</Label>
              <Textarea id="stay-description" name="description" value={formData.description || ''} onChange={handleInputChange} className={`${inputFieldClass} min-h-[80px]`} placeholder="Detailed description of this stay option..."/>
            </div>
            <div>
              <Label htmlFor="stay-imageUrl" className={labelClass}><ImageDown className="inline mr-1.5 h-4 w-4 text-accent"/>Main Image URL Key</Label>
              <Input id="stay-imageUrl" name="imageUrl" value={formData.imageUrl || ''} onChange={handleInputChange} className={inputFieldClass} placeholder="e.g., kerala-pool-villa-main"/>
              <p className="text-xs text-muted-foreground mt-1">Key/name for image hosted elsewhere.</p>
            </div>
            <div>
              <Label htmlFor="stay-gallery" className={labelClass}><ImageIcon className="inline mr-1.5 h-4 w-4 text-accent"/>Stay Option Gallery Image URL Keys</Label>
              <Input id="stay-gallery" name="gallery" value={formData.gallery || ''} onChange={handleInputChange} className={inputFieldClass} placeholder="Comma-separated: suite-view1, suite-balcony"/>
            </div>
            <div>
              <Label htmlFor="stay-amenities" className={labelClass}><ListChecks className="inline mr-1.5 h-4 w-4 text-accent"/>Specific Amenities for this Option</Label>
              <Input id="stay-amenities" name="amenities" value={formData.amenities || ''} onChange={handleInputChange} className={inputFieldClass} placeholder="Comma-separated: Private Plunge Pool, Jacuzzi"/>
            </div>
          </div>
          <DialogFooter className="mt-6 pt-4 border-t border-border">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">{editingId ? 'Save Changes' : 'Add Stay Option'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StayOptionFormDialog;