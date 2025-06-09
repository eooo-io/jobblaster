import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import JsonView from "react18-json-view";
import "react18-json-view/src/dark.css";
import "react18-json-view/src/style.css";

interface JsonEditorProps<T = unknown> {
  value: T;
  onChange: (value: T) => void;
  height?: string;
  onValidate?: (isValid: boolean) => void;
}

export function JsonEditor<T = unknown>({
  value,
  onChange,
  height = "400px",
  onValidate,
}: JsonEditorProps<T>) {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    onValidate?.(isValid);
  }, [isValid, onValidate]);

  const handleChange = (newValue: T) => {
    try {
      // Validate that the value can be stringified and parsed
      JSON.parse(JSON.stringify(newValue));
      setIsValid(true);
      onChange(newValue);
    } catch (error) {
      setIsValid(false);
      toast({
        title: "Invalid JSON",
        description: error instanceof Error ? error.message : "Failed to parse JSON",
        variant: "destructive",
      });
    }
  };

  return (
    <div style={{ height, overflow: "auto" }}>
      <JsonView
        src={value}
        onAdd={handleChange}
        onEdit={handleChange}
        onDelete={handleChange}
        theme={theme === "dark" ? "a11y-dark" : "a11y-light"}
        displayObjectSize={false}
        displayDataTypes={false}
        enableClipboard={false}
        quotesOnKeys={false}
      />
    </div>
  );
}
