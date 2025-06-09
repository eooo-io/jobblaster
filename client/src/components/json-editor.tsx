import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import JsonView from "react18-json-view";
import "react18-json-view/src/dark.css";
import "react18-json-view/src/style.css";

interface JsonEditorProps {
  value: any;
  onChange: (value: any) => void;
  height?: string;
  onValidate?: (isValid: boolean) => void;
}

export default function JsonEditor({
  value,
  onChange,
  height = "300px",
  onValidate,
}: JsonEditorProps) {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [lastValidValue, setLastValidValue] = useState<any>(null);
  const [isValid, setIsValid] = useState<boolean>(true);

  // Update when value prop changes and it's different from our last valid value
  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(lastValidValue)) {
      setLastValidValue(value);
      validateJson(value);
    }
  }, [value]);

  const validateJson = (json: any) => {
    try {
      // Basic JSON validation
      const parsedJson = typeof json === "string" ? JSON.parse(json) : json;

      // Check for basic JSON Resume schema structure
      const hasBasics = parsedJson.basics && typeof parsedJson.basics === "object";
      const hasWork = Array.isArray(parsedJson.work);
      const hasSkills = Array.isArray(parsedJson.skills);

      const isValidSchema = hasBasics || hasWork || hasSkills;
      setIsValid(isValidSchema);
      onValidate?.(isValidSchema);

      if (!isValidSchema) {
        toast({
          title: "Invalid Resume Format",
          description:
            "Please ensure your JSON follows the JSON Resume Schema format with at least basics, work, or skills sections.",
          variant: "destructive",
        });
      }

      return isValidSchema;
    } catch (error) {
      setIsValid(false);
      onValidate?.(false);
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax and try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleEdit = (params: { newValue: any; oldValue: any }) => {
    try {
      const updated = params.newValue;
      if (validateJson(updated)) {
        setLastValidValue(updated);
        onChange(updated);
      }
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax and try again.",
        variant: "destructive",
      });
    }
  };

  const handleAdd = (params: { indexOrName: string | number }) => {
    try {
      const updated = { ...value };
      if (validateJson(updated)) {
        setLastValidValue(updated);
        onChange(updated);
      }
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax and try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (params: { value: any }) => {
    try {
      const updated = { ...value };
      delete updated[params.value];
      if (validateJson(updated)) {
        setLastValidValue(updated);
        onChange(updated);
      }
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${isValid ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-xs text-slate-600 dark:text-gray-400">
          {isValid ? "Valid JSON Resume format" : "Invalid JSON Resume format"}
        </span>
      </div>
      <div
        className="w-full overflow-auto rounded-lg border border-slate-200 dark:border-gray-600"
        style={{ height }}
      >
        <JsonView
          src={value || {}}
          dark={theme === "dark"}
          editable={{
            edit: true,
            add: true,
            delete: true,
          }}
          onEdit={handleEdit}
          onAdd={handleAdd}
          onDelete={handleDelete}
          style={{
            padding: "1rem",
            borderRadius: "0.5rem",
            backgroundColor: theme === "dark" ? "#1a1a1a" : "transparent",
          }}
          displayDataTypes={false}
          enableClipboard={true}
          displayObjectSize={true}
          collapsed={false}
          theme={theme === "dark" ? "vscode" : "default"}
        />
      </div>
    </div>
  );
}
