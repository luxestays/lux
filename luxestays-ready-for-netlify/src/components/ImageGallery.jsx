import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ImageGallery = ({ isOpen, setIsOpen, images, startIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = React.useState(startIndex);
  const [direction, setDirection] = React.useState(0);

  React.useEffect(() => {
    if (isOpen) {
      setCurrentIndex(startIndex);
    }
  }, [startIndex, isOpen]);

  if (!images || images.length === 0) {
    return null;
  }

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const imageVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      zIndex: 0,
      x: dir < 0 ? 300 : -300,
      opacity: 0,
    }),
  };
  
  const paginate = (newDirection) => {
    setDirection(newDirection);
    if (newDirection > 0) nextImage();
    else prevImage();
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl w-[95vw] h-[90vh] p-0 flex flex-col bg-background/90 backdrop-blur-md border-border/50">
        <DialogHeader className="p-4 flex flex-row justify-between items-center border-b border-border/50">
          <DialogTitle className="text-lg text-foreground">Image Gallery</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-accent">
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="flex-grow relative flex items-center justify-center overflow-hidden p-2 md:p-4">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute w-full h-full flex items-center justify-center"
            >
              <img   
                src={images[currentIndex]?.original} 
                alt={images[currentIndex]?.description || `Gallery image ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-md shadow-xl"
                src="https://images.unsplash.com/photo-1660061540551-0955e8ec5b8b" />
            </motion.div>
          </AnimatePresence>

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => paginate(-1)}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-2"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => paginate(1)}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-2"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
            </>
          )}
        </div>
        
        {images[currentIndex]?.description && (
          <div className="text-center p-2 md:p-3 border-t border-border/50">
            <p className="text-xs md:text-sm text-muted-foreground">{images[currentIndex].description}</p>
          </div>
        )}

        {images.length > 1 && (
          <div className="flex justify-center space-x-1.5 p-2 md:p-3 bg-background/50 border-t border-border/50 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-12 h-12 md:w-16 md:h-16 rounded-md overflow-hidden border-2 transition-all duration-200
                            ${currentIndex === index ? 'border-accent scale-105 shadow-lg' : 'border-transparent hover:border-accent/50 opacity-70 hover:opacity-100'}`}
              >
                <img   
                  src={image.thumbnail || image.original} 
                  alt={`Thumbnail ${index + 1}`} 
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1583268921016-514d0a038478" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageGallery;