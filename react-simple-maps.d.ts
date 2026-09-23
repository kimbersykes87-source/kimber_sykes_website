declare module "react-simple-maps" {
  import type { CSSProperties, ReactNode } from "react";

  export interface GeographyStyle {
    default?: CSSProperties;
    hover?: CSSProperties;
    pressed?: CSSProperties;
  }

  export type GeographyProps = {
    geography: unknown;
    style?: GeographyStyle;
    onClick?: (e: React.MouseEvent<SVGPathElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<SVGPathElement>) => void;
    tabIndex?: number;
    "aria-label"?: string;
  };

  export function Geography(props: GeographyProps): JSX.Element;

  export type GeographiesRenderProps = {
    geographies: Array<{ rsmKey: string; properties: { name?: string }; [k: string]: unknown }>;
  };

  export type GeographiesProps = {
    geography: string | object;
    children: (props: GeographiesRenderProps) => ReactNode;
  };

  export function Geographies(props: GeographiesProps): JSX.Element;

  export type ComposableMapProps = {
    children?: ReactNode;
    projection?: string;
    projectionConfig?: { scale?: number; center?: [number, number] };
    className?: string;
  };

  export function ComposableMap(props: ComposableMapProps): JSX.Element;
}
