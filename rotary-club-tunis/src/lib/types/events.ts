// Type definitions for Events Collection

import type { CollectionConfig, FieldHookArgs, AccessArgs } from 'payload';

// Base interfaces
export interface User {
  id: string;
  email: string;
  role?: 'admin' | 'editor' | 'volunteer';
}

export interface Registrations {
  id: string;
  user: string;
  status: string;
  registrationDate: string;
  guests: number;
}

export interface EventData {
  id: string;
  title?: string | { [key: string]: string };
  slug?: string;
  excerpt?: string;
  eventDate?: string;
  endDate?: string;
  timezone?: string;
  location?: string | { [key: string]: string };
  venue?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  description?: unknown; // Rich text content
  eventType?: string;
  areasOfFocus?: string[];
  capacity?: number;
  registrationEnabled?: boolean;
  registrationDeadline?: string;
  registrationFee?: number;
  featuredImage?: string;
  gallery?: { image: string; caption: string; altText: string }[];
  status?: string;
  featured?: boolean;
  organizer?: string;
  seo?: {
    metaTitle?: string | { [key: string]: string };
    metaDescription?: string | { [key: string]: string };
    keywords?: string | { [key: string]: string };
  };
  registrations?: Registrations[];
  impactMetrics?: {
    attendees?: number;
    mealsServed?: number;
    treesPlanted?: number;
    volunteerHours?: number;
    fundsRaised?: number;
  };
  audit?: {
    createdBy?: string;
    lastModifiedBy?: string;
    version?: number;
  };
}

// Hook arguments with proper typing
export interface EventFieldHookArgs extends FieldHookArgs<EventData> {
  data: EventData;
}

// Validation function types
export type ValidationFunction = (value: unknown, data?: EventData) => true | string;

// Field configuration types
export interface BaseField {
  name: string;
  admin?: {
    description?: string;
    position?: 'sidebar';
    readOnly?: boolean;
    rows?: number;
  };
}

export interface TextField extends BaseField {
  type: 'text';
  required?: boolean;
  unique?: boolean;
  localized?: boolean;
  validate?: ValidationFunction;
  hooks?: {
    beforeValidate?: Array<(args: EventFieldHookArgs) => unknown>;
  };
}

export interface TextareaField extends BaseField {
  type: 'textarea';
  localized?: boolean;
  required?: boolean;
  validate?: ValidationFunction;
}

export interface DateField extends BaseField {
  type: 'date';
  required?: boolean;
  defaultValue?: string | (() => string);
  admin?: BaseField['admin'] & {
    date?: {
      pickerAppearance: 'dayAndTime';
      displayFormat: string;
    };
  };
}

export interface SelectField extends BaseField {
  type: 'select';
  required?: boolean;
  defaultValue?: string;
  options: Array<{ label: string; value: string }>;
  hasMany?: boolean;
}

export interface NumberField extends BaseField {
  type: 'number';
  defaultValue?: number;
}

export interface CheckboxField extends BaseField {
  type: 'checkbox';
  defaultValue?: boolean;
}

export interface UploadField extends BaseField {
  type: 'upload';
  relationTo: string;
}

export interface RelationshipField extends BaseField {
  type: 'relationship';
  relationTo: string;
  required?: boolean;
}

export interface RichTextField extends BaseField {
  type: 'richText';
  required?: boolean;
  localized?: boolean;
  editor: unknown;
}

export interface GroupField extends BaseField {
  type: 'group';
  fields: Field[];
}

export interface ArrayField extends BaseField {
  type: 'array';
  fields: Field[];
}

export type Field =
  | TextField
  | TextareaField
  | DateField
  | SelectField
  | NumberField
  | CheckboxField
  | UploadField
  | RelationshipField
  | RichTextField
  | GroupField
  | ArrayField;

// Collection configuration type
export interface EventsCollectionConfig extends Omit<CollectionConfig, 'fields'> {
  fields: Field[];
}