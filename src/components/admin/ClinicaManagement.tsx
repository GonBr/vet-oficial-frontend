import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  X,
  Save,
  Users,
  Phone,
  Mail,
  MapPin,
  Image
} from 'lucide-react';

interface Clinica {
  id: string;
  nome: string;
  razaoSocial?: string;
  logoPath?: string;
  telefone?: string;
  endereco?: string;
  email?: string;
  totalUsuarios: number;
  createdAt: string;
}

const ClinicaManagement: React.FC = () => {
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClinica, setEditingClinica] = useState<Clinica | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    razaoSocial: '',
    telefone: '',
    endereco: '',
    email: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [removerLogo, setRemoverLogo] = useState(false);

  useEffect(() => {
    fetchClinicas();
  }, []);

  const fetchClinicas = async () => {
    try {
      const response = await fetch('/api/admin/clinicas', {
        headers: {
          'Authorization': `Basic ${btoa('superadmin:SuperAdmin@2024!')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClinicas(data);
      } else {
        console.error('Erro ao buscar clínicas');
      }
    } catch (error) {
      console.error('Erro ao buscar clínicas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('nome', formData.nome);
    formDataToSend.append('razaoSocial', formData.razaoSocial);
    formDataToSend.append('telefone', formData.telefone);
    formDataToSend.append('endereco', formData.endereco);
    formDataToSend.append('email', formData.email);
    
    if (logoFile) {
      formDataToSend.append('logo', logoFile);
    }
    
    if (removerLogo) {
      formDataToSend.append('removerLogo', 'true');
    }

    try {
      const url = editingClinica 
        ? `/api/admin/clinicas/${editingClinica.id}`
        : '/api/admin/clinicas';
      
      const method = editingClinica ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Basic ${btoa('superadmin:SuperAdmin@2024!')}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        await fetchClinicas();
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao salvar clínica');
      }
    } catch (error) {
      console.error('Erro ao salvar clínica:', error);
      alert('Erro ao salvar clínica');
    }
  };

  const handleEdit = (clinica: Clinica) => {
    setEditingClinica(clinica);
    setFormData({
      nome: clinica.nome,
      razaoSocial: clinica.razaoSocial || '',
      telefone: clinica.telefone || '',
      endereco: clinica.endereco || '',
      email: clinica.email || ''
    });
    setLogoPreview(clinica.logoPath || null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta clínica?')) return;

    try {
      const response = await fetch(`/api/admin/clinicas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${btoa('superadmin:SuperAdmin@2024!')}`
        }
      });

      if (response.ok) {
        await fetchClinicas();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir clínica');
      }
    } catch (error) {
      console.error('Erro ao excluir clínica:', error);
      alert('Erro ao excluir clínica');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClinica(null);
    setFormData({
      nome: '',
      razaoSocial: '',
      telefone: '',
      endereco: '',
      email: ''
    });
    setLogoFile(null);
    setLogoPreview(null);
    setRemoverLogo(false);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setRemoverLogo(false);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoverLogo = () => {
    setRemoverLogo(true);
    setLogoFile(null);
    setLogoPreview(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Clínicas</h1>
          <p className="text-gray-600">Configure as clínicas do sistema multi-tenant</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Clínica
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clínica
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuários
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Criada em
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clinicas.map((clinica) => (
              <tr key={clinica.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {clinica.logoPath ? (
                      <img
                        src={clinica.logoPath}
                        alt={clinica.nome}
                        className="w-10 h-10 rounded-lg object-cover mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                        <Building2 className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{clinica.nome}</div>
                      {clinica.razaoSocial && (
                        <div className="text-sm text-gray-500">{clinica.razaoSocial}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="space-y-1">
                    {clinica.telefone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {clinica.telefone}
                      </div>
                    )}
                    {clinica.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        {clinica.email}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-gray-900">
                    <Users className="w-4 h-4 text-gray-400" />
                    {clinica.totalUsuarios}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(clinica.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(clinica)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(clinica.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clinicas.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma clínica cadastrada</h3>
            <p className="text-gray-600 mb-4">Comece criando sua primeira clínica</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Criar Clínica
            </button>
          </div>
        )}
      </div>

      {/* Modal para criar/editar clínica */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingClinica ? 'Editar Clínica' : 'Nova Clínica'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo da Clínica
                </label>
                <div className="space-y-3">
                  {logoPreview && !removerLogo && (
                    <div className="relative inline-block">
                      <img
                        src={logoPreview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={handleRemoverLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                      <Upload className="w-4 h-4" />
                      {logoFile ? 'Trocar Logo' : 'Selecionar Logo'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                    {logoFile && (
                      <span className="text-sm text-gray-600">{logoFile.name}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Formatos aceitos: PNG, JPG, SVG (máx. 5MB)
                  </p>
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Clínica *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ex: Clínica Veterinária São Francisco"
                />
              </div>

              {/* Razão Social */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razão Social
                </label>
                <input
                  type="text"
                  value={formData.razaoSocial}
                  onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ex: Clínica Veterinária São Francisco Ltda"
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="contato@clinica.com"
                />
              </div>

              {/* Endereço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <textarea
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Rua, número, bairro, cidade - CEP"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingClinica ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicaManagement;
