// Type definitions for react-avatar 0.5.9
// Definitions by: Andrew Makarov <https://github.com/r3nya>
// TypeScript Version: 2.3

import * as React from 'react';

export interface Props {
  /**
   * The Image object to display
   */
  img?: HTMLImageElement;

  /**
   * The url ot base64 string to load (use urls from your domain to prevent security errors)
   */
  src?: string;

  /**
   * The width of the editor
   */
  width: number;

  /**
   * The height of the editor (image will fit to this height)
   */
  height: number;
  
  /**
   * The desired width of the image, can not be used together with imageHeight
   */
  imageWidth?: number;
  
  /**
   * The desired height of the image, can not be used together with imageWidth
   */
  imageHeight?: number;

  /**
   * The crop area radius in px (
   * Default: 100
   */
  cropRadius?: number;

  /**
   * The crop border color
   * Default: white
   */
  cropColor?: string;

  /**
   * The crop border width
   * Default: 4
   */
  lineWidth?: number;

  /**
   * The min crop area radius in px
   * Default: 30
   */
  minCropRadius?: number;

  /**
   * The color of the image background
   * Default: white
   */
  backgroundColor?: string;

  /**
   * The close button color
   * Default: white
   */
  closeIconColor?: string;

  /**
   * The shading color
   * Default: grey
   */
  shadingColor?: string;

  /**
   * The shading area opacity
   * Default: 0.6
   */
  shadingOpacity?: number;

  /**
   * The mime types used to filter loaded files
   * Default: image/jpeg, image/png
   */
  mimeTypes?: string;

  /**
   * When set to true the returned data for onCrop is a square instead of a circle.
   * Default: false
   */
  exportAsSquare?: boolean;

  /**
   * The number of pixels width/height should have on the exported image.
   * Default: original size of the image
   */
  exportSize?: number;

  /**
   * The mime type used to generate the data param for onCrop
   * Default: image/png
   */
  exportMimeType?: string;

  /**
   * The quality used to generate the data param for onCrop, only relevant for image/jpeg as exportMimeType
   * Default: 1.0
   */
  exportQuality?: number;

  /**
   * Label text
   * Default: Choose a file
   */
  label?: string;

  /**
   * The style object for preview label
   */
  labelStyle?: React.CSSProperties;

  /**
   * The style for object border preview
   */
  borderStyle?: React.CSSProperties;

  /**
   * Invoked when image based on src prop finish loading
   */
  onImageLoad?: (data: HTMLImageElement) => void;

  /**
   * Invoked when user drag&drop event stop and return croped image in base64 sting
   */
  onCrop?: (data: string) => void;
  
  /**
   * Invoked when user upload file with internal file loader
   */
  onBeforeFileLoad?: (event: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * Invoked when user upload file with internal file loader
   */
  onFileLoad?: (data: React.ChangeEvent<HTMLInputElement> | File) => void;

  /**
   * Invoked when user clock on close editor button
   */
  onClose?: () => void;
}

declare class Avatar extends React.Component<Props> {
  constructor(props: Props);
}

export default Avatar;
