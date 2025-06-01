import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface JsonEditorProps {
  value: any;
  onChange: (value: any) => void;
  height?: string;
}

export default function JsonEditor({ value, onChange, height = "300px" }: JsonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const [textValue, setTextValue] = useState("");

  // Update text value when the value prop changes
  useEffect(() => {
    const formattedValue = value ? JSON.stringify(value, null, 2) : "";
    setTextValue(formattedValue);
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    setTextValue(text);
    
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
      const formattedValue = value ? JSON.stringify(value, null, 2) : "";
      setTextValue(formattedValue);
    }
  };

  return (
    <div className="w-full">
      <textarea
        ref={textareaRef}
        className="w-full p-4 border border-slate-200 dark:border-gray-600 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500"
        style={{ height }}
        value={textValue}
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
