"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Copy, 
  Download, 
  FileCode, 
  Database, 
  Code2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ERDEntity, ERDRelationship, SchemaType, SchemaGenerationOptions } from "@/types/erd";
import { schemaGenerator } from "@/lib/schema-generator";

interface SchemaExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entities: ERDEntity[];
  relationships: ERDRelationship[];
}

export const SchemaExportModal = ({ 
  isOpen, 
  onClose, 
  entities, 
  relationships 
}: SchemaExportModalProps) => {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<SchemaType>('prisma');
  const [generatedSchema, setGeneratedSchema] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [filename, setFilename] = useState('schema');
  
  // Generation options
  const [options, setOptions] = useState<SchemaGenerationOptions>({
    type: 'prisma',
    databaseProvider: 'postgresql',
    includeComments: true,
    includeTimestamps: true,
    includeValidation: true,
    formatting: {
      indentSize: 2,
      useSpaces: true,
      lineEnding: 'lf'
    }
  });

  const schemaTypes = [
    { 
      value: 'prisma' as SchemaType, 
      label: 'Prisma Schema', 
      icon: Database,
      extension: '.prisma',
      description: 'Prisma ORM schema with type-safe database access'
    },
    { 
      value: 'mongodb' as SchemaType, 
      label: 'MongoDB/Mongoose', 
      icon: Database,
      extension: '.ts',
      description: 'MongoDB schemas using Mongoose ODM'
    },
    { 
      value: 'sql' as SchemaType, 
      label: 'SQL DDL', 
      icon: Database,
      extension: '.sql',
      description: 'Standard SQL Data Definition Language'
    },
    { 
      value: 'typescript' as SchemaType, 
      label: 'TypeScript Interfaces', 
      icon: Code2,
      extension: '.ts',
      description: 'TypeScript type definitions'
    },
    { 
      value: 'sequelize' as SchemaType, 
      label: 'Sequelize Models', 
      icon: FileCode,
      extension: '.ts',
      description: 'Sequelize ORM model definitions'
    }
  ];

  const databaseProviders = [
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'sqlite', label: 'SQLite' },
    { value: 'mongodb', label: 'MongoDB' },
    { value: 'sqlserver', label: 'SQL Server' }
  ];

  const generateSchema = async () => {
    if (entities.length === 0) {
      toast({
        title: "No Entities",
        description: "Please add entities to your ERD before generating schema.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const schema = schemaGenerator.generateSchema(
        entities, 
        relationships, 
        { ...options, type: selectedType }
      );
      
      setGeneratedSchema(schema);
      
      toast({
        title: "Schema Generated",
        description: `${selectedType.toUpperCase()} schema generated successfully!`,
        variant: "default"
      });
    } catch (error) {
      console.error('Schema generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate schema. Please check your ERD structure.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedSchema) return;
    
    try {
      await navigator.clipboard.writeText(generatedSchema);
      toast({
        title: "Copied!",
        description: "Schema copied to clipboard.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const downloadSchema = () => {
    if (!generatedSchema) return;
    
    const selectedSchema = schemaTypes.find(t => t.value === selectedType);
    const extension = selectedSchema?.extension || '.txt';
    const fullFilename = filename.endsWith(extension) ? filename : `${filename}${extension}`;
    
    const blob = new Blob([generatedSchema], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fullFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: `Schema downloaded as ${fullFilename}`,
      variant: "default"
    });
  };

  const handleTypeChange = (type: SchemaType) => {
    setSelectedType(type);
    setOptions(prev => ({ ...prev, type }));
    setGeneratedSchema(''); // Clear previous schema
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Export ERD Schema
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="generate" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate Schema</TabsTrigger>
            <TabsTrigger value="preview">Preview & Export</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="flex-1 space-y-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Schema Type Selection */}
              <div className="space-y-2">
                <Label>Schema Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {schemaTypes.map((type) => (
                    <div
                      key={type.value}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedType === type.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTypeChange(type.value)}
                    >
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        <span className="font-medium">{type.label}</span>
                        {selectedType === type.value && (
                          <CheckCircle2 className="h-4 w-4 text-blue-500 ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Database Provider (for applicable schema types) */}
              {(selectedType === 'prisma' || selectedType === 'sql') && (
                <div className="space-y-2">
                  <Label>Database Provider</Label>
                  <Select
                    value={options.databaseProvider}
                    onValueChange={(value) => setOptions(prev => ({ 
                      ...prev, 
                      databaseProvider: value as any 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {databaseProviders.map((provider) => (
                        <SelectItem key={provider.value} value={provider.value}>
                          {provider.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Generation Options */}
              <div className="space-y-3">
                <Label>Generation Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="comments"
                      checked={options.includeComments}
                      onCheckedChange={(checked) => setOptions(prev => ({ 
                        ...prev, 
                        includeComments: checked as boolean 
                      }))}
                    />
                    <Label htmlFor="comments">Include Comments</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="timestamps"
                      checked={options.includeTimestamps}
                      onCheckedChange={(checked) => setOptions(prev => ({ 
                        ...prev, 
                        includeTimestamps: checked as boolean 
                      }))}
                    />
                    <Label htmlFor="timestamps">Include Timestamps</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="validation"
                      checked={options.includeValidation}
                      onCheckedChange={(checked) => setOptions(prev => ({ 
                        ...prev, 
                        includeValidation: checked as boolean 
                      }))}
                    />
                    <Label htmlFor="validation">Include Validation Rules</Label>
                  </div>
                </div>
              </div>

              {/* Entity Summary */}
              <div className="space-y-2">
                <Label>ERD Summary</Label>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span>Entities: {entities.length}</span>
                    <span>Relationships: {relationships.length}</span>
                  </div>
                  {entities.length === 0 && (
                    <div className="flex items-center gap-2 text-amber-600 mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">No entities found. Please add entities to your ERD.</span>
                    </div>
                  )}
                </div>
              </div>

              <Button 
                onClick={generateSchema} 
                disabled={isGenerating || entities.length === 0}
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Generate Schema'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 flex flex-col min-h-0">
            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              {/* File Settings */}
              <div className="space-y-2">
                <Label>Filename</Label>
                <div className="flex gap-2">
                  <Input
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    placeholder="Enter filename"
                  />
                  <span className="flex items-center text-sm text-gray-500 px-2">
                    {schemaTypes.find(t => t.value === selectedType)?.extension}
                  </span>
                </div>
              </div>

              {/* Schema Preview */}
              <div className="space-y-2 flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center">
                  <Label>Generated Schema</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      disabled={!generatedSchema}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadSchema}
                      disabled={!generatedSchema}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <Textarea
                  value={generatedSchema || 'Generate schema first...'}
                  readOnly
                  className="font-mono text-sm flex-1 min-h-[300px] resize-none"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};