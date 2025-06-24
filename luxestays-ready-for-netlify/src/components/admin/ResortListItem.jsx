import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Eye, EyeOff, Star, DollarSign, BedDouble, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const ResortListItem = ({ resort, onEditResort, onDeleteResort, onAddStayOption, onEditStayOption, onDeleteStayOption, adminRole }) => {
  const isCEO = adminRole === "CEO"; // Or any other logic to determine full access

  const getAvailabilityLabel = (status) => {
    switch (status) {
      case 'available': return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">Available</Badge>;
      case 'limited': return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-black">Limited</Badge>;
      case 'booked_out': return <Badge variant="destructive">Booked Out</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };


  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border border-border/70 rounded-xl overflow-hidden">
        <CardHeader className="bg-secondary/30 p-4 sm:p-5 border-b border-border/70">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
            <div className="flex-grow">
              <CardTitle className="text-xl sm:text-2xl font-semibold text-foreground flex items-center">
                <Building className="w-5 h-5 mr-2 text-accent flex-shrink-0" />
                {resort.name}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground">{resort.location}</CardDescription>
            </div>
            {isCEO && (
              <div className="flex space-x-2 flex-shrink-0 mt-2 sm:mt-0">
                <Button variant="outline" size="sm" onClick={() => onEditResort(resort)} className="text-xs">
                  <Edit className="mr-1 h-3.5 w-3.5" /> Edit Resort
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDeleteResort(resort.id)} className="text-xs">
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 space-y-4">
          <p className="text-sm text-foreground/80 mb-2 line-clamp-2">{resort.description || "No description available."}</p>
          <div className="text-sm flex flex-wrap gap-x-4 gap-y-1 items-center">
            {resort.pricePerNight > 0 && 
              <span className="font-medium text-foreground flex items-center"><DollarSign className="w-3.5 h-3.5 mr-1 text-muted-foreground"/>Avg. ₹{resort.pricePerNight.toLocaleString('en-IN')}</span>
            }
            {resort.rating > 0 &&
              <span className="font-medium text-foreground flex items-center"><Star className="w-3.5 h-3.5 mr-1 text-yellow-500 fill-yellow-500"/>{resort.rating}</span>
            }
          </div>
          
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-foreground mb-1.5">Resort Amenities:</h4>
            {resort.amenities && resort.amenities.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {resort.amenities.map(am => <Badge key={am} variant="secondary" className="text-xs font-normal">{am}</Badge>)}
              </div>
            ) : <p className="text-xs text-muted-foreground">No resort-level amenities listed.</p>}
          </div>

          <div className="border-t border-border/70 pt-3">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-base sm:text-lg font-semibold text-foreground flex items-center">
                <BedDouble className="w-4 h-4 mr-2 text-accent"/>
                Stay Options
              </h4>
              <Button variant="outline" size="sm" onClick={() => onAddStayOption(resort.id)} className="border-accent text-accent hover:bg-accent/10 hover:text-accent text-xs">
                <PlusCircle className="mr-1.5 h-4 w-4" /> Add Option
              </Button>
            </div>
            {resort.stayOptions && resort.stayOptions.length > 0 ? (
              <div className="space-y-2.5">
                {resort.stayOptions.map(so => (
                  <Card key={so.id} className="p-3 bg-background hover:shadow-sm transition-shadow border border-border/50 rounded-md">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div className="flex-grow">
                        <p className="font-semibold text-foreground text-sm sm:text-base">{so.name} - <span className="text-accent font-bold">₹{so.price ? so.price.toLocaleString('en-IN') : 'N/A'}{so.pricingModel === 'per_person' ? '/person' : ''}/night</span></p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 mb-1">{so.description || "No description."}</p>
                        <div className="flex items-center space-x-2 mb-1.5">
                            {getAvailabilityLabel(so.availabilityStatus)}
                            {so.capacity > 0 && <Badge variant="outline" className="text-xs">{so.capacity} Guest{so.capacity > 1 ? 's' : ''}</Badge>}
                        </div>
                        {so.amenities && so.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {so.amenities.slice(0,3).map(sAm => <Badge key={sAm} variant="outline" className="text-xs font-normal">{sAm}</Badge>)}
                            {so.amenities.length > 3 && <Badge variant="outline" className="text-xs font-normal">+{so.amenities.length - 3} more</Badge>}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-1.5 flex-shrink-0 mt-1 sm:mt-0 self-start sm:self-center">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditStayOption(resort.id, so)}>
                          <Edit className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDeleteStayOption(resort.id, so.id)}>
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">No stay options added for this resort yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ResortListItem;