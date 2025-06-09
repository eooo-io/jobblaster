declare module 'react18-json-view' {
  import { FC } from 'react';

  interface JsonViewProps {
    src: any;
    dark?: boolean;
    editable?: boolean | {
      add?: boolean;
      edit?: boolean;
      delete?: boolean;
    };
    onEdit?: (params: { newValue: any; oldValue: any; depth: number; src: any; indexOrName: string | number }) => void;
    onAdd?: (params: { indexOrName: string | number; depth: number; src: any }) => void;
    onDelete?: (params: { value: any; indexOrName: string | number; depth: number; src: any }) => void;
    style?: React.CSSProperties;
    displayDataTypes?: boolean;
    enableClipboard?: boolean;
    displayObjectSize?: boolean;
    collapsed?: boolean | number;
    theme?: 'default' | 'vscode' | 'github' | 'atom' | 'winter-is-coming';
  }

  const JsonView: FC<JsonViewProps>;
  export default JsonView;
}

declare module 'react18-json-view/src/style.css';
declare module 'react18-json-view/src/dark.css';
