"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  Save,
} from "lucide-react";
import { PageHeader } from "../../../components/PageHeader";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { DataTable } from "../../../components/ui/DataTable";
import { useTemplates } from "../../../hooks/useApi";
import { apiClient } from "../../../lib/api";
import { useQueryClient } from "@tanstack/react-query";

export default function TemplatesPage() {
  const { data: templates, isLoading } = useTemplates();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    category: "General",
  });
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const filteredTemplates =
    templates?.filter(
      (t: any) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.content.toLowerCase().includes(search.toLowerCase()),
    ) || [];

  const handleOpenModal = (template?: any) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        content: template.content,
        category: template.category,
      });
    } else {
      setEditingTemplate(null);
      setFormData({ name: "", content: "", category: "General" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.content) return;
    setIsSaving(true);
    try {
      if (editingTemplate) {
        await apiClient.patch(`/templates/${editingTemplate.id}`, formData);
      } else {
        await apiClient.post("/templates", formData);
      }
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await apiClient.delete(`/templates/${id}`);
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    } catch (e) {
      console.error(e);
      alert("Failed to delete template");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mistral-orange"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader
        title="Templates"
        description="Create and manage your pre-approved SMS message templates."
        actions={
          <Button
            leftIcon={<Plus size={18} />}
            onClick={() => handleOpenModal()}
          >
            Create Template
          </Button>
        }
      />

      <div className="px-4 md:px-8 pb-8 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <Button variant="outline" leftIcon={<Filter size={18} />}>
            Filters
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <DataTable
              data={filteredTemplates}
              emptyMessage="No templates found. Create one to get started."
              columns={[
                {
                  header: "Template Name",
                  accessor: (item: any) => (
                    <span className="font-bold text-slate-900">
                      {item.name}
                    </span>
                  ),
                },
                {
                  header: "Category",
                  accessor: (item: any) => (
                    <Badge variant="info">{item.category}</Badge>
                  ),
                },
                {
                  header: "Message Content",
                  accessor: (item: any) => (
                    <div className="max-w-md truncate text-slate-500 italic">
                      "{item.content}"
                    </div>
                  ),
                },
                {
                  header: "Last Updated",
                  accessor: (item: any) =>
                    new Date(item.updatedAt).toLocaleDateString(),
                },
                {
                  header: "",
                  accessor: (item: any) => (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(item)}
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-500 hover:bg-rose-50"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <Card className="max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTemplate ? "Edit Template" : "Create New Template"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Template Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Welcome Message"
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm"
                >
                  <option value="General">General</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Alert">Alert</option>
                  <option value="Support">Support</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Message Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Enter your template message..."
                  className="w-full h-32 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSave}
                  isLoading={isSaving}
                >
                  <Save size={18} className="mr-2" />
                  {editingTemplate ? "Update" : "Save"} Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
