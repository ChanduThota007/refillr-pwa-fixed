import { Settings, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';

interface HeaderProps {
  title: string;
  showNotifications?: boolean;
}

export const Header = ({ title, showNotifications = true }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-soft"
    >
      <div className="flex h-16 items-center justify-between px-4 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🛒</div>
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {showNotifications && location.pathname !== '/settings' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/settings')}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          {location.pathname !== '/' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="h-8 w-8 p-0"
            >
              <Home className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
};