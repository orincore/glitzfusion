export const metadata = {
  title: 'Code Validator | GLITZFUSION Security Protocol',
  description: 'Secure event access verification system for GLITZFUSION events',
};

export default function ValidatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cyberpunk neon green themed layout for validator
  return (
    <div className="min-h-screen bg-black validator-layout">
      {children}
    </div>
  );
}
