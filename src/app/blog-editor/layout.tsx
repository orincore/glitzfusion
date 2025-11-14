'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';

export default function BlogEditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </AuthProvider>
  );
}
