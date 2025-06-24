import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle } from 'lucide-react';
import ResortFormDialog from '@/components/admin/ResortFormDialog';
import StayOptionFormDialog from '@/components/admin/StayOptionFormDialog';
import ResortListItem from '@/components/admin/ResortListItem';
import { supabase } from '@/lib/supabaseClient';

const initialResortFormState = {
  id: '', name: '', location: '', description: '', price_per_night: '', rating: '', image_url: '', gallery: [], amenities: [], capacity: 0,
};

const initialStayOptionFormState = {
  id: '', name: '', price: '', pricing_model: 'per_option', availability_status: 'available', capacity: 1, description: '', amenities: [], image_url: '', gallery: [],
};

const AdminResortsTab = ({ adminUser }) => {
  const { toast } = useToast();
  const [resorts, setResorts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isResortDialogOpen, setIsResortDialogOpen] = useState(false);
  const [isStayOptionDialogOpen, setIsStayOptionDialogOpen] = useState(false);

  const [currentResortData, setCurrentResortData] = useState(initialResortFormState);
  const [currentStayOptionData, setCurrentStayOptionData] = useState(initialStayOptionFormState);

  const [editingResortId, setEditingResortId] = useState(null);
  const [editingStayOptionParentId, setEditingStayOptionParentId] = useState(null);
  const [editingStayOptionId, setEditingStayOptionId] = useState(null);

  const CEO_ROLE = "CEO";
  const RESORT_OWNER_ROLE = "ResortOwner";
  const currentAdminRole = adminUser?.role || CEO_ROLE;
  const currentAdminResortId = adminUser?.resortId || null;

  async function fetchResorts() {
    setLoading(true);
    try {
      const { data: resortsData, error: resortsError } = await supabase
        .from('resorts')
        .select(`
          *,
          stay_options (*)
        `)
        .order('created_at', { ascending: false });

      if (resortsError) throw resortsError;

      if (resortsData) {
         setResorts(resortsData.map(r => ({
            ...r,
            pricePerNight: r.price_per_night, // map from db
            imageUrl: r.image_url,
            stayOptions: (r.stay_options || []).map(so => ({
              ...so,
              imageUrl: so.image_url,
              pricingModel: so.pricing_model,
              availabilityStatus: so.availability_status,
            }))
         })));
      }
    } catch (error) {
      console.error("Error fetching resorts:", error);
      toast({ variant: "destructive", title: "Failed to load resorts", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResorts();
  }, []);


  const openNewResortDialog = () => {
    if (currentAdminRole !== CEO_ROLE) {
      toast({ variant: "destructive", title: "Permission Denied", description: "Only CEO can add new resorts." });
      return;
    }
    setEditingResortId(null);
    setCurrentResortData({ ...initialResortFormState, gallery: '', amenities: '' });
    setIsResortDialogOpen(true);
  };

  const openEditResortDialog = (resort) => {
    if (currentAdminRole !== CEO_ROLE && resort.id !== currentAdminResortId) {
      toast({ variant: "destructive", title: "Permission Denied", description: "You can only edit your assigned resort." });
      return;
    }
    setEditingResortId(resort.id);
    setCurrentResortData({
      ...resort,
      pricePerNight: resort.price_per_night || resort.pricePerNight,
      imageUrl: resort.image_url || resort.imageUrl,
      amenities: resort.amenities ? resort.amenities.join(', ') : '',
      gallery: resort.gallery ? resort.gallery.join(', ') : '',
    });
    setIsResortDialogOpen(true);
  };

  const handleResortSubmit = async (formData) => {
    const { id, name, location, description, pricePerNight, rating, imageUrl, gallery, amenities, capacity } = formData;
    const processedData = {
      name, location, description,
      price_per_night: parseFloat(pricePerNight) || null,
      rating: parseFloat(rating) || null,
      image_url: imageUrl,
      gallery: typeof gallery === 'string' ? gallery.split(',').map(item => item.trim()).filter(Boolean) : gallery,
      amenities: typeof amenities === 'string' ? amenities.split(',').map(item => item.trim()).filter(Boolean) : amenities,
      capacity: parseInt(capacity) || null,
    };

    try {
      if (editingResortId) {
        const { error } = await supabase.from('resorts').update(processedData).eq('id', editingResortId);
        if (error) throw error;
        toast({ title: "Resort Updated", description: `${name} has been updated.` });
      } else {
        const { error } = await supabase.from('resorts').insert(processedData);
        if (error) throw error;
        toast({ title: "Resort Added", description: `${name} has been added.` });
      }
      fetchResorts();
      setIsResortDialogOpen(false);
    } catch (error) {
      console.error("Error saving resort:", error);
      toast({ variant: "destructive", title: "Failed to save resort", description: error.message });
    }
  };

  const deleteResort = async (resortId) => {
    if (currentAdminRole !== CEO_ROLE) {
      toast({ variant: "destructive", title: "Permission Denied", description: "Only CEO can delete resorts." });
      return;
    }
    try {
      const { error } = await supabase.from('resorts').delete().eq('id', resortId);
      if (error) throw error;
      toast({ title: "Resort Deleted", description: "The resort has been removed." });
      fetchResorts();
    } catch (error) {
      console.error("Error deleting resort:", error);
      toast({ variant: "destructive", title: "Failed to delete resort", description: error.message });
    }
  };

  const openNewStayOptionDialog = (resortId) => {
    if (currentAdminRole !== CEO_ROLE && resortId !== currentAdminResortId) {
      toast({ variant: "destructive", title: "Permission Denied", description: "You can only add stay options to your assigned resort." });
      return;
    }
    setEditingStayOptionParentId(resortId);
    setEditingStayOptionId(null);
    setCurrentStayOptionData({ ...initialStayOptionFormState, gallery: '', amenities: '' });
    setIsStayOptionDialogOpen(true);
  };

  const openEditStayOptionDialog = (resortId, stayOption) => {
    if (currentAdminRole !== CEO_ROLE && resortId !== currentAdminResortId) {
      toast({ variant: "destructive", title: "Permission Denied", description: "You can only edit stay options for your assigned resort." });
      return;
    }
    setEditingStayOptionParentId(resortId);
    setEditingStayOptionId(stayOption.id);
    setCurrentStayOptionData({
      ...stayOption,
      imageUrl: stayOption.image_url || stayOption.imageUrl,
      pricingModel: stayOption.pricing_model || stayOption.pricingModel,
      availabilityStatus: stayOption.availability_status || stayOption.availabilityStatus,
      amenities: stayOption.amenities ? stayOption.amenities.join(', ') : '',
      gallery: stayOption.gallery ? stayOption.gallery.join(', ') : '',
    });
    setIsStayOptionDialogOpen(true);
  };

  const handleStayOptionSubmit = async (formData) => {
    const { name, price, pricingModel, availabilityStatus, capacity, description, amenities, imageUrl, gallery } = formData;
    const processedData = {
      resort_id: editingStayOptionParentId, name, description,
      price: parseFloat(price) || 0,
      pricing_model: pricingModel,
      availability_status: availabilityStatus,
      capacity: parseInt(capacity) || 1,
      image_url: imageUrl,
      gallery: typeof gallery === 'string' ? gallery.split(',').map(item => item.trim()).filter(Boolean) : gallery,
      amenities: typeof amenities === 'string' ? amenities.split(',').map(item => item.trim()).filter(Boolean) : amenities,
    };

    try {
      if (editingStayOptionId) {
        const { error } = await supabase.from('stay_options').update(processedData).eq('id', editingStayOptionId);
        if (error) throw error;
        toast({ title: "Stay Option Updated", description: `${name} has been updated.` });
      } else {
        const { error } = await supabase.from('stay_options').insert(processedData);
        if (error) throw error;
        const resortName = resorts.find(r => r.id === editingStayOptionParentId)?.name || 'the resort';
        toast({ title: "Stay Option Added", description: `${name} has been added to ${resortName}.` });
      }
      fetchResorts(); // Re-fetch all resorts to update parent with new/updated stay option
      setIsStayOptionDialogOpen(false);
    } catch (error) {
      console.error("Error saving stay option:", error);
      toast({ variant: "destructive", title: "Failed to save stay option", description: error.message });
    }
  };

  const deleteStayOption = async (resortId, stayOptionId) => {
    if (currentAdminRole !== CEO_ROLE && resortId !== currentAdminResortId) {
      toast({ variant: "destructive", title: "Permission Denied", description: "You can only delete stay options for your assigned resort." });
      return;
    }
    try {
      const { error } = await supabase.from('stay_options').delete().eq('id', stayOptionId);
      if (error) throw error;
      toast({ title: "Stay Option Deleted", description: "The stay option has been removed." });
      fetchResorts();
    } catch (error) {
      console.error("Error deleting stay option:", error);
      toast({ variant: "destructive", title: "Failed to delete stay option", description: error.message });
    }
  };
  
  const getFilteredResorts = () => {
    if (currentAdminRole === RESORT_OWNER_ROLE && currentAdminResortId) {
      return resorts.filter(r => r.id === currentAdminResortId);
    }
    return resorts;
  };
  const visibleResorts = getFilteredResorts();

  if (loading) {
    return <p className="text-center text-muted-foreground py-10">Loading resort data from Supabase...</p>;
  }

  return (
    <>
      {currentAdminRole === CEO_ROLE && (
        <div className="flex justify-end mb-6">
            <Button onClick={openNewResortDialog} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Resort
            </Button>
        </div>
        )}
      <ResortFormDialog
        isOpen={isResortDialogOpen}
        setIsOpen={setIsResortDialogOpen}
        onSubmit={handleResortSubmit}
        initialData={currentResortData}
        editingId={editingResortId}
      />
      <StayOptionFormDialog
        isOpen={isStayOptionDialogOpen}
        setIsOpen={setIsStayOptionDialogOpen}
        onSubmit={handleStayOptionSubmit}
        initialData={currentStayOptionData}
        editingId={editingStayOptionId}
      />
      <div className="space-y-6">
        {visibleResorts.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-10 text-center">
              <p className="text-lg text-muted-foreground">
                {currentAdminRole === RESORT_OWNER_ROLE ? "Your assigned resort is not configured yet." : "No resorts added yet."}
              </p>
              {currentAdminRole === CEO_ROLE &&
                <p className="text-sm text-muted-foreground">Click "Add New Resort" to get started!</p>
              }
            </CardContent>
          </Card>
        ) : (
          visibleResorts.map(resort => (
            <ResortListItem
              key={resort.id}
              resort={resort}
              onEditResort={openEditResortDialog}
              onDeleteResort={deleteResort}
              onAddStayOption={openNewStayOptionDialog}
              onEditStayOption={openEditStayOptionDialog}
              onDeleteStayOption={deleteStayOption}
              adminRole={currentAdminRole}
            />
          ))
        )}
      </div>
    </>
  );
};

export default AdminResortsTab;