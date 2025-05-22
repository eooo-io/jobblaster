import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface JsonEditorProps {
  value: any;
  onChange: (value: any) => void;
  height?: string;
}

export default function JsonEditor({ value, onChange, height = "300px" }: JsonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const formattedValue = value ? JSON.stringify(value, null, 2) : "";

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    
    try {
      const parsed = JSON.parse(text);
      onChange(parsed);
    } catch (error) {
      // Don't update the value if JSON is invalid
      // The user might be in the middle of editing
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    
    try {
      const parsed = JSON.parse(text);
      onChange(parsed);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax and try again.",
        variant: "destructive",
      });
      // Reset to last valid value
      if (textareaRef.current) {
        textareaRef.current.value = formattedValue;
      }
    }
  };

  return (
    <div className="w-full">
      <textarea
        ref={textareaRef}
        className="w-full p-4 border border-slate-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        style={{ height }}
        defaultValue={formattedValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={`{
  "basics": {
    "name": "John Doe",
    "label": "Software Engineer",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "location": {
      "city": "San Francisco",
      "region": "CA"
    }
  },
  "work": [
    {
      "company": "Tech Corp",
      "position": "Senior Developer",
      "startDate": "2022-01-01",
      "highlights": [
        "Led team of 5 developers",
        "Increased performance by 40%"
      ]
    }
  ],
  "skills": [
    {
      "name": "Web Development",
      "keywords": ["JavaScript", "React", "Node.js"]
    }
  ]
}`}
      />
    </div>
  );
}
