export type Page =
  | 'home'
  | 'bi'
  | 'mandatario'
  | 'filiacao'
  | 'orgao'
  | 'dirigente'
  | 'log-acesso'
  | 'perfil'
  | 'usuario'
  | 'gerenciar-filiados';

export type NavigateFn = (page: Page, id?: number) => void;

export interface PageProps {
  onNavigate: NavigateFn;
}

// ── Domain models ────────────────────────────────────────────────────────────

export interface Perfil {
  id: number;
  nome: string;
  situacao: 'Ativo' | 'Inativo';
  identificador1doc?: string;
  cadastradoEm: string;
}

export interface Usuario {
  id: number;
  nome: string;
  login: string;
  tipoAcesso: 'Nacional' | 'Estadual' | 'Municipal';
  uf?: string;
  municipio?: string;
  situacao: 'Ativo' | 'Inativo';
  perfis: string[];
  ultimoAcesso: string;
  cadastradoEm: string;
  ultimaAlteracao?: string;
}

export interface CargoPoliticoHistorico {
  cargo: string;
  anoEleicao: number;
  situacao: string;
  totalVotos: number;
  eleito: 'Sim' | 'Não';
  uf: string;
  municipio: string;
}

export interface CargoPartidarioHistorico {
  cargo: string;
  dataInicio: string;
  dataFim: string;
  abrangencia: string;
  municipio: string;
  uf: string;
}

export interface Mandatario {
  id: number;
  nome: string;
  nomeUrna: string;
  cargo: string;
  anoEleicao: number;
  situacao: string;
  uf: string;
  municipio: string;
  eleito: 'Sim' | 'Não';
  totalVotos: number;
  // Identificação
  cpf?: string;
  tituloEleitor?: string;
  zonaVotacao?: string;
  anoPrecandidatura?: number;
  dataNascimento?: string;
  idade?: number;
  sexo?: string;
  escolaridade?: string;
  raca?: string;
  profissao?: string;
  nacionalidade?: string;
  naturalidade?: string;
  // Filiação
  dataFiliacao?: string;
  dataDesfiliacao?: string;
  situacaoFiliacao?: string;
  // Endereço declarado na filiação
  endereco?: string;
  numero?: string;
  bairro?: string;
  cep?: string;
  // Contato
  email?: string;
  celular?: string;
  telefone?: string;
  // Foto
  foto?: string;
  // Históricos
  historicoCargos?: CargoPoliticoHistorico[];
  historicoOrgaos?: CargoPartidarioHistorico[];
}

export interface Filiado {
  id: number;
  nomeFiliado: string;
  nomeUrna?: string;
  profissao: string;
  cpf: string;
  situacao: 'Regular' | 'Excluído' | 'Transferido';
  mandatarioAtual?: string;
  dataFiliacao: string;
  sexo?: string;
  raca?: string;
  cargoPartido?: string;
  uf?: string;
  municipio?: string;
  idade?: number;
}

export interface Orgao {
  id: number;
  tipoOrgao: string;
  uf: string;
  municipio: string;
  inicioVigencia: string;
  fimVigencia: string;
  situacoes: string;
  situacaoVigencia: 'Vigente' | 'Encerrado';
  cnpj: string;
  celular: string;
  abrangencia: 'Municipal' | 'Estadual' | 'Nacional';
  bairro?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  cep?: string;
  email?: string;
}

export interface Dirigente {
  id: number;
  tipoOrgao: string;
  abrangenciaOrgao: string;
  ufOrgao: string;
  municipioOrgao: string;
  nomeDirigente: string;
  cpfDirigente: string;
  cargoDirigente: string;
  dataInicioExercicio: string;
  dataFimExercicio: string;
  respAdm: 'Sim' | 'Não';
  respFinan?: 'Sim' | 'Não';
  tituloEleitor?: string;
  genero?: string;
}

export interface LogAcesso {
  id: number;
  usuario: string;
  dataHoraAcesso: string;
  ip: string;
  browser: string;
}
