import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
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
  const [touchStart, setTouchStart] = useState(0);
  const navigate = useNavigate();
  const controls = useAnimation();

  const backgroundControls = useAnimation();
  const contentControls = useAnimation();

  useEffect(() => {
    // Animate background gradient on slide change
    backgroundControls.start({
      opacity: [0, 1],
      transition: { duration: 0.5 }
    });
  }, [currentSlide, backgroundControls]);

  const handleNext = async () => {
    if (currentSlide === slides.length - 1) {
      // Animate out
      await contentControls.start({ 
        opacity: 0,
        y: -20,
        transition: { duration: 0.3 }
      });
      localStorage.setItem('hasSeenOnboarding', 'true');
      navigate('/login');
    } else {
      await contentControls.start({ opacity: 0, x: -20 });
      setCurrentSlide(prev => prev + 1);
      await contentControls.start({ opacity: 1, x: 0 });
    }
  };

  const handlePrevious = async () => {
    if (currentSlide > 0) {
      await contentControls.start({ opacity: 0, x: 20 });
      setCurrentSlide(prev => prev - 1);
      await contentControls.start({ opacity: 1, x: 0 });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;

    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0 && currentSlide < slides.length - 1) {
        handleNext();
      } else if (diff < 0 && currentSlide > 0) {
        handlePrevious();
      }
      setTouchStart(0);
    }
  };

  return (
    <div 
      className="min-h-screen bg-background overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* Subtle gradient background */}
      <motion.div 
        animate={backgroundControls}
        className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background"
        initial={{ opacity: 0 }}
      />

      <div className="relative flex flex-col min-h-screen">
        {/* Progress dots */}
        <div className="pt-8 px-4">
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <motion.div
                key={index}
                className="h-1.5 rounded-full bg-primary/30"
                animate={{
                  width: index === currentSlide ? 32 : 6,
                  opacity: index === currentSlide ? 1 : 0.3
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <motion.div 
          className="flex-1 relative overflow-hidden px-4 pt-12"
          animate={contentControls}
          initial={{ opacity: 1, x: 0 }}
        >
          <div className="max-w-md mx-auto h-full flex flex-col items-center justify-center -mt-12">
            {/* Image with floating animation */}
            <motion.div
              className="w-full max-w-[280px] aspect-square mb-8 relative"
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3,
                ease: "easeInOut"
              }}
              style={{ margin: '20px 0' }}
            >
              {/* Background circles for decoration */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-0 w-full h-full rounded-full bg-primary/5 animate-pulse" />
                <div className="absolute top-4 left-4 w-full h-full rounded-full bg-primary/5" />
              </div>

              {/* Main image container */}
              <div className="relative w-full h-full rounded-full p-2 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent backdrop-blur-sm">
                <div className="w-full h-full rounded-full overflow-hidden ring-1 ring-primary/20 bg-card">
                  <img
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    style={{
                      objectFit: 'cover',
                      transform: 'scale(1.1)', // Start slightly zoomed in
                    }}
                  />
                </div>
                
                {/* Decorative ring */}
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-b from-primary/20 to-transparent -z-10" />
              </div>

              {/* Floating dots decoration */}
              <motion.div
                className="absolute w-3 h-3 rounded-full bg-primary/30"
                animate={{
                  y: [0, -20, 0],
                  x: [0, 10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut",
                }}
                style={{ top: '20%', right: '10%' }}
              />
              <motion.div
                className="absolute w-2 h-2 rounded-full bg-primary/20"
                animate={{
                  y: [0, 20, 0],
                  x: [0, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: "easeInOut",
                }}
                style={{ bottom: '20%', left: '10%' }}
              />
            </motion.div>

            {/* Text content with animations */}
            <motion.h1
              className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {slides[currentSlide].title}
            </motion.h1>
            <motion.p
              className="text-center text-muted-foreground mb-8 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {slides[currentSlide].description}
            </motion.p>
          </div>
        </motion.div>

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