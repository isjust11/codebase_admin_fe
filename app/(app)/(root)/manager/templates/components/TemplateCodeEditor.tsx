'use client';

import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type Props = {
  language: 'html' | 'css';
  value: string;
  onChange: (value: string) => void;
  height?: string;
};

export default function TemplateCodeEditor({ language, value, onChange, height = '240px' }: Props) {
  return (
    <div className="overflow-hidden rounded-md border">
      <MonacoEditor
        height={height}
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(next) => onChange(next || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          wordWrap: 'on',
          automaticLayout: true,
        }}
      />
    </div>
  );
}
