"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Database, KeyRound, Key } from "lucide-react";
import { ERD_FIELD_TYPES } from "@/types/erd";
import { nanoid } from "nanoid";
import { useERDEntityModal } from "@/store/use-erd-entity-modal";
import { useMutation, useStorage } from "@/liveblocks.config";

interface ERDField {
  id: string;
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isRequired: boolean;
  isUnique: boolean;
  defaultValue?: string;
}

export function ERDEntityModal() {
  const { isOpen, editingEntity, close } = useERDEntityModal();
  const [tableName, setTableName] = useState("");
  const [fields, setFields] = useState<ERDField[]>([]);

  const updateEntity = useMutation(
    ({ storage }, entityId: string, entityData: any) => {
      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(entityId);
      
      if (layer) {
        layer.update({
          entityData: entityData,
          height: Math.max(120, 50 + entityData.fields.length * 25)
        });
      }
    },
    []
  );

  useEffect(() => {
    if (editingEntity) {
      setTableName(editingEntity.tableName || editingEntity.name || "");
      setFields(editingEntity.fields || []);
    } else {
      // Reset to default
      setTableName("");
      setFields([{
        id: nanoid(),
        name: "id",
        type: "UUID",
        isPrimaryKey: true,
        isForeignKey: false,
        isRequired: true,
        isUnique: true,
        defaultValue: "uuid()"
      }]);
    }
  }, [editingEntity, isOpen]);

  const addField = () => {
    const newField: ERDField = {
      id: nanoid(),
      name: "",
      type: "String",
      isPrimaryKey: false,
      isForeignKey: false,
      isRequired: false,
      isUnique: false,
      defaultValue: ""
    };
    setFields([...fields, newField]);
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
  };

  const updateField = (fieldId: string, updates: Partial<ERDField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const handleSave = () => {
    if (!tableName.trim()) return;
    
    // Ensure we have at least one primary key
    const hasPrimaryKey = fields.some(field => field.isPrimaryKey);
    let finalFields = [...fields];
    if (!hasPrimaryKey && finalFields.length > 0) {
      // Make the first field a primary key if none exists
      finalFields[0] = { ...finalFields[0], isPrimaryKey: true, isRequired: true };
    }

    // Filter out empty fields
    finalFields = finalFields.filter(field => field.name.trim());

    if (editingEntity?.id) {
      // Update existing entity
      const updatedEntityData = {
        id: editingEntity.id,
        name: tableName.trim(),
        tableName: tableName.trim(),
        fields: finalFields,
        position: editingEntity.position || { x: 0, y: 0 }
      };
      
      updateEntity(editingEntity.id, updatedEntityData);
    }
    
    handleClose();
  };

  const handleClose = () => {
    close();
    setTableName("");
    setFields([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            {editingEntity ? 'Edit Entity' : 'Create Entity'}
          </DialogTitle>
          <DialogDescription>
            Define your database table structure with fields and constraints.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Table Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Table Name</label>
            <Input
              placeholder="Enter table name (e.g., users, products, orders)"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="font-mono"
            />
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Fields</label>
              <Button onClick={addField} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="grid grid-cols-12 gap-3 items-start">
                    {/* Field Name */}
                    <div className="col-span-3">
                      <Input
                        placeholder="Field name"
                        value={field.name}
                        onChange={(e) => updateField(field.id, { name: e.target.value })}
                        className="text-sm font-mono"
                      />
                    </div>

                    {/* Field Type */}
                    <div className="col-span-3">
                      <Select
                        value={field.type}
                        onValueChange={(value) => updateField(field.id, { type: value })}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ERD_FIELD_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Constraints */}
                    <div className="col-span-5 grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`pk-${field.id}`}
                          checked={field.isPrimaryKey}
                          onCheckedChange={(checked) => 
                            updateField(field.id, { 
                              isPrimaryKey: !!checked,
                              isRequired: !!checked || field.isRequired 
                            })
                          }
                        />
                        <label htmlFor={`pk-${field.id}`} className="text-xs flex items-center gap-1">
                          <KeyRound className="h-3 w-3" />
                          PK
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`fk-${field.id}`}
                          checked={field.isForeignKey}
                          onCheckedChange={(checked) => 
                            updateField(field.id, { isForeignKey: !!checked })
                          }
                        />
                        <label htmlFor={`fk-${field.id}`} className="text-xs flex items-center gap-1">
                          <Key className="h-3 w-3" />
                          FK
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`req-${field.id}`}
                          checked={field.isRequired}
                          onCheckedChange={(checked) => 
                            updateField(field.id, { isRequired: !!checked })
                          }
                        />
                        <label htmlFor={`req-${field.id}`} className="text-xs">
                          Required
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`unique-${field.id}`}
                          checked={field.isUnique}
                          onCheckedChange={(checked) => 
                            updateField(field.id, { isUnique: !!checked })
                          }
                        />
                        <label htmlFor={`unique-${field.id}`} className="text-xs">
                          Unique
                        </label>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="col-span-1">
                      <Button
                        onClick={() => removeField(field.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Default Value */}
                  <div className="mt-2">
                    <Input
                      placeholder="Default value (optional)"
                      value={field.defaultValue || ""}
                      onChange={(e) => updateField(field.id, { defaultValue: e.target.value })}
                      className="text-xs font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button onClick={handleClose} variant="outline">
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!tableName.trim() || fields.length === 0}
            >
              {editingEntity ? 'Update Entity' : 'Create Entity'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}