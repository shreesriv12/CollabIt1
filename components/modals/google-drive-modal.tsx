"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, FileText, Sheet, Image as ImageIcon, Link2 } from "lucide-react";
import { useGoogleDriveModal } from "@/store/use-google-drive-modal";
import { useMutation, useStorage } from "@/liveblocks.config";
import { nanoid } from "nanoid";
import { LiveObject } from "@liveblocks/client";
import { LayerType } from "@/types/canvas";
import type { DriveFile } from "@/lib/google-drive";

export const GoogleDriveModal = () => {
  const { isOpen, close } = useGoogleDriveModal();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileType, setFileType] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const insertGoogleDocEmbed = useMutation(
    ({ storage, setMyPresence }, file: DriveFile) => {
      const liveLayers = storage.get("layers");
      const liveLayerIds = storage.get("layerIds");
      const layerId = nanoid();

      const documentId = file.id;
      const embeddableLink = `https://docs.google.com/document/d/${documentId}/preview`;

      const layer = new LiveObject({
        type: LayerType.GoogleDocEmbed,
        x: 100,
        y: 100,
        height: 600,
        width: 800,
        fill: { r: 255, g: 255, b: 255 },
        documentId,
        title: file.name,
        embeddableLink,
      });

      liveLayerIds.push(layerId);
      liveLayers.set(layerId, layer);
      setMyPresence({ selection: [layerId] }, { addToHistory: true });
      close();
    },
    [],
  );

  const insertGoogleSheetEmbed = useMutation(
    ({ storage, setMyPresence }, file: DriveFile) => {
      const liveLayers = storage.get("layers");
      const liveLayerIds = storage.get("layerIds");
      const layerId = nanoid();

      const spreadsheetId = file.id;

      const layer = new LiveObject({
        type: LayerType.GoogleSheetEmbed,
        x: 100,
        y: 100,
        height: 600,
        width: 800,
        fill: { r: 255, g: 255, b: 255 },
        spreadsheetId,
        title: file.name,
        sheetIndex: 0,
      });

      liveLayerIds.push(layerId);
      liveLayers.set(layerId, layer);
      setMyPresence({ selection: [layerId] }, { addToHistory: true });
      close();
    },
    [],
  );

  const insertImageEmbed = useMutation(
    ({ storage, setMyPresence }, file: DriveFile, imageUrl: string) => {
      const liveLayers = storage.get("layers");
      const liveLayerIds = storage.get("layerIds");
      const layerId = nanoid();

      const layer = new LiveObject({
        type: LayerType.ImageEmbed,
        x: 100,
        y: 100,
        height: 400,
        width: 400,
        fill: { r: 255, g: 255, b: 255 },
        fileId: file.id,
        fileName: file.name,
        imageUrl,
      });

      liveLayerIds.push(layerId);
      liveLayers.set(layerId, layer);
      setMyPresence({ selection: [layerId] }, { addToHistory: true });
      close();
    },
    [],
  );

  useEffect(() => {
    if (isOpen && !accessToken) {
      const storedToken = localStorage.getItem("google_drive_access_token");
      if (storedToken) {
        setAccessToken(storedToken);
        loadFiles(storedToken);
      } else {
        initiateGoogleAuth();
      }
    }
  }, [isOpen, accessToken]);

  const initiateGoogleAuth = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/drive/auth", { method: "POST" });
      const { authUrl } = await response.json();

      const popup = window.open(authUrl, "google_auth", "width=500,height=600");

      const checkAuth = () => {
        const token = localStorage.getItem("google_drive_access_token");
        if (token) {
          if (popup) popup.close();
          setAccessToken(token);
          loadFiles(token);
        } else {
          setTimeout(checkAuth, 500);
        }
      };

      setTimeout(checkAuth, 500);
    } catch (error) {
      console.error("Auth failed:", error);
      setLoading(false);
    }
  };

  const loadFiles = async (token: string, query?: string, type?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        access_token: token,
        ...(query && { q: query }),
        ...(type && { type }),
      });

      const response = await fetch(`/api/drive/boards?${params}`);
      const data = await response.json();

      if (data.files) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error("Failed to load files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (accessToken) {
      loadFiles(accessToken, searchQuery, fileType || undefined);
    }
  };

  const handleFileSelect = (file: DriveFile) => {
    if (file.mimeType.includes("document")) {
      insertGoogleDocEmbed(file);
    } else if (file.mimeType.includes("spreadsheet")) {
      insertGoogleSheetEmbed(file);
    } else if (file.mimeType.includes("image") || file.mimeType === "application/pdf") {
      const imageUrl = file.webContentLink || file.webViewLink || "";
      insertImageEmbed(file, imageUrl);
    }
  };

  const getMimeTypeIcon = (mimeType: string) => {
    if (mimeType.includes("document")) return <FileText className="w-4 h-4" />;
    if (mimeType.includes("spreadsheet")) return <Sheet className="w-4 h-4" />;
    if (mimeType.includes("image")) return <ImageIcon className="w-4 h-4" />;
    return <Link2 className="w-4 h-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import from Google Drive</DialogTitle>
          <DialogDescription>
            Search and select files to embed on your board
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-2">
            <Input
              placeholder="Search Google Drive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              disabled={loading || !accessToken}
              size="sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {/* File Type Filter */}
          <div className="flex gap-2 flex-wrap">
            {["documents", "sheets", "images", "pdfs"].map((type) => (
              <Button
                key={type}
                variant={fileType === type ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFileType(fileType === type ? null : type);
                  if (accessToken) {
                    loadFiles(accessToken, searchQuery, fileType === type ? undefined : type);
                  }
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>

          {/* File List */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto border rounded-lg p-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : files.length > 0 ? (
              files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getMimeTypeIcon(file.mimeType)}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(file.modifiedTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleFileSelect(file)}
                  >
                    Add
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {accessToken ? "No files found" : "Please authenticate to access Google Drive"}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};