import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { App } from '@capacitor/app';
import { useState } from 'react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ children, onRefresh }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const threshold = 100;

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (eventData.deltaY > 0) {
        setPullDistance(Math.min(eventData.deltaY, threshold));
        if (eventData.deltaY > threshold && !isPulling) {
          setIsPulling(true);
        }
      }
    },
    onSwipedDown: async () => {
      if (pullDistance > threshold) {
        try {
          await onRefresh();
        } finally {
          setIsPulling(false);
          setPullDistance(0);
        }
      }
    },
    onTouchEndOrOnMouseUp: () => {
      setPullDistance(0);
      setIsPulling(false);
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  return (
    <div {...handlers} className="relative min-h-full">
      <AnimatePresence>
        {pullDistance > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 flex justify-center py-4 pointer-events-none"
          >
            <motion.div
              animate={{ 
                rotate: isPulling ? 180 : 0,
                scale: pullDistance / threshold
              }}
            >
              <RefreshCw className={`h-6 w-6 ${isPulling ? 'text-primary' : 'text-muted-foreground'}`} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}; 