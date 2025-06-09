declare module 'react-json-view' {
  import { Component } from 'react';

  interface CustomTheme {
    base00: string; // Base background
    base01: string; // Lighter background
    base02: string; // Selection background
    base03: string; // Comments, invisibles
    base04: string; // Dark foreground
    base05: string; // Default foreground
    base06: string; // Light foreground
    base07: string; // Light background
    base08: string; // Variables
    base09: string; // Integers, Boolean
    base0A: string; // Classes, CSS
    base0B: string; // Strings
    base0C: string; // Support, Regular Expressions
    base0D: string; // Functions, Methods
    base0E: string; // Keywords, Storage
    base0F: string; // Deprecated
  }

  interface ReactJsonViewProps {
    src: object;
    name?: string | false;
    theme?: string | CustomTheme;
    style?: React.CSSProperties;
    iconStyle?: "circle" | "triangle" | "square";
    indentWidth?: number;
    collapsed?: boolean | number;
    collapseStringsAfterLength?: number;
    shouldCollapse?: (field: { name: string; src: any; type: string; namespace: string[] }) => boolean;
    groupArraysAfterLength?: number;
    enableClipboard?: boolean | ((copy: { src: any; namespace: string[] }) => void);
    displayObjectSize?: boolean;
    displayDataTypes?: boolean;
    onEdit?: (edit: { updated_src: any; existing_value: any; new_value: any; name: string; namespace: string[] }) => boolean;
    onAdd?: (add: { updated_src: any; new_value: any; name: string; namespace: string[] }) => boolean;
    onDelete?: (del: { updated_src: any; name: string; namespace: string[] }) => boolean;
    onSelect?: (select: { name: string; value: any; namespace: string[] }) => void;
    validationMessage?: string;
    sortKeys?: boolean;
    quotesOnKeys?: boolean;
    displayArrayKey?: boolean;
  }

  export default class ReactJson extends Component<ReactJsonViewProps> {}
}
