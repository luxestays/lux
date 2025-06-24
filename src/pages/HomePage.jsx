import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { MapPin, CalendarDays, Users, Search, Wifi, Droplets, Sun, Percent, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { supabase } from '@/lib/supabaseClient';

const HomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resorts, setResorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null); 
  const [numberOfGuests, setNumberOfGuests] = useState(1);

  useEffect(() => {
    async function fetchTopResorts() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('resorts')
          .select('*')
          .order('rating', { ascending: false })
          .limit(3);

        if (error) throw error;
        if (data) {
          const formattedData = data.map(r => ({
            ...r,
            pricePerNight: r.price_per_night,
            imageUrl: r.image_url,
            // Simple placeholder for shortDescription and stayType if not in db
            shortDescription: r.description ? r.description.substring(0, 100) + '...' : `Beautiful stay in ${r.location.split(',')[0]}.`,
            stayType: r.name.toLowerCase().includes('villa') ? 'Villa' : (r.name.toLowerCase().includes('suite') ? 'Suite' : 'Resort Room')
          }));
          setResorts(formattedData);
        }
      } catch (error) {
        console.error("Error fetching top resorts:", error);
        toast({ variant: "destructive", title: "Failed to load resorts", description: "Please try again later." });
        // Fallback to localStorage or initial data if Supabase fails for demonstration
        const storedResorts = JSON.parse(localStorage.getItem('resorts')) || [];
         setResorts(storedResorts.slice(0,3).map(r => ({
            ...r,
            shortDescription: r.shortDescription || `Beautiful stay in ${r.location.split(',')[0]}.`,
            stayType: r.stayType || (r.name.toLowerCase().includes('villa') ? 'Villa' : 'Resort Room')
        })));

      } finally {
        setLoading(false);
      }
    }
    fetchTopResorts();
  }, [toast]);

  const handleSearch = () => {
    if (!searchTerm && !checkInDate && !checkOutDate && numberOfGuests <=0) {
      toast({
        variant: "destructive",
        title: "Search Incomplete",
        description: "Please enter a location, select dates, or specify number of guests.",
      });
      return;
    }
    navigate('/our-resorts', { state: { searchTerm, checkInDate, checkOutDate, numberOfGuests } });
  };

  const popularAmenities = [
    { name: "Wi-Fi", icon: Wifi },
    { name: "Swimming", icon: Droplets },
    { name: "Breakfast", icon: Sun }
  ];
  
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    hover: { y: -5, boxShadow: "0px 8px 16px hsla(var(--foreground-rgb), 0.08)", transition: { duration: 0.2 } },
    animate: (index) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: index * 0.1, ease: "easeOut" }
    })
  };
  
  const amenityButtonVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: (index) => ({
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, delay: 0.5 + index * 0.1, ease: "easeOut" }
    }),
    hover: { scale: 1.05, backgroundColor: "hsl(var(--accent) / 0.1)", color: "hsl(var(--accent))" }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <motion.section 
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="py-16 sm:py-20 md:py-28 bg-secondary/30"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl sm:text-5xl font-bold text-foreground mb-8"
          >
            Find Your Resort Stay
          </motion.h1>
          
          <motion.div 
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-4xl mx-auto bg-background p-4 sm:p-6 rounded-xl shadow-lg border border-border/60"
          >
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-grow w-full sm:w-auto">
                <label htmlFor="where" className="sr-only">Where</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="where"
                    type="text" 
                    placeholder="Where" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-base h-14 pl-10 sm:rounded-r-none border-0 sm:border-r border-border/70 focus:ring-0 focus:border-accent"
                  />
                </div>
              </div>
              <div className="flex-grow w-full sm:w-auto">
                 <label htmlFor="checkin-checkout" className="sr-only">Check-in - Check-out</label>
                 <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <DatePicker 
                        id="checkin-checkout"
                        date={checkInDate} 
                        setDate={setCheckInDate} 
                        className="h-14 w-full text-base pl-10 sm:rounded-none border-0 sm:border-r border-border/70 focus:ring-0 focus:border-accent"
                        placeholder="Check-in — Check-out"
                        numberOfMonths={2} 
                    />
                 </div>
              </div>
               <div className="flex-grow w-full sm:w-auto sm:max-w-[150px]">
                <label htmlFor="guests" className="sr-only">Number of Guests</label>
                 <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="guests"
                      type="number" 
                      placeholder="Guests"
                      value={numberOfGuests}
                      min={1}
                      onChange={(e) => setNumberOfGuests(Math.max(1, parseInt(e.target.value)))}
                      className="text-base h-14 pl-10 sm:rounded-none border-0 focus:ring-0 focus:border-accent"
                    />
                 </div>
              </div>
              <Button 
                onClick={handleSearch} 
                size="lg" 
                className="h-14 w-full sm:w-auto sm:rounded-l-none bg-accent hover:bg-accent/90 text-accent-foreground text-base font-medium px-8 flex items-center"
              >
                <Search className="h-5 w-5 mr-2 sm:hidden lg:inline-block" />
                Search
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        id="top-resorts" 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-12 sm:py-16"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-foreground">Top Resorts</h2>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading top resorts...</p>
          ) : resorts.length === 0 ? (
            <p className="text-center text-muted-foreground">No resorts found. Check back later!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {resorts.map((resort, index) => (
                <motion.div
                  key={resort.id}
                  custom={index}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                >
                  <Card 
                    className="overflow-hidden h-full flex flex-col group border-border/50 rounded-xl cursor-pointer bg-card"
                    onClick={() => navigate(`/resort/${resort.id}`)}
                  >
                    <div className="relative h-56 w-full bg-muted/50 flex items-center justify-center">
                      <img   
                        class="object-cover w-full h-full group-hover:opacity-90 transition-opacity"
                        alt={`${resort.name} - ${resort.stayType}`} src="https://images.unsplash.com/photo-1674657059931-5ddc4d36592d" />
                    </div>
                    <CardContent className="p-5 flex-grow">
                      <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">{resort.name}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{resort.stayType}</p>
                      <p className="text-md font-medium text-foreground/80">₹{resort.pricePerNight ? resort.pricePerNight.toLocaleString('en-IN') : 'N/A'}/night</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{resort.shortDescription}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      <motion.section 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-12 sm:py-16"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div custom={0} variants={amenityButtonVariants} initial="initial" animate="animate" whileHover="hover">
              <Button variant="outline" size="lg" className="w-full h-16 text-lg border-2 border-border hover:border-accent flex items-center justify-center hover:bg-accent/5">
                <Percent className="w-6 h-6 mr-3 text-muted-foreground group-hover:text-accent transition-colors" /> Featured Deals
              </Button>
            </motion.div>
            <motion.div custom={1} variants={amenityButtonVariants} initial="initial" animate="animate" whileHover="hover">
              <Button variant="outline" size="lg" className="w-full h-16 text-lg border-2 border-border hover:border-accent flex items-center justify-center hover:bg-accent/5">
                <Search className="w-6 h-6 mr-3 text-muted-foreground group-hover:text-accent transition-colors" /> Quick Search
              </Button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {popularAmenities.map((amenity, index) => (
              <motion.div 
                key={amenity.name} 
                custom={index}
                variants={amenityButtonVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
              >
                <Card className="p-6 border-2 border-border hover:border-accent transition-all duration-200 cursor-pointer h-full bg-card hover:bg-accent/5 group">
                  <div className="flex flex-col items-center justify-center text-center h-full">
                    <amenity.icon className="w-10 h-10 mb-3 text-muted-foreground group-hover:text-accent transition-colors" />
                    <p className="text-md font-medium text-foreground group-hover:text-accent transition-colors">{amenity.name}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;