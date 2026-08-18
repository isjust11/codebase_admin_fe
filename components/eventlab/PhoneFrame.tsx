'use client';

type PhoneFrameProps = {
  html?: string;
  title?: string;
  className?: string;
};

export default function PhoneFrame({ html, title = 'preview', className = '' }: PhoneFrameProps) {
  return (
    <div className={`flex justify-center ${className}`}>
      <div
        className="relative bg-neutral-900 shadow-2xl"
        style={{
          width: 320,
          height: 690,
          borderRadius: 40,
          padding: 10,
        }}
      >
        <div className="absolute top-3 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-950" />
        {html ? (
          <iframe
            title={title}
            className="h-full w-full border-0 bg-white"
            style={{ borderRadius: 30 }}
            srcDoc={html}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-stone-100 text-sm text-stone-400"
            style={{ borderRadius: 30 }}
          >
            —
          </div>
        )}
      </div>
    </div>
  );
}
