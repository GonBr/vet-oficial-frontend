import React, { useState, useEffect } from 'react';
import { FichaClinica, FichaClinicaResponse } from '../types/fichaClinica';
import { FileText, RefreshCw, AlertCircle, CheckCircle, Edit, Save, Download } from 'lucide-react';
import { fichaClinicaPdfGenerator } from '../services/fichaClinicaPdfGenerator';
import { clinicDataService } from '../services/clinicDataService';

interface FichaClinicaProps {
  consultationId: string;
  onClose: () => void;
}

const FichaClinicaComponent: React.FC<FichaClinicaProps> = ({ consultationId }) => {
  const [fichaClinica, setFichaClinica] = useState<FichaClinica | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFicha, setEditedFicha] = useState<FichaClinica | null>(null);

  useEffect(() => {
    loadFichaClinica();
  }, [consultationId]);

  const loadFichaClinica = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/fichas-clinicas/${consultationId}`, {
        headers: {
          'Authorization': `Basic ${btoa('admin:admin123')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar ficha clínica');
      }

      const data: FichaClinicaResponse = await response.json();

      if (data.success) {
        setFichaClinica(data.data);
        setEditedFicha(data.data);
      } else {
        setError(data.message || 'Erro ao carregar ficha clínica');
      }
    } catch (err) {
      console.error('Erro ao carregar ficha clínica:', err);
      setError('Erro ao carregar ficha clínica');
    } finally {
      setLoading(false);
    }
  };

  const generateFichaClinica = async () => {
    try {
      setGenerating(true);
      setError(null);

      const response = await fetch(`/api/fichas-clinicas/${consultationId}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa('admin:admin123')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar ficha clínica');
      }

      const data: FichaClinicaResponse = await response.json();

      if (data.success && data.data) {
        setFichaClinica(data.data);
        setEditedFicha(data.data);
        setSuccess('Ficha clínica gerada com sucesso!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Erro ao gerar ficha clínica');
      }
    } catch (err) {
      console.error('Erro ao gerar ficha clínica:', err);
      setError('Erro ao gerar ficha clínica');
    } finally {
      setGenerating(false);
    }
  };

  const handleEdit = () => {
    setEditedFicha(fichaClinica);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedFicha(fichaClinica);
  };

  const handleSave = async () => {
    if (!editedFicha) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/fichas-clinicas/${editedFicha.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${btoa('admin:admin123')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedFicha)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar ficha clínica');
      }

      const data: FichaClinicaResponse = await response.json();

      if (data.success && data.data) {
        setFichaClinica(data.data);
        setEditedFicha(data.data);
        setIsEditing(false);
        setSuccess('Ficha clínica salva com sucesso!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Erro ao salvar ficha clínica');
      }
    } catch (err) {
      console.error('Erro ao salvar ficha clínica:', err);
      setError('Erro ao salvar ficha clínica');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!fichaClinica) return;

    try {
      setGeneratingPdf(true);
      setError(null);

      console.log('🔍 Iniciando geração de PDF...');

      // Buscar dados da clínica e veterinário
      const { clinic, veterinarian } = await clinicDataService.getDataForPDF();

      console.log('🏥 Dados da clínica:', clinic);
      console.log('👨‍⚕️ Dados do veterinário:', veterinarian);

      // Preparar dados para o PDF
      const clinicData = clinic ? {
        nome: clinic.nome,
        razaoSocial: clinic.razaoSocial,
        telefone: clinic.telefone,
        endereco: clinic.endereco,
        email: clinic.email
      } : undefined;

      const veterinarianData = veterinarian ? {
        nome: veterinarian.name,
        crmv: veterinarian.crmv,
        assinatura: veterinarian.assinatura
      } : undefined;

      console.log('📄 Dados preparados para PDF:', { clinicData, veterinarianData });

      // Gerar PDF
      await fichaClinicaPdfGenerator.generatePDF(fichaClinica, {
        clinicData,
        veterinarianData,
        includeEmptyFields: true
      });

      console.log('✅ PDF gerado com sucesso!');
      setSuccess('PDF gerado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);

    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      setError('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="flex items-center text-sm text-gray-600">
          <RefreshCw className="animate-spin h-4 w-4 mr-2" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          <h2 className="text-xl font-semibold">Ficha Clínica Veterinária</h2>
        </div>
        <div className="flex items-center space-x-2">
          {!fichaClinica ? (
            <button
              onClick={generateFichaClinica}
              disabled={generating}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 px-4 py-2 rounded-lg flex items-center text-sm"
            >
              {generating ? (
                <RefreshCw className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              {generating ? 'Gerando...' : 'Gerar Ficha'}
            </button>
          ) : (
            <>
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 px-4 py-2 rounded-lg flex items-center text-sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center text-sm"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center text-sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </button>
                  <button
                    onClick={handleGeneratePDF}
                    disabled={generatingPdf}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 px-4 py-2 rounded-lg flex items-center text-sm"
                  >
                    {generatingPdf ? (
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {generatingPdf ? 'Gerando...' : 'PDF'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mx-4 mt-4 rounded flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      <div className="p-6 overflow-y-auto max-h-[400px]">
        {!fichaClinica ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma ficha clínica encontrada
            </h3>
            <p className="text-gray-500 mb-6">
              Gere uma ficha clínica automaticamente baseada na transcrição da consulta.
            </p>
            <button
              onClick={generateFichaClinica}
              disabled={generating}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 px-6 py-3 rounded-lg text-white flex items-center mx-auto"
            >
              {generating ? (
                <RefreshCw className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <FileText className="h-5 w-5 mr-2" />
              )}
              {generating ? 'Gerando Ficha Clínica...' : 'Gerar Ficha Clínica'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dados Básicos */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Dados Básicos</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={isEditing ? editedFicha?.dadosBasicos.dataConsulta || '' : fichaClinica.dadosBasicos.dataConsulta}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      dadosBasicos: { ...prev.dadosBasicos, dataConsulta: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                  <input
                    type="time"
                    value={isEditing ? editedFicha?.dadosBasicos.horaConsulta || '' : fichaClinica.dadosBasicos.horaConsulta}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      dadosBasicos: { ...prev.dadosBasicos, horaConsulta: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Atendimento</label>
                  <input
                    type="text"
                    value={isEditing ? editedFicha?.dadosBasicos.atendimento || '' : fichaClinica.dadosBasicos.atendimento}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      dadosBasicos: { ...prev.dadosBasicos, atendimento: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RGHV</label>
                  <input
                    type="text"
                    value={isEditing ? editedFicha?.dadosBasicos.rghv || '' : fichaClinica.dadosBasicos.rghv}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      dadosBasicos: { ...prev.dadosBasicos, rghv: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Dados do Animal */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Dados do Animal</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={isEditing ? editedFicha?.dadosAnimal.nome || '' : fichaClinica.dadosAnimal.nome}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      dadosAnimal: { ...prev.dadosAnimal, nome: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pelagem</label>
                  <input
                    type="text"
                    value={isEditing ? editedFicha?.dadosAnimal.pelagem || '' : fichaClinica.dadosAnimal.pelagem}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      dadosAnimal: { ...prev.dadosAnimal, pelagem: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Espécie</label>
                  <input
                    type="text"
                    value={isEditing ? editedFicha?.dadosAnimal.especie || '' : fichaClinica.dadosAnimal.especie}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      dadosAnimal: { ...prev.dadosAnimal, especie: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raça</label>
                  <input
                    type="text"
                    value={isEditing ? editedFicha?.dadosAnimal.raca || '' : fichaClinica.dadosAnimal.raca}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      dadosAnimal: { ...prev.dadosAnimal, raca: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                  <select
                    value={isEditing ? editedFicha?.dadosAnimal.sexo || '' : fichaClinica.dadosAnimal.sexo}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      dadosAnimal: { ...prev.dadosAnimal, sexo: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Selecione</option>
                    <option value="Macho">Macho</option>
                    <option value="Fêmea">Fêmea</option>
                    <option value="Macho Castrado">Macho Castrado</option>
                    <option value="Fêmea Castrada">Fêmea Castrada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                  <input
                    type="text"
                    value={isEditing ? editedFicha?.dadosAnimal.idade || '' : fichaClinica.dadosAnimal.idade}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      dadosAnimal: { ...prev.dadosAnimal, idade: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    placeholder="Ex: 2 anos, 6 meses"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
                  <input
                    type="text"
                    value={isEditing ? editedFicha?.dadosAnimal.peso || '' : fichaClinica.dadosAnimal.peso}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      dadosAnimal: { ...prev.dadosAnimal, peso: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    placeholder="Ex: 15 kg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Dados do Proprietário */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Dados do Proprietário</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proprietário</label>
                  <input
                    type="text"
                    value={isEditing ? editedFicha?.dadosProprietario.nome || '' : fichaClinica.dadosProprietario.nome}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      dadosProprietario: { ...prev.dadosProprietario, nome: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <input
                    type="text"
                    value={isEditing ? editedFicha?.dadosProprietario.endereco || '' : fichaClinica.dadosProprietario.endereco}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      dadosProprietario: { ...prev.dadosProprietario, endereco: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.dadosProprietario.cidade || '' : fichaClinica.dadosProprietario.cidade}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        dadosProprietario: { ...prev.dadosProprietario, cidade: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.dadosProprietario.estado || '' : fichaClinica.dadosProprietario.estado}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        dadosProprietario: { ...prev.dadosProprietario, estado: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.dadosProprietario.cep || '' : fichaClinica.dadosProprietario.cep}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        dadosProprietario: { ...prev.dadosProprietario, cep: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.dadosProprietario.telefone || '' : fichaClinica.dadosProprietario.telefone}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        dadosProprietario: { ...prev.dadosProprietario, telefone: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doc. Identidade</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.dadosProprietario.documentoIdentidade || '' : fichaClinica.dadosProprietario.documentoIdentidade}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        dadosProprietario: { ...prev.dadosProprietario, documentoIdentidade: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Local do Exame</label>
                  <input
                    type="text"
                    value={isEditing ? editedFicha?.dadosProprietario.localExame || '' : fichaClinica.dadosProprietario.localExame}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      dadosProprietario: { ...prev.dadosProprietario, localExame: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Queixa Principal */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Queixa Principal</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={isEditing ? editedFicha?.queixaPrincipal.descricao || '' : fichaClinica.queixaPrincipal.descricao}
                  onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                    ...prev,
                    queixaPrincipal: { ...prev.queixaPrincipal, descricao: e.target.value }
                  } : null)}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Anamnese */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Anamnese</h4>
              <p className="text-sm text-gray-600 mb-4">
                (antecedentes mórbidos, vacinações, vermifugações, ectoparasitas, comportamento, alimentação, histórico do rebanho/familiar, acesso à rua, habitat, contactantes, contato com roedores)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Antecedentes Mórbidos</label>
                  <textarea
                    value={isEditing ? editedFicha?.anamnese.antecedentesMorbidos || '' : fichaClinica.anamnese.antecedentesMorbidos}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      anamnese: { ...prev.anamnese, antecedentesMorbidos: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vacinações</label>
                  <textarea
                    value={isEditing ? editedFicha?.anamnese.vacinacoes || '' : fichaClinica.anamnese.vacinacoes}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      anamnese: { ...prev.anamnese, vacinacoes: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vermifugações</label>
                  <textarea
                    value={isEditing ? editedFicha?.anamnese.vermifugacoes || '' : fichaClinica.anamnese.vermifugacoes}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      anamnese: { ...prev.anamnese, vermifugacoes: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ectoparasitas</label>
                  <textarea
                    value={isEditing ? editedFicha?.anamnese.ectoparasitas || '' : fichaClinica.anamnese.ectoparasitas}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      anamnese: { ...prev.anamnese, ectoparasitas: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comportamento</label>
                  <textarea
                    value={isEditing ? editedFicha?.anamnese.comportamento || '' : fichaClinica.anamnese.comportamento}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      anamnese: { ...prev.anamnese, comportamento: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alimentação</label>
                  <textarea
                    value={isEditing ? editedFicha?.anamnese.alimentacao || '' : fichaClinica.anamnese.alimentacao}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      anamnese: { ...prev.anamnese, alimentacao: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Histórico do Rebanho/Familiar</label>
                  <textarea
                    value={isEditing ? editedFicha?.anamnese.historicoRebanhoFamiliar || '' : fichaClinica.anamnese.historicoRebanhoFamiliar}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      anamnese: { ...prev.anamnese, historicoRebanhoFamiliar: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Acesso à Rua</label>
                  <textarea
                    value={isEditing ? editedFicha?.anamnese.acessoRua || '' : fichaClinica.anamnese.acessoRua}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      anamnese: { ...prev.anamnese, acessoRua: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Habitat</label>
                  <textarea
                    value={isEditing ? editedFicha?.anamnese.habitat || '' : fichaClinica.anamnese.habitat}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      anamnese: { ...prev.anamnese, habitat: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contactantes</label>
                  <textarea
                    value={isEditing ? editedFicha?.anamnese.contactantes || '' : fichaClinica.anamnese.contactantes}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      anamnese: { ...prev.anamnese, contactantes: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contato com Roedores</label>
                  <textarea
                    value={isEditing ? editedFicha?.anamnese.contatoRoedores || '' : fichaClinica.anamnese.contatoRoedores}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      anamnese: { ...prev.anamnese, contatoRoedores: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Sistema Digestório */}
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Sistema Digestório e Glândulas Anexas</h4>
              <p className="text-sm text-gray-600 mb-4">
                (alimentação, emese, regurgitação, diarréia, disquesia, tenesmo)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alimentação</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaDigestorio.alimentacao || '' : fichaClinica.sistemaDigestorio.alimentacao}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaDigestorio: { ...prev.sistemaDigestorio, alimentacao: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emese</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaDigestorio.emese || '' : fichaClinica.sistemaDigestorio.emese}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaDigestorio: { ...prev.sistemaDigestorio, emese: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Regurgitação</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaDigestorio.regurgitacao || '' : fichaClinica.sistemaDigestorio.regurgitacao}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaDigestorio: { ...prev.sistemaDigestorio, regurgitacao: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diarréia</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaDigestorio.diarreia || '' : fichaClinica.sistemaDigestorio.diarreia}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaDigestorio: { ...prev.sistemaDigestorio, diarreia: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disquesia</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaDigestorio.disquesia || '' : fichaClinica.sistemaDigestorio.disquesia}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaDigestorio: { ...prev.sistemaDigestorio, disquesia: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tenesmo</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaDigestorio.tenesmo || '' : fichaClinica.sistemaDigestorio.tenesmo}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaDigestorio: { ...prev.sistemaDigestorio, tenesmo: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Sistema Respiratório e Cardiovascular */}
            <div className="bg-cyan-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Sistema Respiratório e Cardiovascular</h4>
              <p className="text-sm text-gray-600 mb-4">
                (tosse, espirro, secreções, dispnéia, taquipnéia, cianose, tosse, cansaço fácil, síncope, emagrecimento e cianose)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tosse</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaRespiratorioCardiovascular.tosse || '' : fichaClinica.sistemaRespiratorioCardiovascular.tosse}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaRespiratorioCardiovascular: { ...prev.sistemaRespiratorioCardiovascular, tosse: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Espirro</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaRespiratorioCardiovascular.espirro || '' : fichaClinica.sistemaRespiratorioCardiovascular.espirro}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaRespiratorioCardiovascular: { ...prev.sistemaRespiratorioCardiovascular, espirro: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secreções</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaRespiratorioCardiovascular.secrecoes || '' : fichaClinica.sistemaRespiratorioCardiovascular.secrecoes}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaRespiratorioCardiovascular: { ...prev.sistemaRespiratorioCardiovascular, secrecoes: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dispnéia</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaRespiratorioCardiovascular.dispneia || '' : fichaClinica.sistemaRespiratorioCardiovascular.dispneia}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaRespiratorioCardiovascular: { ...prev.sistemaRespiratorioCardiovascular, dispneia: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taquipnéia</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaRespiratorioCardiovascular.taquipneia || '' : fichaClinica.sistemaRespiratorioCardiovascular.taquipneia}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaRespiratorioCardiovascular: { ...prev.sistemaRespiratorioCardiovascular, taquipneia: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cianose</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaRespiratorioCardiovascular.cianose || '' : fichaClinica.sistemaRespiratorioCardiovascular.cianose}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaRespiratorioCardiovascular: { ...prev.sistemaRespiratorioCardiovascular, cianose: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cansaço Fácil</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaRespiratorioCardiovascular.cansacoFacil || '' : fichaClinica.sistemaRespiratorioCardiovascular.cansacoFacil}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaRespiratorioCardiovascular: { ...prev.sistemaRespiratorioCardiovascular, cansacoFacil: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Síncope</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaRespiratorioCardiovascular.sincope || '' : fichaClinica.sistemaRespiratorioCardiovascular.sincope}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaRespiratorioCardiovascular: { ...prev.sistemaRespiratorioCardiovascular, sincope: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emagrecimento</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaRespiratorioCardiovascular.emagrecimento || '' : fichaClinica.sistemaRespiratorioCardiovascular.emagrecimento}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaRespiratorioCardiovascular: { ...prev.sistemaRespiratorioCardiovascular, emagrecimento: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Sistema Gênito Urinário */}
            <div className="bg-pink-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Sistema Gênito Urinário e Glândulas Mamárias</h4>
              <p className="text-sm text-gray-600 mb-4">
                (ingestão hídrica, urina, último cio, último parto, secreção vaginal ou peniana, castração)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ingestão Hídrica</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaGenitoUrinario.ingestaoHidrica || '' : fichaClinica.sistemaGenitoUrinario.ingestaoHidrica}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaGenitoUrinario: { ...prev.sistemaGenitoUrinario, ingestaoHidrica: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urina</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaGenitoUrinario.urina || '' : fichaClinica.sistemaGenitoUrinario.urina}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaGenitoUrinario: { ...prev.sistemaGenitoUrinario, urina: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Último Cio</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaGenitoUrinario.ultimoCio || '' : fichaClinica.sistemaGenitoUrinario.ultimoCio}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaGenitoUrinario: { ...prev.sistemaGenitoUrinario, ultimoCio: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Último Parto</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaGenitoUrinario.ultimoParto || '' : fichaClinica.sistemaGenitoUrinario.ultimoParto}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaGenitoUrinario: { ...prev.sistemaGenitoUrinario, ultimoParto: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secreção Vaginal ou Peniana</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaGenitoUrinario.secrecaoVaginalPeniana || '' : fichaClinica.sistemaGenitoUrinario.secrecaoVaginalPeniana}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaGenitoUrinario: { ...prev.sistemaGenitoUrinario, secrecaoVaginalPeniana: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Castração</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaGenitoUrinario.castracao || '' : fichaClinica.sistemaGenitoUrinario.castracao}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaGenitoUrinario: { ...prev.sistemaGenitoUrinario, castracao: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Sistema Tegumentar */}
            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Sistema Tegumentar</h4>
              <p className="text-sm text-gray-600 mb-4">
                (início da lesão e evolução, histórico, prurido, localização, características, pele e pêlos, secreção otológica, meneios cefálicos, banhos)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Início da Lesão</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaTegumentar.inicioLesao || '' : fichaClinica.sistemaTegumentar.inicioLesao}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaTegumentar: { ...prev.sistemaTegumentar, inicioLesao: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Evolução da Lesão</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaTegumentar.evolucaoLesao || '' : fichaClinica.sistemaTegumentar.evolucaoLesao}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaTegumentar: { ...prev.sistemaTegumentar, evolucaoLesao: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Histórico</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaTegumentar.historico || '' : fichaClinica.sistemaTegumentar.historico}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaTegumentar: { ...prev.sistemaTegumentar, historico: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prurido</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaTegumentar.prurido || '' : fichaClinica.sistemaTegumentar.prurido}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaTegumentar: { ...prev.sistemaTegumentar, prurido: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaTegumentar.localizacao || '' : fichaClinica.sistemaTegumentar.localizacao}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaTegumentar: { ...prev.sistemaTegumentar, localizacao: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Características</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaTegumentar.caracteristicas || '' : fichaClinica.sistemaTegumentar.caracteristicas}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaTegumentar: { ...prev.sistemaTegumentar, caracteristicas: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pele e Pêlos</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaTegumentar.pelePelos || '' : fichaClinica.sistemaTegumentar.pelePelos}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaTegumentar: { ...prev.sistemaTegumentar, pelePelos: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secreção Otológica</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaTegumentar.secrecaoOtologica || '' : fichaClinica.sistemaTegumentar.secrecaoOtologica}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaTegumentar: { ...prev.sistemaTegumentar, secrecaoOtologica: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meneios Cefálicos</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaTegumentar.meneiosCefalicos || '' : fichaClinica.sistemaTegumentar.meneiosCefalicos}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaTegumentar: { ...prev.sistemaTegumentar, meneiosCefalicos: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banhos</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaTegumentar.banhos || '' : fichaClinica.sistemaTegumentar.banhos}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaTegumentar: { ...prev.sistemaTegumentar, banhos: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Sistema Nervoso */}
            <div className="bg-violet-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Sistema Nervoso</h4>
              <p className="text-sm text-gray-600 mb-4">
                (estado mental, comportamento, ataxia, paresia, paralisia, convulsão, audição, visão, evolução)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado Mental</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaNervoso.estadoMental || '' : fichaClinica.sistemaNervoso.estadoMental}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaNervoso: { ...prev.sistemaNervoso, estadoMental: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comportamento</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaNervoso.comportamento || '' : fichaClinica.sistemaNervoso.comportamento}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaNervoso: { ...prev.sistemaNervoso, comportamento: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ataxia</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaNervoso.ataxia || '' : fichaClinica.sistemaNervoso.ataxia}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaNervoso: { ...prev.sistemaNervoso, ataxia: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paresia</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaNervoso.paresia || '' : fichaClinica.sistemaNervoso.paresia}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaNervoso: { ...prev.sistemaNervoso, paresia: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paralisia</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaNervoso.paralisia || '' : fichaClinica.sistemaNervoso.paralisia}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaNervoso: { ...prev.sistemaNervoso, paralisia: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Convulsão</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaNervoso.convulsao || '' : fichaClinica.sistemaNervoso.convulsao}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaNervoso: { ...prev.sistemaNervoso, convulsao: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audição</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaNervoso.audicao || '' : fichaClinica.sistemaNervoso.audicao}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaNervoso: { ...prev.sistemaNervoso, audicao: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visão</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaNervoso.visao || '' : fichaClinica.sistemaNervoso.visao}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaNervoso: { ...prev.sistemaNervoso, visao: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Evolução</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaNervoso.evolucao || '' : fichaClinica.sistemaNervoso.evolucao}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaNervoso: { ...prev.sistemaNervoso, evolucao: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Sistema Oftálmico */}
            <div className="bg-emerald-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Sistema Oftálmico</h4>
              <p className="text-sm text-gray-600 mb-4">
                (secreção ocular, blefaroespasmo)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secreção Ocular</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaOftalmico.secrecaoOcular || '' : fichaClinica.sistemaOftalmico.secrecaoOcular}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaOftalmico: { ...prev.sistemaOftalmico, secrecaoOcular: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blefaroespasmo</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaOftalmico.blefaroespasmo || '' : fichaClinica.sistemaOftalmico.blefaroespasmo}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaOftalmico: { ...prev.sistemaOftalmico, blefaroespasmo: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Sistema Músculo-Esquelético */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Sistema Músculo-Esquelético</h4>
              <p className="text-sm text-gray-600 mb-4">
                (claudicação, postura, fraturas, atrofia muscular)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Claudicação</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaMusculoEsqueletico.claudicacao || '' : fichaClinica.sistemaMusculoEsqueletico.claudicacao}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaMusculoEsqueletico: { ...prev.sistemaMusculoEsqueletico, claudicacao: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postura</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaMusculoEsqueletico.postura || '' : fichaClinica.sistemaMusculoEsqueletico.postura}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaMusculoEsqueletico: { ...prev.sistemaMusculoEsqueletico, postura: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fraturas</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaMusculoEsqueletico.fraturas || '' : fichaClinica.sistemaMusculoEsqueletico.fraturas}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaMusculoEsqueletico: { ...prev.sistemaMusculoEsqueletico, fraturas: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Atrofia Muscular</label>
                  <textarea
                    value={isEditing ? editedFicha?.sistemaMusculoEsqueletico.atrofiaMuscular || '' : fichaClinica.sistemaMusculoEsqueletico.atrofiaMuscular}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      sistemaMusculoEsqueletico: { ...prev.sistemaMusculoEsqueletico, atrofiaMuscular: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Exame Físico */}
            <div className="bg-teal-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Exame Físico</h4>

              {/* Vital Signs Table */}
              <div className="mb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">FC</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.exameFisico.fc || '' : fichaClinica.exameFisico.fc}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        exameFisico: { ...prev.exameFisico, fc: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">FR</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.exameFisico.fr || '' : fichaClinica.exameFisico.fr}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        exameFisico: { ...prev.exameFisico, fr: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MI</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.exameFisico.mi || '' : fichaClinica.exameFisico.mi}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        exameFisico: { ...prev.exameFisico, mi: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">T° C</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.exameFisico.temperatura || '' : fichaClinica.exameFisico.temperatura}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        exameFisico: { ...prev.exameFisico, temperatura: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hidratação</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.exameFisico.hidratacao || '' : fichaClinica.exameFisico.hidratacao}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        exameFisico: { ...prev.exameFisico, hidratacao: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Linfonodos</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.exameFisico.linfonodos || '' : fichaClinica.exameFisico.linfonodos}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        exameFisico: { ...prev.exameFisico, linfonodos: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mucosas</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.exameFisico.mucosas || '' : fichaClinica.exameFisico.mucosas}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        exameFisico: { ...prev.exameFisico, mucosas: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">TPC</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.exameFisico.tpc || '' : fichaClinica.exameFisico.tpc}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        exameFisico: { ...prev.exameFisico, tpc: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pulso</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.exameFisico.pulso || '' : fichaClinica.exameFisico.pulso}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        exameFisico: { ...prev.exameFisico, pulso: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inspeção Geral</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.exameFisico.inspecaoGeral || '' : fichaClinica.exameFisico.inspecaoGeral}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        exameFisico: { ...prev.exameFisico, inspecaoGeral: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pêlos e Pele</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.exameFisico.pelosPele || '' : fichaClinica.exameFisico.pelosPele}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        exameFisico: { ...prev.exameFisico, pelosPele: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado Nutricional</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.exameFisico.estadoNutricional || '' : fichaClinica.exameFisico.estadoNutricional}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        exameFisico: { ...prev.exameFisico, estadoNutricional: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Palpação</label>
                  <textarea
                    value={isEditing ? editedFicha?.exameFisico.palpacao || '' : fichaClinica.exameFisico.palpacao}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      exameFisico: { ...prev.exameFisico, palpacao: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Auscultação Cardio-pulmonar</label>
                  <textarea
                    value={isEditing ? editedFicha?.exameFisico.auscultacaoCardioPulmonar || '' : fichaClinica.exameFisico.auscultacaoCardioPulmonar}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      exameFisico: { ...prev.exameFisico, auscultacaoCardioPulmonar: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Percussão</label>
                  <textarea
                    value={isEditing ? editedFicha?.exameFisico.percussao || '' : fichaClinica.exameFisico.percussao}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      exameFisico: { ...prev.exameFisico, percussao: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações Complementares</label>
                  <textarea
                    value={isEditing ? editedFicha?.exameFisico.observacoesComplementares || '' : fichaClinica.exameFisico.observacoesComplementares}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      exameFisico: { ...prev.exameFisico, observacoesComplementares: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Diagnóstico/Procedimento */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Diagnóstico/Procedimento</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
                  <textarea
                    value={isEditing ? editedFicha?.diagnosticoProcedimento.diagnostico || '' : fichaClinica.diagnosticoProcedimento.diagnostico}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      diagnosticoProcedimento: { ...prev.diagnosticoProcedimento, diagnostico: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sistema Afetado</label>
                  <input
                    type="text"
                    value={isEditing ? editedFicha?.diagnosticoProcedimento.sistemaAfetado || '' : fichaClinica.diagnosticoProcedimento.sistemaAfetado}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      diagnosticoProcedimento: { ...prev.diagnosticoProcedimento, sistemaAfetado: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isEditing ? editedFicha?.diagnosticoProcedimento.internado.marcado || false : fichaClinica.diagnosticoProcedimento.internado.marcado}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        diagnosticoProcedimento: {
                          ...prev.diagnosticoProcedimento,
                          internado: { ...prev.diagnosticoProcedimento.internado, marcado: e.target.checked }
                        }
                      } : null)}
                      disabled={!isEditing}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">Internado</label>
                    <input
                      type="date"
                      value={isEditing ? editedFicha?.diagnosticoProcedimento.internado.data || '' : fichaClinica.diagnosticoProcedimento.internado.data}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        diagnosticoProcedimento: {
                          ...prev.diagnosticoProcedimento,
                          internado: { ...prev.diagnosticoProcedimento.internado, data: e.target.value }
                        }
                      } : null)}
                      disabled={!isEditing}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isEditing ? editedFicha?.diagnosticoProcedimento.tratamentoDomiciliar.marcado || false : fichaClinica.diagnosticoProcedimento.tratamentoDomiciliar.marcado}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        diagnosticoProcedimento: {
                          ...prev.diagnosticoProcedimento,
                          tratamentoDomiciliar: { ...prev.diagnosticoProcedimento.tratamentoDomiciliar, marcado: e.target.checked }
                        }
                      } : null)}
                      disabled={!isEditing}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">Tratamento domiciliar</label>
                    <input
                      type="date"
                      value={isEditing ? editedFicha?.diagnosticoProcedimento.tratamentoDomiciliar.data || '' : fichaClinica.diagnosticoProcedimento.tratamentoDomiciliar.data}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        diagnosticoProcedimento: {
                          ...prev.diagnosticoProcedimento,
                          tratamentoDomiciliar: { ...prev.diagnosticoProcedimento.tratamentoDomiciliar, data: e.target.value }
                        }
                      } : null)}
                      disabled={!isEditing}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isEditing ? editedFicha?.diagnosticoProcedimento.eutanasia.marcado || false : fichaClinica.diagnosticoProcedimento.eutanasia.marcado}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        diagnosticoProcedimento: {
                          ...prev.diagnosticoProcedimento,
                          eutanasia: { ...prev.diagnosticoProcedimento.eutanasia, marcado: e.target.checked }
                        }
                      } : null)}
                      disabled={!isEditing}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">Eutanásia</label>
                    <input
                      type="date"
                      value={isEditing ? editedFicha?.diagnosticoProcedimento.eutanasia.data || '' : fichaClinica.diagnosticoProcedimento.eutanasia.data}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        diagnosticoProcedimento: {
                          ...prev.diagnosticoProcedimento,
                          eutanasia: { ...prev.diagnosticoProcedimento.eutanasia, data: e.target.value }
                        }
                      } : null)}
                      disabled={!isEditing}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alta</label>
                    <input
                      type="date"
                      value={isEditing ? editedFicha?.diagnosticoProcedimento.alta || '' : fichaClinica.diagnosticoProcedimento.alta}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        diagnosticoProcedimento: { ...prev.diagnosticoProcedimento, alta: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.diagnosticoProcedimento.responsavel || '' : fichaClinica.diagnosticoProcedimento.responsavel}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        diagnosticoProcedimento: { ...prev.diagnosticoProcedimento, responsavel: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Óbito - Data</label>
                    <input
                      type="date"
                      value={isEditing ? editedFicha?.diagnosticoProcedimento.obito.data || '' : fichaClinica.diagnosticoProcedimento.obito.data}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        diagnosticoProcedimento: {
                          ...prev.diagnosticoProcedimento,
                          obito: { ...prev.diagnosticoProcedimento.obito, data: e.target.value }
                        }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Óbito - Hora</label>
                    <input
                      type="time"
                      value={isEditing ? editedFicha?.diagnosticoProcedimento.obito.hora || '' : fichaClinica.diagnosticoProcedimento.obito.hora}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        diagnosticoProcedimento: {
                          ...prev.diagnosticoProcedimento,
                          obito: { ...prev.diagnosticoProcedimento.obito, hora: e.target.value }
                        }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dados do Veterinário */}
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Médico Veterinário</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={isEditing ? editedFicha?.dadosVeterinario.nome || '' : fichaClinica.dadosVeterinario.nome}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      dadosVeterinario: { ...prev.dadosVeterinario, nome: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assinatura</label>
                  <input
                    type="text"
                    value={isEditing ? editedFicha?.dadosVeterinario.assinatura || '' : fichaClinica.dadosVeterinario.assinatura}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      dadosVeterinario: { ...prev.dadosVeterinario, assinatura: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Diagnósticos Diferenciais */}
            <div className="bg-rose-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Diagnósticos Diferenciais</h4>
              <div>
                <textarea
                  value={isEditing ? editedFicha?.diagnosticosDiferenciais.diagnosticos || '' : fichaClinica.diagnosticosDiferenciais.diagnosticos}
                  onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                    ...prev,
                    diagnosticosDiferenciais: { ...prev.diagnosticosDiferenciais, diagnosticos: e.target.value }
                  } : null)}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Exame por Imagem */}
            <div className="bg-sky-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Exame por Imagem</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isEditing ? editedFicha?.examePorImagem.rx || false : fichaClinica.examePorImagem.rx}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        examePorImagem: { ...prev.examePorImagem, rx: e.target.checked }
                      } : null)}
                      disabled={!isEditing}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">RX</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isEditing ? editedFicha?.examePorImagem.us || false : fichaClinica.examePorImagem.us}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        examePorImagem: { ...prev.examePorImagem, us: e.target.checked }
                      } : null)}
                      disabled={!isEditing}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">US</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isEditing ? editedFicha?.examePorImagem.tomografia || false : fichaClinica.examePorImagem.tomografia}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        examePorImagem: { ...prev.examePorImagem, tomografia: e.target.checked }
                      } : null)}
                      disabled={!isEditing}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Tomografia</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Região a ser examinada</label>
                  <input
                    type="text"
                    value={isEditing ? editedFicha?.examePorImagem.regiaoExaminada || '' : fichaClinica.examePorImagem.regiaoExaminada}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      examePorImagem: { ...prev.examePorImagem, regiaoExaminada: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nº da radiografia</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.examePorImagem.numeroRadiografia || '' : fichaClinica.examePorImagem.numeroRadiografia}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        examePorImagem: { ...prev.examePorImagem, numeroRadiografia: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                    <input
                      type="text"
                      value={isEditing ? editedFicha?.examePorImagem.quantidade || '' : fichaClinica.examePorImagem.quantidade}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        examePorImagem: { ...prev.examePorImagem, quantidade: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <input
                      type="date"
                      value={isEditing ? editedFicha?.examePorImagem.data || '' : fichaClinica.examePorImagem.data}
                      onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                        ...prev,
                        examePorImagem: { ...prev.examePorImagem, data: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tratamento */}
            <div className="bg-lime-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Tratamento</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prescrição</label>
                  <textarea
                    value={isEditing ? editedFicha?.tratamento.prescricao || '' : fichaClinica.tratamento.prescricao}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      tratamento: { ...prev.tratamento, prescricao: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Retorno</label>
                  <input
                    type="text"
                    value={isEditing ? editedFicha?.tratamento.retorno || '' : fichaClinica.tratamento.retorno}
                    onChange={(e) => isEditing && setEditedFicha(prev => prev ? {
                      ...prev,
                      tratamento: { ...prev.tratamento, retorno: e.target.value }
                    } : null)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Informações da Ficha */}
            <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-600">
              <p><strong>ID:</strong> {fichaClinica.id}</p>
              <p><strong>Criada em:</strong> {new Date(fichaClinica.createdAt).toLocaleString('pt-BR')}</p>
              <p><strong>Atualizada em:</strong> {new Date(fichaClinica.updatedAt).toLocaleString('pt-BR')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FichaClinicaComponent;
