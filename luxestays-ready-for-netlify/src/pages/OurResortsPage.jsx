import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Star, Search, Filter, ChevronRight, ListFilter, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const ALL_AMENITIES_LIST = ['Guided Treks', 'Campfire', 'Kerala Cuisine', 'Wi-Fi', 'Tea Factory Visit', 'Bonfire', 'Scenic Views', 'Adventure Activities', 'Pine Forests', 'Local Food', 'Dam View Rooms', 'Boating', 'Nature Walks', 'Houseboat Option', 'Backwater Cruise', 'Fresh Seafood', 'Pool', 'Spa', 'Beach Access', 'Surfing Lessons', 'Wildlife Safari', 'Ayurvedic Spa'];


const OurResortsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [allResorts, setAllResorts] = useState([]);
  const [filteredResorts, setFilteredResorts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
  const [priceRange, setPriceRange] = useState([500, 20000]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('rating_desc');
  const [numberOfGuests, setNumberOfGuests] = useState(location.state?.numberOfGuests || 1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchAllResorts() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('resorts')
          .select(`
            *,
            stay_options (capacity)
          `) // Fetch stay_options capacity to help with guest count filtering
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          const formattedData = data.map(r => ({
            ...r,
            pricePerNight: r.price_per_night,
            imageUrl: r.image_url,
            // Calculate max capacity from stay options or use resort capacity
            calculatedCapacity: r.stay_options?.reduce((max, so) => Math.max(max, so.capacity || 0), 0) || r.capacity || 1,
          }));
          setAllResorts(formattedData);
        }
      } catch (error) {
        console.error("Error fetching all resorts:", error);
        toast({ variant: "destructive", title: "Failed to load resorts", description: "Please try again later." });
      } finally {
        setLoading(false);
      }
    }
    fetchAllResorts();
  }, [toast]);

  useEffect(() => {
    let tempResorts = [...allResorts];

    if (searchTerm) {
      tempResorts = tempResorts.filter(resort =>
        (resort.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (resort.location?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    tempResorts = tempResorts.filter(
      resort => (resort.price_per_night || 0) >= priceRange[0] && (resort.price_per_night || 0) <= priceRange[1]
    );
    
    if (numberOfGuests > 0) {
      tempResorts = tempResorts.filter(resort => (resort.calculatedCapacity || 1) >= numberOfGuests);
    }

    if (selectedAmenities.length > 0) {
      tempResorts = tempResorts.filter(resort =>
        selectedAmenities.every(sa => (resort.amenities || []).map(a => a.toLowerCase()).includes(sa.toLowerCase()))
      );
    }
    
    switch (sortBy) {
      case 'price_asc':
        tempResorts.sort((a, b) => (a.price_per_night || 0) - (b.price_per_night || 0));
        break;
      case 'price_desc':
        tempResorts.sort((a, b) => (b.price_per_night || 0) - (a.price_per_night || 0));
        break;
      case 'rating_desc':
        tempResorts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default: // Popularity (simple placeholder, could be based on bookings or other metrics)
        tempResorts.sort((a, b) => ((b.rating || 0) * 10) - ((a.rating || 0) * 10)); 
        break;
    }

    setFilteredResorts(tempResorts);
  }, [searchTerm, priceRange, selectedAmenities, sortBy, allResorts, numberOfGuests]);

  const handleAmenityChange = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange([500, 20000]);
    setSelectedAmenities([]);
    setSortBy('rating_desc');
    setNumberOfGuests(1);
  };
  
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (index) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: index * 0.07, ease: "easeOut" }
    }),
    hover: { scale: 1.03, boxShadow: "0px 8px 25px hsla(var(--foreground-rgb), 0.1)", transition: { duration: 0.25 } }
  };

  if (loading) {
    return <div className="container mx-auto py-8 px-4 text-center text-muted-foreground">Loading resorts...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4 sm:px-6 lg:px-8"
    >
      <header className="mb-10 md:mb-12 text-center">
        <motion.h1 
          initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:"easeOut" }}
          className="text-4xl sm:text-5xl font-extrabold text-foreground mb-3"
        >
          Explore Kerala's Finest Resorts
        </motion.h1>
        <motion.p 
          initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.6, ease:"easeOut" }}
          className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Find your perfect sanctuary amidst lush landscapes, serene backwaters, and vibrant culture.
        </motion.p>
      </header>

      <div className="flex justify-end mb-4 lg:hidden">
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center">
          <ListFilter className="w-4 h-4 mr-2" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>
      
      <AnimatePresence>
      {showFilters && (
        <motion.aside 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:hidden col-span-1 space-y-6 p-6 bg-card rounded-xl shadow-lg mb-6 border border-border/50"
        >
          <FilterOptionsComponent {...{ searchTerm, setSearchTerm, priceRange, setPriceRange, ALL_AMENITIES_LIST, selectedAmenities, handleAmenityChange, sortBy, setSortBy, clearFilters, numberOfGuests, setNumberOfGuests }} isMobile={true} />
        </motion.aside>
      )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="hidden lg:block lg:col-span-1 space-y-6 p-6 bg-card rounded-xl shadow-lg h-fit sticky top-24 border border-border/50">
           <FilterOptionsComponent {...{ searchTerm, setSearchTerm, priceRange, setPriceRange, ALL_AMENITIES_LIST, selectedAmenities, handleAmenityChange, sortBy, setSortBy, clearFilters, numberOfGuests, setNumberOfGuests }} isMobile={false} />
        </aside>

        <main className="lg:col-span-3">
          {filteredResorts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {filteredResorts.map((resort, index) => (
                <motion.div
                  key={resort.id}
                  custom={index}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                >
                  <Card className="overflow-hidden shadow-lg h-full flex flex-col group bg-card border-border/50 rounded-xl transition-all duration-300 ease-in-out">
                    <div className="relative h-60 w-full overflow-hidden">
                      <img     
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-in-out"
                        alt={`Exterior view of ${resort.name} in ${resort.location}`} src="https://images.unsplash.com/photo-1674657059931-5ddc4d36592d" />
                      {resort.rating && (
                        <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-2.5 py-1 rounded-full text-xs font-semibold shadow-md flex items-center">
                          <Star className="w-3.5 h-3.5 inline mr-1 fill-current" /> {resort.rating}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
                    </div>
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="text-xl text-foreground group-hover:text-accent transition-colors duration-300 line-clamp-1">{resort.name}</CardTitle>
                      <p className="text-xs text-muted-foreground flex items-center pt-0.5">
                        <MapPin className="w-3.5 h-3.5 mr-1" />{resort.location}
                      </p>
                    </CardHeader>
                    <CardContent className="flex-grow pt-1 pb-3">
                      <div className="flex items-baseline mb-2">
                        <span className="text-xl font-semibold text-accent">₹{(resort.price_per_night || 0).toLocaleString('en-IN')}</span>
                        <span className="text-xs text-muted-foreground ml-1">/ night (avg)</span>
                      </div>
                       <div className="flex flex-wrap gap-1.5 mb-1">
                        {(resort.amenities || []).slice(0,3).map(tag => (
                          <span key={tag} className="text-[11px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 ease-in-out group-hover:shadow-md group-hover:scale-[1.02] py-2.5 text-sm" onClick={() => navigate(`/resort/${resort.id}`)}>
                        View Details <ChevronRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{opacity:0, y:30}} animate={{opacity:1, y:0}}
              className="text-center py-20 flex flex-col items-center justify-center h-full"
            >
              <Search className="w-20 h-20 text-muted-foreground/50 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-foreground mb-2">No Resorts Found</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">Try adjusting your search filters or explore all our Kerala resorts. Your perfect getaway might be just a click away!</p>
              <Button onClick={clearFilters} variant="outline">Clear All Filters</Button>
            </motion.div>
          )}
        </main>
      </div>
    </motion.div>
  );
};


const FilterOptionsComponent = ({ searchTerm, setSearchTerm, priceRange, setPriceRange, ALL_AMENITIES_LIST, selectedAmenities, handleAmenityChange, sortBy, setSortBy, clearFilters, numberOfGuests, setNumberOfGuests, isMobile }) => (
  <>
    <div className="flex justify-between items-center mb-3">
      <h3 className="text-xl font-semibold text-foreground flex items-center">
        <Filter className="w-5 h-5 mr-2 text-accent" /> Filters
      </h3>
      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-accent hover:text-accent/80">
        <XCircle className="w-3.5 h-3.5 mr-1" /> Clear All
      </Button>
    </div>
    <div>
      <Label htmlFor="search-resorts" className="text-sm font-medium text-foreground/90 mb-1.5 block">
        Search
      </Label>
      <Input
        id="search-resorts"
        type="text"
        placeholder="Resort name or location..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="bg-background/70 border-input focus:border-accent"
      />
    </div>

    <div>
      <Label htmlFor="price-range" className="text-sm font-medium text-foreground/90 mb-1.5 block">
        Price Range (₹)
      </Label>
      <Slider
        id="price-range"
        min={500}
        max={20000}
        step={100}
        value={priceRange}
        onValueChange={setPriceRange}
        className="mt-3 mb-1"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
        <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
      </div>
    </div>
    
    <div>
      <Label htmlFor="number-of-guests" className="text-sm font-medium text-foreground/90 mb-1.5 block">
        Number of Guests
      </Label>
      <Input
        id="number-of-guests"
        type="number"
        min="1"
        placeholder="Guests"
        value={numberOfGuests}
        onChange={(e) => setNumberOfGuests(Math.max(1, parseInt(e.target.value)))}
        className="bg-background/70 border-input focus:border-accent"
      />
    </div>

    <div>
      <Label className="text-sm font-medium text-foreground/90 mb-1.5 block">
       Amenities
      </Label>
      <ScrollArea className={`h-48 ${isMobile ? 'max-h-40' : 'max-h-60'} pr-3 custom-scrollbar border rounded-md p-2 bg-background/50`}>
        <div className="space-y-2">
          {ALL_AMENITIES_LIST.map(amenity => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={`amenity-${amenity.toLowerCase().replace(/\s+/g, '-')}`}
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={() => handleAmenityChange(amenity)}
                className="border-muted-foreground/50 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
              />
              <Label htmlFor={`amenity-${amenity.toLowerCase().replace(/\s+/g, '-')}`} className="text-xs font-normal text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                {amenity}
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
    
    <div>
      <Label htmlFor="sort-by" className="text-sm font-medium text-foreground/90 mb-1.5 block">
        Sort By
      </Label>
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger id="sort-by" className="bg-background/70 border-input focus:border-accent">
          <SelectValue placeholder="Sort resorts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rating_desc">Highest Rated</SelectItem>
          <SelectItem value="price_asc">Price: Low to High</SelectItem>
          <SelectItem value="price_desc">Price: High to Low</SelectItem>
          <SelectItem value="popularity">Popularity</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </>
);

export default OurResortsPage;