export default function Logo3D() {
  return (
    <div 
      className="w-16 h-16 rounded-lg flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f1f3a 100%)',
        boxShadow: `
          inset 0 -2px 8px rgba(0, 0, 0, 0.3),
          inset 0 2px 8px rgba(255, 255, 255, 0.1),
          0 4px 12px rgba(0, 0, 0, 0.4),
          0 8px 24px rgba(79, 70, 229, 0.3)
        `,
      }}
    >
      <div
        className="text-4xl font-black relative"
        style={{
          color: '#1e3a5f',
          textShadow: `
            1px 1px 0px #0f1f3a,
            2px 2px 0px #0a1420,
            3px 3px 0px rgba(10, 20, 32, 0.8),
            4px 4px 0px rgba(10, 20, 32, 0.6),
            5px 5px 8px rgba(10, 20, 32, 0.4),
            0 0 20px rgba(139, 92, 246, 0.4),
            0 0 30px rgba(99, 102, 241, 0.3),
            inset 0 -1px 2px rgba(255, 255, 255, 0.3)
          `,
          transform: 'rotateX(10deg) rotateY(-5deg)',
          transformStyle: 'preserve-3d',
          background: 'linear-gradient(180deg, #6366f1 0%, #4f46e5 50%, #1e3a5f 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        C
      </div>
      <div 
        className="absolute inset-0 rounded-lg"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
