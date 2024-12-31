import { useState } from 'react';
import { motion, AnimatePresence, drag, PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const slides = [
  {
    title: "Welcome to Tekiplanet",
    description: "Your all-in-one platform for learning, business, and professional growth",
    image: "/onboarding/welcome.png"
  },
  {
    title: "Learn & Grow",
    description: "Access courses, connect with experts, and enhance your professional skills",
    image: "/onboarding/learn.png"
  },
  {
    title: "Business Solutions",
    description: "Manage your business, handle transactions, and access professional services",
    image: "/onboarding/business.png"
  },
  {
    title: "Professional Services",
    description: "IT consulting, software engineering, and cybersecurity solutions at your fingertips",
    image: "/onboarding/services.png"
  }
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const [dragStart, setDragStart] = useState(0);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const dragDistance = info.offset.x;
    const dragThreshold = 50; // minimum drag distance to trigger slide change

    if (dragDistance > dragThreshold && currentSlide > 0) {
      // Dragged right - go to previous slide
      setCurrentSlide(prev => prev - 1);
    } else if (dragDistance < -dragThreshold && currentSlide < slides.length - 1) {
      // Dragged left - go to next slide
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      localStorage.setItem('hasSeenOnboarding', 'true');
      navigate('/login');
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background" />

      <div className="relative flex flex-col min-h-screen">
        {/* Header with progress dots */}
        <div className="pt-8 px-4">
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-8 bg-primary' 
                    : 'w-1.5 bg-primary/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Slides */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 flex flex-col items-center justify-center p-8"
            >
              {/* Image container with shadow and border */}
              <div className="w-full max-w-md aspect-square mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent rounded-3xl" />
                <img
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  className="w-full h-full object-contain p-6 rounded-3xl bg-card/50 backdrop-blur-sm shadow-xl ring-1 ring-primary/10"
                />
              </div>

              {/* Content with gradient text */}
              <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {slides[currentSlide].title}
              </h1>
              <p className="text-center text-muted-foreground mb-8 max-w-md">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="p-8 space-y-4">
          <div className="flex gap-4 mb-4">
            {currentSlide > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex-1"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}
            <Button 
              onClick={handleNext} 
              className={`flex-1 ${currentSlide === 0 ? 'w-full' : ''}`}
            >
              {currentSlide === slides.length - 1 ? (
                'Get Started'
              ) : (
                <>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {currentSlide < slides.length - 1 && (
            <Button 
              variant="ghost" 
              onClick={() => {
                localStorage.setItem('hasSeenOnboarding', 'true');
                navigate('/login');
              }}
              className="w-full text-muted-foreground"
            >
              Skip
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 