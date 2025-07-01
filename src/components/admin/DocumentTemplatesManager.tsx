import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Edit, 
  Trash2, 
  Plus, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface DocumentTemplate {
  id: string;
  document_type: string;
  name: string;
  description: string;
  prompt_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DocumentType {
  type: string;
  name: string;
  description: string;
}

const DocumentTemplatesManager: React.FC = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
    loadDocumentTypes();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/admin/document-templates', {
        headers: {
          'Authorization': 'Basic ' + btoa('superadmin:SuperAdmin@2024!')
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      } else {
        setError('Erro ao carregar templates');
      }
    } catch (error) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentTypes = async () => {
    try {
      const response = await fetch('/api/admin/document-templates/types/available', {
        headers: {
          'Authorization': 'Basic ' + btoa('superadmin:SuperAdmin@2024!')
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocumentTypes(data.types);
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de documentos:', error);
    }
  };

  const handleSaveTemplate = async (templateData: Partial<DocumentTemplate>) => {
    try {
      const url = editingTemplate 
        ? `/api/admin/document-templates/${editingTemplate.id}`
        : '/api/admin/document-templates';
      
      const method = editingTemplate ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('superadmin:SuperAdmin@2024!')
        },
        body: JSON.stringify(templateData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);
        setEditingTemplate(null);
        setShowCreateForm(false);
        loadTemplates();
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError('Erro ao salvar template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este template?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/document-templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Basic ' + btoa('superadmin:SuperAdmin@2024!')
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);
        loadTemplates();
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError('Erro ao deletar template');
    }
  };

  const getDocumentTypeName = (type: string) => {
    const docType = documentTypes.find(dt => dt.type === type);
    return docType ? docType.name : type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando templates...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Gerenciar Templates de Documentos
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Template
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {success}
          <button onClick={() => setSuccess(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {templates.map((template) => (
          <div key={template.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    template.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {template.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Tipo:</strong> {getDocumentTypeName(template.document_type)}
                </p>
                
                {template.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>
                )}
                
                <div className="text-xs text-gray-500">
                  Criado em: {new Date(template.created_at).toLocaleString('pt-BR')}
                  {template.updated_at !== template.created_at && (
                    <span className="ml-4">
                      Atualizado em: {new Date(template.updated_at).toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingTemplate(template)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Editar template"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Deletar template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {templates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum template encontrado</p>
            <p className="text-sm">Clique em "Novo Template" para criar o primeiro</p>
          </div>
        )}
      </div>

      {/* Modal de Edição/Criação */}
      {(editingTemplate || showCreateForm) && (
        <TemplateFormModal
          template={editingTemplate}
          documentTypes={documentTypes}
          onSave={handleSaveTemplate}
          onCancel={() => {
            setEditingTemplate(null);
            setShowCreateForm(false);
          }}
        />
      )}
    </div>
  );
};

// Componente do Modal de Formulário
interface TemplateFormModalProps {
  template: DocumentTemplate | null;
  documentTypes: DocumentType[];
  onSave: (data: Partial<DocumentTemplate>) => void;
  onCancel: () => void;
}

const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
  template,
  documentTypes,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    document_type: template?.document_type || '',
    name: template?.name || '',
    description: template?.description || '',
    prompt_template: template?.prompt_template || '',
    is_active: template?.is_active !== undefined ? template.is_active : true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {template ? 'Editar Template' : 'Novo Template'}
          </h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento
            </label>
            <select
              value={formData.document_type}
              onChange={(e) => setFormData(prev => ({ ...prev, document_type: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={!!template} // Não permite alterar tipo em edição
            >
              <option value="">Selecione um tipo</option>
              {documentTypes.map(type => (
                <option key={type.type} value={type.type}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Template
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template do Prompt
            </label>
            <textarea
              value={formData.prompt_template}
              onChange={(e) => setFormData(prev => ({ ...prev, prompt_template: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              rows={8}
              required
              placeholder="Digite o prompt que será usado para gerar este tipo de documento..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Template ativo
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentTemplatesManager;
