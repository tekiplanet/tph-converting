import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCcw, WifiOff } from "lucide-react";

interface ConnectionErrorProps {
  onRetry?: () => void;
  message?: string;
  fullPage?: boolean;
}

export default function ConnectionError({ 
  onRetry, 
  message = "Unable to connect to server", 
  fullPage = false 
}: ConnectionErrorProps) {
  const containerClass = fullPage 
    ? "min-h-screen flex items-center justify-center p-4" 
    : "p-4";

  return (
    <div className={containerClass}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md mx-auto">
          <div className="p-6 text-center space-y-6">
            {/* Icon Animation */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [1, 0.8, 1] 
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex justify-center"
            >
              <div className="relative">
                <WifiOff className="h-16 w-16 text-muted-foreground" />
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -top-1 -right-1"
                >
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </motion.div>
              </div>
            </motion.div>

            {/* Error Message */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Connection Error</h3>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>

            {/* Retry Button */}
            {onRetry && (
              <Button 
                onClick={onRetry}
                variant="outline"
                className="gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Try Again
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
} 