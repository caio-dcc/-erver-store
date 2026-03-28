'use client';

import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


interface AnimatedListProps {
  children: ReactNode;
  delay?: number;
  as?: any;
}

export const AnimatedList = ({ children, delay = 0.1, as: Component = 'div' }: AnimatedListProps) => {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <Component>
      <AnimatePresence>
        {childrenArray.map((child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ 
              delay: index * delay,
              duration: 0.4,
              ease: [0.23, 1, 0.32, 1] 
            }}
            style={{ display: Component === 'tbody' ? 'table-row-group' : 'block' }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </Component>
  );
};


