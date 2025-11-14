'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn, fadeInUp } from '@/lib/utils';

interface BlogStatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'gray' | 'purple' | 'indigo';
}

const colorClasses = {
  blue: 'text-blue-400 bg-blue-500/20',
  green: 'text-green-400 bg-green-500/20',
  yellow: 'text-yellow-400 bg-yellow-500/20',
  gray: 'text-gray-400 bg-gray-500/20',
  purple: 'text-purple-400 bg-purple-500/20',
  indigo: 'text-indigo-400 bg-indigo-500/20'
};

export default function BlogStatsCard({ title, value, icon: Icon, color }: BlogStatsCardProps) {
  return (
    <motion.div variants={fadeInUp}>
      <GlassPanel className="p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            colorClasses[color]
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
            <p className="text-sm text-gray-400">{title}</p>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
