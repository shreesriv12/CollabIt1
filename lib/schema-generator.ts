import { ERDEntity, ERDRelationship, SchemaType, SchemaGenerationOptions } from "@/types/erd";

export class SchemaGenerator {
  generateSchema(
    entities: ERDEntity[],
    relationships: ERDRelationship[],
    options: SchemaGenerationOptions
  ): string {
    switch (options.type) {
      case 'prisma':
        return this.generatePrismaSchema(entities, relationships, options);
      case 'mongodb':
        return this.generateMongoDBSchema(entities, relationships, options);
      case 'sql':
        return this.generateSQLSchema(entities, relationships, options);
      case 'typescript':
        return this.generateTypeScriptSchema(entities, relationships, options);
      case 'sequelize':
        return this.generateSequelizeSchema(entities, relationships, options);
      default:
        throw new Error(`Unsupported schema type: ${options.type}`);
    }
  }

  private generatePrismaSchema(
    entities: ERDEntity[],
    relationships: ERDRelationship[],
    options: SchemaGenerationOptions
  ): string {
    const provider = options.databaseProvider || 'postgresql';
    
    let schema = `// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n`;
    
    schema += `generator client {\n  provider = "prisma-client-js"\n}\n\n`;
    schema += `datasource db {\n  provider = "${provider}"\n  url      = env("DATABASE_URL")\n}\n\n`;

    // Generate models
    entities.forEach(entity => {
      schema += `model ${this.toPascalCase(entity.tableName)} {\n`;
      
      entity.fields.forEach(field => {
        let fieldDef = `  ${field.name}`;
        
        // Map types
        const prismaType = this.mapToPrismaType(field.type);
        fieldDef += ` ${prismaType}`;
        
        // Add modifiers
        if (field.isPrimaryKey) {
          fieldDef += ` @id`;
          if (field.type === 'UUID') {
            fieldDef += ` @default(uuid())`;
          } else if (field.type === 'Int') {
            fieldDef += ` @default(autoincrement())`;
          }
        }
        
        if (field.isUnique && !field.isPrimaryKey) {
          fieldDef += ` @unique`;
        }
        
        if (field.defaultValue && !field.isPrimaryKey) {
          fieldDef += ` @default(${field.defaultValue})`;
        }
        
        if (!field.isRequired && !field.isPrimaryKey) {
          fieldDef += `?`;
        }
        
        schema += fieldDef + '\n';
      });

      // Add relationships
      const entityRelationships = relationships.filter(
        rel => rel.fromEntityId === entity.id || rel.toEntityId === entity.id
      );
      
      entityRelationships.forEach(rel => {
        const isFromEntity = rel.fromEntityId === entity.id;
        const relatedEntity = entities.find(e => 
          e.id === (isFromEntity ? rel.toEntityId : rel.fromEntityId)
        );
        
        if (relatedEntity) {
          const relatedTableName = this.toPascalCase(relatedEntity.tableName);
          
          if (rel.type === 'one-to-many') {
            if (isFromEntity) {
              schema += `  ${this.toCamelCase(relatedEntity.tableName)}s ${relatedTableName}[]\n`;
            } else {
              schema += `  ${this.toCamelCase(entity.tableName)} ${this.toPascalCase(entity.tableName)} @relation(fields: [${rel.toField}], references: [${rel.fromField}])\n`;
              schema += `  ${rel.toField} String\n`;
            }
          }
        }
      });

      schema += `\n  @@map("${entity.tableName}")\n`;
      schema += `}\n\n`;
    });

    return schema;
  }

  private generateMongoDBSchema(
    entities: ERDEntity[],
    relationships: ERDRelationship[],
    options: SchemaGenerationOptions
  ): string {
    let schema = `// MongoDB Schema with Mongoose\n\n`;
    schema += `import { Schema, model, Document } from 'mongoose';\n\n`;

    entities.forEach(entity => {
      const interfaceName = `I${this.toPascalCase(entity.tableName)}`;
      
      // Generate interface
      schema += `interface ${interfaceName} extends Document {\n`;
      entity.fields.forEach(field => {
        const tsType = this.mapToTypeScriptType(field.type);
        const optional = !field.isRequired ? '?' : '';
        schema += `  ${field.name}${optional}: ${tsType};\n`;
      });
      schema += `}\n\n`;

      // Generate schema
      const schemaName = `${this.toCamelCase(entity.tableName)}Schema`;
      schema += `const ${schemaName} = new Schema<${interfaceName}>({\n`;
      
      entity.fields.forEach(field => {
        schema += `  ${field.name}: {\n`;
        schema += `    type: ${this.mapToMongooseType(field.type)},\n`;
        
        if (field.isRequired) {
          schema += `    required: true,\n`;
        }
        
        if (field.isUnique) {
          schema += `    unique: true,\n`;
        }
        
        if (field.defaultValue) {
          schema += `    default: ${field.defaultValue},\n`;
        }
        
        schema += `  },\n`;
      });
      
      schema += `}, {\n  timestamps: true\n});\n\n`;
      
      // Export model
      schema += `export const ${this.toPascalCase(entity.tableName)} = model<${interfaceName}>('${this.toPascalCase(entity.tableName)}', ${schemaName});\n\n`;
    });

    return schema;
  }

  private generateSQLSchema(
    entities: ERDEntity[],
    relationships: ERDRelationship[],
    options: SchemaGenerationOptions
  ): string {
    let schema = `-- SQL Schema\n-- Generated from ERD diagram\n\n`;

    entities.forEach(entity => {
      schema += `CREATE TABLE ${entity.tableName} (\n`;
      
      const fieldDefs: string[] = [];
      
      entity.fields.forEach(field => {
        let fieldDef = `  ${field.name} ${this.mapToSQLType(field.type)}`;
        
        if (field.isRequired) {
          fieldDef += ` NOT NULL`;
        }
        
        if (field.isPrimaryKey) {
          fieldDef += ` PRIMARY KEY`;
          if (field.type === 'Int') {
            fieldDef += ` AUTO_INCREMENT`;
          }
        }
        
        if (field.isUnique && !field.isPrimaryKey) {
          fieldDef += ` UNIQUE`;
        }
        
        if (field.defaultValue) {
          fieldDef += ` DEFAULT ${field.defaultValue}`;
        }
        
        fieldDefs.push(fieldDef);
      });
      
      schema += fieldDefs.join(',\n');
      schema += `\n);\n\n`;
    });

    // Add foreign key constraints
    relationships.forEach(rel => {
      const fromEntity = entities.find(e => e.id === rel.fromEntityId);
      const toEntity = entities.find(e => e.id === rel.toEntityId);
      
      if (fromEntity && toEntity) {
        schema += `ALTER TABLE ${toEntity.tableName}\n`;
        schema += `ADD CONSTRAINT fk_${toEntity.tableName}_${fromEntity.tableName}\n`;
        schema += `FOREIGN KEY (${rel.toField}) REFERENCES ${fromEntity.tableName}(${rel.fromField});\n\n`;
      }
    });

    return schema;
  }

  private generateTypeScriptSchema(
    entities: ERDEntity[],
    relationships: ERDRelationship[],
    options: SchemaGenerationOptions
  ): string {
    let schema = `// TypeScript Interfaces\n// Generated from ERD diagram\n\n`;

    entities.forEach(entity => {
      schema += `export interface ${this.toPascalCase(entity.tableName)} {\n`;
      
      entity.fields.forEach(field => {
        const tsType = this.mapToTypeScriptType(field.type);
        const optional = !field.isRequired ? '?' : '';
        const comment = field.isPrimaryKey ? ' // Primary Key' : 
                       field.isForeignKey ? ' // Foreign Key' : '';
        
        schema += `  ${field.name}${optional}: ${tsType};${comment}\n`;
      });
      
      schema += `}\n\n`;
    });

    return schema;
  }

  private generateSequelizeSchema(
    entities: ERDEntity[],
    relationships: ERDRelationship[],
    options: SchemaGenerationOptions
  ): string {
    let schema = `// Sequelize Models\n// Generated from ERD diagram\n\n`;
    schema += `import { DataTypes, Model, Sequelize } from 'sequelize';\n\n`;

    entities.forEach(entity => {
      const modelName = this.toPascalCase(entity.tableName);
      
      schema += `export class ${modelName} extends Model {\n`;
      entity.fields.forEach(field => {
        const tsType = this.mapToTypeScriptType(field.type);
        schema += `  public ${field.name}!: ${tsType};\n`;
      });
      schema += `}\n\n`;

      schema += `${modelName}.init({\n`;
      entity.fields.forEach(field => {
        schema += `  ${field.name}: {\n`;
        schema += `    type: DataTypes.${this.mapToSequelizeType(field.type)},\n`;
        
        if (field.isPrimaryKey) {
          schema += `    primaryKey: true,\n`;
          if (field.type === 'Int') {
            schema += `    autoIncrement: true,\n`;
          }
        }
        
        if (!field.isRequired) {
          schema += `    allowNull: false,\n`;
        }
        
        if (field.isUnique) {
          schema += `    unique: true,\n`;
        }
        
        if (field.defaultValue) {
          schema += `    defaultValue: ${field.defaultValue},\n`;
        }
        
        schema += `  },\n`;
      });
      
      schema += `}, {\n`;
      schema += `  sequelize,\n`;
      schema += `  tableName: '${entity.tableName}',\n`;
      schema += `});\n\n`;
    });

    return schema;
  }

  // Helper methods
  private toPascalCase(str: string): string {
    return str.replace(/(?:^|_)([a-z])/g, (_, char) => char.toUpperCase());
  }

  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  private mapToPrismaType(type: string): string {
    const mapping: Record<string, string> = {
      'String': 'String',
      'Int': 'Int',
      'Float': 'Float',
      'Boolean': 'Boolean',
      'DateTime': 'DateTime',
      'UUID': 'String',
      'JSON': 'Json',
      'Text': 'String',
      'Email': 'String',
      'URL': 'String',
      'Decimal': 'Decimal',
      'BigInt': 'BigInt',
    };
    return mapping[type] || 'String';
  }

  private mapToTypeScriptType(type: string): string {
    const mapping: Record<string, string> = {
      'String': 'string',
      'Int': 'number',
      'Float': 'number',
      'Boolean': 'boolean',
      'DateTime': 'Date',
      'UUID': 'string',
      'JSON': 'any',
      'Text': 'string',
      'Email': 'string',
      'URL': 'string',
      'Decimal': 'number',
      'BigInt': 'bigint',
    };
    return mapping[type] || 'string';
  }

  private mapToMongooseType(type: string): string {
    const mapping: Record<string, string> = {
      'String': 'String',
      'Int': 'Number',
      'Float': 'Number',
      'Boolean': 'Boolean',
      'DateTime': 'Date',
      'UUID': 'String',
      'JSON': 'Schema.Types.Mixed',
      'Text': 'String',
      'Email': 'String',
      'URL': 'String',
      'Decimal': 'Number',
      'BigInt': 'Number',
    };
    return mapping[type] || 'String';
  }

  private mapToSQLType(type: string): string {
    const mapping: Record<string, string> = {
      'String': 'VARCHAR(255)',
      'Int': 'INT',
      'Float': 'FLOAT',
      'Boolean': 'BOOLEAN',
      'DateTime': 'TIMESTAMP',
      'UUID': 'VARCHAR(36)',
      'JSON': 'JSON',
      'Text': 'TEXT',
      'Email': 'VARCHAR(255)',
      'URL': 'VARCHAR(500)',
      'Decimal': 'DECIMAL(10,2)',
      'BigInt': 'BIGINT',
    };
    return mapping[type] || 'VARCHAR(255)';
  }

  private mapToSequelizeType(type: string): string {
    const mapping: Record<string, string> = {
      'String': 'STRING',
      'Int': 'INTEGER',
      'Float': 'FLOAT',
      'Boolean': 'BOOLEAN',
      'DateTime': 'DATE',
      'UUID': 'UUID',
      'JSON': 'JSON',
      'Text': 'TEXT',
      'Email': 'STRING',
      'URL': 'STRING',
      'Decimal': 'DECIMAL',
      'BigInt': 'BIGINT',
    };
    return mapping[type] || 'STRING';
  }
}

export const schemaGenerator = new SchemaGenerator();