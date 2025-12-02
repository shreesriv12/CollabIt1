import { Color, Point } from "./canvas";

export interface ERDField {
  id: string;
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isRequired: boolean;
  isUnique: boolean;
  defaultValue?: string;
  description?: string;
}

export interface ERDEntity {
  id: string;
  tableName: string;
  fields: ERDField[];
  position: Point;
  width: number;
  height: number;
  color: Color;
}

export interface ERDRelationship {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  fromField: string;
  toField: string;
  relationshipName?: string;
}

export interface ERDDiagram {
  id: string;
  entities: ERDEntity[];
  relationships: ERDRelationship[];
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SchemaType = 'prisma' | 'mongodb' | 'sql' | 'typescript' | 'sequelize';

export interface SchemaGenerationOptions {
  type: SchemaType;
  includeComments: boolean;
  includeValidation: boolean;
  databaseProvider?: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb';
}

// ERD Field Types
export const ERD_FIELD_TYPES = [
  'String',
  'Int',
  'Float',
  'Boolean',
  'DateTime',
  'UUID',
  'JSON',
  'Text',
  'Email',
  'URL',
  'Decimal',
  'BigInt',
] as const;

export type ERDFieldType = typeof ERD_FIELD_TYPES[number];