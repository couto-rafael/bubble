import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Trophy, 
  Info, 
  Share2, 
  Heart,
  Edit,
  Plus,
  Search,
  UserPlus,
  X,
  Check
} from 'lucide-react';
import Navbar from '../components/Navbar';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

interface Tournament {
  id: string;
  name: string;
  club: string;
  location: {
    city: string;
    state: string;
  };
  startDate: string;
  endDate: string;
  status: 'open' | 'closed' | 'in-progress' | 'completed';
  participantsCount: number;
  sport: string;
  registrationFee: number;
  description: string;
  categories: string[];
  club_id?: string;
}

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (player1: string, player2: string, category: string) => void;
  categories: string[];
}

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({ isOpen, onClose, onAdd, categories }) => {
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (player1.trim() && player2.trim() && selectedCategory) {
      onAdd(player1.trim(), player2.trim(), selectedCategory);
      setPlayer1('');
      setPlayer2('');
      setSelectedCategory('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Adicionar Dupla</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jogador 1
            </label>
            <input
              type="text"
              value={player1}
              onChange={(e) => setPlayer1(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Nome do primeiro jogador"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jogador 2
            </label>
            <input
              type="text"
              value={player2}
              onChange={(e) => setPlayer2(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Nome do segundo jogador"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TournamentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [activeTab, setActiveTab] = useState('informacoes');
  const [activeSubTab, setActiveSubTab] = useState('gerais');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'open' | 'paused'>('open');

  // Check if current user is the tournament owner
  const isOwner = tournament && profile && (
    tournament.club_id === profile.id || 
    (profile.user_type === 'club' && tournament.club === (profile.fantasy_name || profile.club_name))
  );

  useEffect(() => {
    if (id) {
      // Load tournament from localStorage
      const clubTournaments = JSON.parse(localStorage.getItem('clubTournaments') || '[]');
      const foundTournament = clubTournaments.find((t: any) => String(t.id) === String(id));
      
      if (foundTournament) {
        setTournament({
          ...foundTournament,
          sport: foundTournament.sport || 'Padel',
          registrationFee: foundTournament.registrationFee || 0,
          description: foundTournament.description || '',
          categories: foundTournament.categories || []
        });
        
        // Set initial registration status based on tournament status
        setRegistrationStatus(foundTournament.status === 'open' ? 'open' : 'paused');
      }
    }

    // Handle URL parameters
    const tab = searchParams.get('tab');
    const subTab = searchParams.get('sub');
    
    if (tab) setActiveTab(tab);
    if (subTab) setActiveSubTab(subTab);
  }, [id, searchParams]);

  const handleAddPlayer = (player1: string, player2: string, category: string) => {
    // Here you would typically save to backend/localStorage
    console.log('Adding players:', { player1, player2, category });
    // For now, just show success message
    alert(`Dupla ${player1} & ${player2} adicionada à categoria ${category}`);
  };

  const handleEditTournament = () => {
    navigate(`/edit-tournament/${id}`);
  };

  const toggleRegistrationStatus = () => {
    const newStatus = registrationStatus === 'open' ? 'paused' : 'open';
    setRegistrationStatus(newStatus);
    
    // Update tournament status in localStorage
    if (tournament) {
      const clubTournaments = JSON.parse(localStorage.getItem('clubTournaments') || '[]');
      const updatedTournaments = clubTournaments.map((t: any) => 
        String(t.id) === String(id) 
          ? { ...t, status: newStatus === 'open' ? 'open' : 'closed' }
          : t
      );
      localStorage.setItem('clubTournaments', JSON.stringify(updatedTournaments));
      
      // Update local state
      setTournament(prev => prev ? { ...prev, status: newStatus === 'open' ? 'open' : 'closed' } : null);
    }
  };

  if (!tournament) {
    return (
      <div className="min-h-screen bg-light">
        {user ? <DashboardHeader /> : <Navbar />}
        <div className="pt-16 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-dark-800 mb-2">Torneio não encontrado</h2>
            <p className="text-dark-600">O torneio que você está procurando não existe.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const mockPlayers = [
    { id: 1, name: 'João Silva', partner: 'Pedro Santos', city: 'São Paulo, SP', confirmed: true },
    { id: 2, name: 'Carlos Lima', partner: 'Rafael Dias', city: 'Belo Horizonte, MG', confirmed: false },
    { id: 3, name: 'Ana Costa', partner: 'Maria Santos', city: 'Rio de Janeiro, RJ', confirmed: true },
  ];

  const filteredPlayers = mockPlayers.filter(player => 
    !searchTerm || 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.partner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-light">
      {user ? <DashboardHeader /> : <Navbar />}
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-dark-900 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-start">
            <div className="text-white">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-4xl md:text-5xl font-black">{tournament.name}</h1>
                {isOwner && (
                  <button
                    onClick={handleEditTournament}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <Edit size={18} />
                    Editar
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-lg">
                <div className="flex items-center">
                  <Trophy size={20} className="mr-2" />
                  {tournament.club}
                </div>
                <div className="flex items-center">
                  <MapPin size={20} className="mr-2" />
                  {tournament.location.city}, {tournament.location.state}
                </div>
                <div className="flex items-center">
                  <Calendar size={20} className="mr-2" />
                  {new Date(tournament.startDate).toLocaleDateString('pt-BR')} - {new Date(tournament.endDate).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center">
                  <Users size={20} className="mr-2" />
                  {tournament.participantsCount} inscritos
                </div>
              </div>

              {/* Registration Status - Only visible to owner */}
              {isOwner && (
                <div className="mt-4">
                  <button
                    onClick={toggleRegistrationStatus}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      registrationStatus === 'open'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                  >
                    {registrationStatus === 'open' ? 'Inscrições Abertas' : 'Inscrições Pausadas'}
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-lg transition-all">
                <Heart size={24} />
              </button>
              <button className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-lg transition-all">
                <Share2 size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'informacoes', label: 'Informações', icon: Info },
              { id: 'inscritos', label: 'Inscritos', icon: Users },
              { id: 'grupos', label: 'Grupos', icon: Trophy },
              { id: 'jogos', label: 'Jogos', icon: Calendar },
              { id: 'resultados', label: 'Resultados', icon: Trophy },
              { id: 'ao-vivo', label: 'Ao Vivo', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'inscritos' && (
          <div className="space-y-6">
            {/* Search and Category Filter */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search - Reduced width when owner */}
                <div className={`relative ${isOwner ? 'flex-1' : 'flex-1'}`}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por nome do atleta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Category Filter */}
                <div className="md:w-64">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Todas as Categorias</option>
                    {tournament.categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Add Player Button - Only for owner */}
                {isOwner && (
                  <button
                    onClick={() => setShowAddPlayerModal(true)}
                    className="bg-gradient-to-r from-primary-900 to-primary-700 text-white px-6 py-3 rounded-lg hover:from-primary-800 hover:to-primary-600 transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus size={18} />
                    Adicionar Dupla
                  </button>
                )}
              </div>
            </div>

            {/* Players List */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-dark-900">
                  {selectedCategory || 'Todas as Categorias'}
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredPlayers.map((player, index) => (
                  <div key={player.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary-100 text-primary-700 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div>
                          <h3 className="font-semibold text-dark-900">{player.name}</h3>
                          <p className="text-sm text-gray-600">{player.city}</p>
                        </div>
                      </div>
                      <div className="text-gray-400">+</div>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div>
                          <h3 className="font-semibold text-dark-900">{player.partner}</h3>
                          <p className="text-sm text-gray-600">Rio de Janeiro, RJ</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {player.confirmed ? (
                        <span className="flex items-center text-green-600 text-sm font-medium">
                          <Check size={16} className="mr-1" />
                          Confirmado
                        </span>
                      ) : (
                        <span className="text-yellow-600 text-sm font-medium">
                          Aguardando Pagamento
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'informacoes' && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-dark-900 mb-6">Informações do Torneio</h2>
            <div className="prose max-w-none">
              <p className="text-dark-600 leading-relaxed">
                {tournament.description || 'Descrição do torneio não disponível.'}
              </p>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-dark-900 mb-2">Detalhes</h3>
                  <ul className="space-y-2 text-dark-600">
                    <li><strong>Esporte:</strong> {tournament.sport}</li>
                    <li><strong>Taxa de Inscrição:</strong> R$ {tournament.registrationFee.toFixed(2)}</li>
                    <li><strong>Categorias:</strong> {tournament.categories.length}</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-dark-900 mb-2">Categorias</h3>
                  <div className="flex flex-wrap gap-2">
                    {tournament.categories.map((category) => (
                      <span
                        key={category}
                        className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab !== 'inscritos' && activeTab !== 'informacoes' && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <p className="text-dark-600">Conteúdo em desenvolvimento...</p>
          </div>
        )}
      </div>

      <Footer />

      {/* Add Player Modal */}
      <AddPlayerModal
        isOpen={showAddPlayerModal}
        onClose={() => setShowAddPlayerModal(false)}
        onAdd={handleAddPlayer}
        categories={tournament.categories}
      />
    </div>
  );
};

export default TournamentDetail;