import type { Perfil, Usuario, Mandatario, Filiado, Orgao, Dirigente, LogAcesso } from '../types';

// ── Perfis ────────────────────────────────────────────────────────────────────
export const MOCK_PERFIS: Perfil[] = [
  { id: 1, nome: 'Administrador Nacional', situacao: 'Ativo', identificador1doc: 'admin_nacional', cadastradoEm: '01/01/2024, 08:00:00' },
  { id: 2, nome: 'Administrador Estadual', situacao: 'Ativo', identificador1doc: 'admin_estadual', cadastradoEm: '01/01/2024, 08:00:00' },
  { id: 3, nome: 'Operador Municipal', situacao: 'Ativo', identificador1doc: 'operador_municipal', cadastradoEm: '10/02/2024, 09:30:00' },
  { id: 4, nome: 'Consultor Estadual', situacao: 'Ativo', identificador1doc: 'consultor_estadual', cadastradoEm: '15/03/2024, 10:00:00' },
  { id: 5, nome: 'Consultor Municipal', situacao: 'Inativo', identificador1doc: 'consultor_municipal', cadastradoEm: '20/04/2024, 11:00:00' },
  { id: 6, nome: 'Visualizador', situacao: 'Ativo', cadastradoEm: '05/05/2024, 14:00:00' },
];

// ── Usuários ──────────────────────────────────────────────────────────────────
export const MOCK_USUARIOS: Usuario[] = [
  { id: 1, nome: 'Inacio Steffen', login: 'inacio.steffen@mdb.org.br', tipoAcesso: 'Nacional', situacao: 'Ativo', perfis: ['Administrador Nacional'], ultimoAcesso: '17/06/2026, 14:42:17', cadastradoEm: '01/01/2024, 08:00:00', ultimaAlteracao: '10/06/2026, 09:00:00' },
  { id: 2, nome: 'Maria Aparecida Silva', login: 'maria.silva@mdb.org.br', tipoAcesso: 'Estadual', uf: 'SP', situacao: 'Ativo', perfis: ['Administrador Estadual', 'Operador Municipal'], ultimoAcesso: '17/06/2026, 10:15:00', cadastradoEm: '15/02/2024, 09:00:00', ultimaAlteracao: '01/06/2026, 08:30:00' },
  { id: 3, nome: 'Carlos Eduardo Santos', login: 'carlos.santos@mdb.org.br', tipoAcesso: 'Municipal', uf: 'RS', municipio: 'Porto Alegre', situacao: 'Ativo', perfis: ['Operador Municipal'], ultimoAcesso: '16/06/2026, 16:40:00', cadastradoEm: '20/03/2024, 11:00:00' },
  { id: 4, nome: 'Ana Paula Ferreira', login: 'ana.ferreira@mdb.org.br', tipoAcesso: 'Estadual', uf: 'MG', situacao: 'Inativo', perfis: ['Consultor Estadual'], ultimoAcesso: '10/06/2026, 08:00:00', cadastradoEm: '01/04/2024, 10:00:00' },
  { id: 5, nome: 'Roberto Oliveira', login: 'roberto.oliveira@mdb.org.br', tipoAcesso: 'Nacional', situacao: 'Ativo', perfis: ['Visualizador'], ultimoAcesso: '17/06/2026, 12:00:00', cadastradoEm: '10/05/2024, 14:00:00' },
];

// ── Mandatários ───────────────────────────────────────────────────────────────
export const MOCK_MANDATARIOS: Mandatario[] = [
  {
    id: 1, nome: 'Abdias Francisco Dos Santos Neto', nomeUrna: 'Abdias Francisco',
    cargo: 'Vereador', anoEleicao: 2024, situacao: 'Eleito Por Qp',
    uf: 'PI', municipio: 'Passagem Franca Do Piauí', eleito: 'Sim', totalVotos: 214,
    cpf: '06*******01', tituloEleitor: '00*********20',
    zonaVotacao: '015', anoPrecandidatura: 2024,
    dataNascimento: '15/03/1975', idade: 51, sexo: 'Masculino',
    escolaridade: 'Superior Completo', raca: 'Parda', profissao: 'Comerciante',
    nacionalidade: 'Brasileira', naturalidade: 'Passagem Franca Do Piauí / PI',
    dataFiliacao: '01/04/2019', situacaoFiliacao: 'Regular',
    endereco: 'Rua das Flores', numero: '142', bairro: 'Centro', cep: '64595-000',
    email: 'abdias.francisco@email.com', celular: '(86) 99811-2345', telefone: '(86) 3240-1100',
    historicoCargos: [
      { cargo: 'Vereador', anoEleicao: 2024, situacao: 'Eleito Por Qp', totalVotos: 214, eleito: 'Sim', uf: 'PI', municipio: 'Passagem Franca Do Piauí' },
      { cargo: 'Vereador', anoEleicao: 2020, situacao: 'Eleito Por Qp', totalVotos: 189, eleito: 'Sim', uf: 'PI', municipio: 'Passagem Franca Do Piauí' },
      { cargo: 'Vereador', anoEleicao: 2016, situacao: 'Não Eleito', totalVotos: 97, eleito: 'Não', uf: 'PI', municipio: 'Passagem Franca Do Piauí' },
    ],
    historicoOrgaos: [
      { cargo: 'Presidente Municipal', dataInicio: '01/09/2021', dataFim: '31/07/2025', abrangencia: 'Municipal', municipio: 'Passagem Franca Do Piauí', uf: 'PI' },
      { cargo: 'Membro Titular Do Diretório Municipal', dataInicio: '01/09/2017', dataFim: '31/08/2021', abrangencia: 'Municipal', municipio: 'Passagem Franca Do Piauí', uf: 'PI' },
    ],
  },
  { id: 2, nome: 'Abdoral De Sousa Mourao', nomeUrna: 'Abdoral Mourao', cargo: 'Vereador', anoEleicao: 2024, situacao: 'Eleito Por Qp', uf: 'PI', municipio: 'Aroazes', eleito: 'Sim', totalVotos: 287 },
  { id: 3, nome: 'Abel Ferreira Soares', nomeUrna: 'Abel Ferreira', cargo: 'Vereador', anoEleicao: 2024, situacao: 'Eleito Por Qp', uf: 'AM', municipio: 'Juruá', eleito: 'Sim', totalVotos: 305 },
  { id: 4, nome: 'Abel Gilnei Biazzi Dornelles', nomeUrna: 'Abel Dornelles', cargo: 'Vereador', anoEleicao: 2024, situacao: 'Eleito Por Qp', uf: 'RS', municipio: 'Vitória Das Missões', eleito: 'Sim', totalVotos: 204 },
  { id: 5, nome: 'Abel Hartmann', nomeUrna: 'Abel Hartmann', cargo: 'Vereador', anoEleicao: 2024, situacao: 'Eleito Por Qp', uf: 'RS', municipio: 'Cândido Godói', eleito: 'Sim', totalVotos: 339 },
  { id: 6, nome: 'Abel Neves De Freitas', nomeUrna: 'Abel Neves', cargo: 'Vereador', anoEleicao: 2024, situacao: 'Eleito Por Média', uf: 'MG', municipio: 'Dores De Campos', eleito: 'Sim', totalVotos: 405 },
  { id: 7, nome: 'Abel Primieri', nomeUrna: 'Abel Primieri', cargo: 'Vereador', anoEleicao: 2024, situacao: 'Eleito Por Qp', uf: 'RS', municipio: 'Barracão', eleito: 'Sim', totalVotos: 233 },
  { id: 8, nome: 'Abelardo Da Rocha Prado Neto', nomeUrna: 'Abelardo Prado', cargo: 'Vereador', anoEleicao: 2024, situacao: 'Eleito Por Qp', uf: 'AL', municipio: 'Porto Calvo', eleito: 'Sim', totalVotos: 1256 },
  { id: 9, nome: 'Abenilton Silva De Oliveira', nomeUrna: 'Abenilton Silva', cargo: 'Vereador', anoEleicao: 2024, situacao: 'Eleito Por Qp', uf: 'BA', municipio: 'Boa Nova', eleito: 'Sim', totalVotos: 516 },
  { id: 10, nome: 'Abercilio Machado De Oliveira', nomeUrna: 'Abercilio Oliveira', cargo: 'Vice-Prefeito', anoEleicao: 2024, situacao: 'Eleito', uf: 'ES', municipio: 'Irupi', eleito: 'Sim', totalVotos: 0 },
  { id: 11, nome: 'Adailton Pereira Lima', nomeUrna: 'Adailton Lima', cargo: 'Prefeito', anoEleicao: 2024, situacao: 'Eleito', uf: 'BA', municipio: 'Igrapiúna', eleito: 'Sim', totalVotos: 4823 },
  { id: 12, nome: 'Adalberto Cruz Ramos', nomeUrna: 'Adalberto Ramos', cargo: 'Vereador', anoEleicao: 2024, situacao: 'Eleito Por Qp', uf: 'PA', municipio: 'Santarém', eleito: 'Sim', totalVotos: 892 },
];

// ── Filiados ──────────────────────────────────────────────────────────────────
export const MOCK_FILIADOS: Filiado[] = [
  { id: 1, nomeFiliado: 'Abidoral Vieira De Sousa', nomeUrna: 'Abidoral Sousa', profissao: 'APOSENTADO', cpf: '67*******49', situacao: 'Regular', dataFiliacao: '05/10/2007', sexo: 'Masculino', raca: 'Parda', cargoPartido: 'Membro Titular', uf: 'PI', municipio: 'Passagem Franca Do Piauí', idade: 67 },
  { id: 2, nomeFiliado: 'Abraao De Assis Abreu', nomeUrna: 'Abraao Abreu', profissao: 'APOSENTADO', cpf: '68*******72', situacao: 'Regular', dataFiliacao: '29/09/2011', sexo: 'Masculino', raca: 'Parda', cargoPartido: 'Presidente Municipal', uf: 'PI', municipio: 'Aroazes', idade: 72 },
  { id: 3, nomeFiliado: 'Acacio Lunelli', nomeUrna: 'Acacio Lunelli', profissao: 'NAO INFORMADA', cpf: '86*******49', situacao: 'Regular', dataFiliacao: '20/08/1999', sexo: 'Masculino', raca: 'Branca', cargoPartido: 'Membro Titular', uf: 'AM', municipio: 'Juruá', idade: 58 },
  { id: 4, nomeFiliado: 'Acrivaldo Lima Da Silva', nomeUrna: 'Acrivaldo Silva', profissao: 'NAO INFORMADA', cpf: '69*******53', situacao: 'Regular', mandatarioAtual: 'Não', dataFiliacao: '15/10/2019', sexo: 'Masculino', raca: 'Branca', cargoPartido: 'Secretário Municipal', uf: 'RS', municipio: 'Vitória Das Missões', idade: 45 },
  { id: 5, nomeFiliado: 'Adao Conceicao Dornelles Faraco', nomeUrna: 'Adao Faraco', profissao: 'NAO INFORMADA', cpf: '03*******87', situacao: 'Regular', dataFiliacao: '15/08/1980', sexo: 'Masculino', raca: 'Branca', cargoPartido: 'Membro Titular', uf: 'RS', municipio: 'Cândido Godói', idade: 76 },
  { id: 6, nomeFiliado: 'Adao Marcelo Alves De Carvalho', nomeUrna: 'Adao Carvalho', profissao: 'MOTORISTA DE CAMINHAO (ROTAS REGIONAIS E INTERNACIONAIS)', cpf: '52*******68', situacao: 'Regular', dataFiliacao: '15/03/2024', sexo: 'Masculino', raca: 'Parda', cargoPartido: 'Membro Titular', uf: 'MG', municipio: 'Dores De Campos', idade: 35 },
  { id: 7, nomeFiliado: 'Adcarliton Valente Barreto', nomeUrna: 'Adcarliton Barreto', profissao: 'NAO INFORMADA', cpf: '22*******91', situacao: 'Regular', dataFiliacao: '30/09/2019', sexo: 'Masculino', raca: 'Parda', cargoPartido: 'Tesoureiro Municipal', uf: 'RS', municipio: 'Barracão', idade: 42 },
  { id: 8, nomeFiliado: 'Adelar Medeiros Pereira', nomeUrna: 'Adelar Pereira', profissao: 'NAO INFORMADA', cpf: '66*******91', situacao: 'Regular', mandatarioAtual: 'Não', dataFiliacao: '03/04/2024', sexo: 'Masculino', raca: 'Preta', cargoPartido: 'Membro Titular', uf: 'AL', municipio: 'Porto Calvo', idade: 53 },
  { id: 9, nomeFiliado: 'Adelar Pereira', nomeUrna: 'Adelar Pereira', profissao: 'NAO INFORMADA', cpf: '04*******58', situacao: 'Regular', mandatarioAtual: 'Sim', dataFiliacao: '03/04/2020', sexo: 'Masculino', raca: 'Parda', cargoPartido: 'Presidente Municipal', uf: 'BA', municipio: 'Boa Nova', idade: 48 },
  { id: 10, nomeFiliado: 'Adelario Furtado', nomeUrna: 'Adelario Furtado', profissao: 'NAO INFORMADA', cpf: '80*******72', situacao: 'Regular', dataFiliacao: '15/09/2001', sexo: 'Masculino', raca: 'Parda', cargoPartido: 'Membro Titular', uf: 'ES', municipio: 'Irupi', idade: 62 },
  { id: 11, nomeFiliado: 'Adelcio Ferreira Ramos', nomeUrna: 'Adelcio Ramos', profissao: 'AGRICULTOR', cpf: '91*******34', situacao: 'Regular', dataFiliacao: '20/02/2015', sexo: 'Masculino', raca: 'Parda', cargoPartido: 'Secretário Municipal', uf: 'BA', municipio: 'Igrapiúna', idade: 50 },
  { id: 12, nomeFiliado: 'Adenildo Costa Barbosa', nomeUrna: 'Adenildo Barbosa', profissao: 'COMERCIANTE', cpf: '45*******88', situacao: 'Excluído', dataFiliacao: '10/07/2010', sexo: 'Masculino', raca: 'Preta', cargoPartido: 'Membro Titular', uf: 'PA', municipio: 'Santarém', idade: 57 },
];

// ── Órgãos ────────────────────────────────────────────────────────────────────
export const MOCK_ORGAOS: Orgao[] = [
  { id: 1, tipoOrgao: 'Órgão definitivo', uf: 'SP', municipio: '', inicioVigencia: '01/09/2023', fimVigencia: '15/03/2027', situacoes: 'Anotado;', situacaoVigencia: 'Vigente', cnpj: '45.302.874/0001-31', celular: '(11) 3050-0830', abrangencia: 'Estadual', bairro: 'Centro', endereco: 'Av. Paulista', numero: '1000', cep: '01310-100', email: 'sp@mdb.org.br' },
  { id: 2, tipoOrgao: 'Órgão definitivo', uf: 'SP', municipio: 'Agudos', inicioVigencia: '01/09/2025', fimVigencia: '31/07/2027', situacoes: 'Anotado;', situacaoVigencia: 'Vigente', cnpj: '01.423.627/0001-18', celular: '(14) 99671-1115', abrangencia: 'Municipal' },
  { id: 3, tipoOrgao: 'Órgão definitivo', uf: 'SP', municipio: 'Altair', inicioVigencia: '01/09/2025', fimVigencia: '31/07/2027', situacoes: 'Restabelecido;', situacaoVigencia: 'Vigente', cnpj: '06.252.484/0001-42', celular: '(17) 99713-7051', abrangencia: 'Municipal' },
  { id: 4, tipoOrgao: 'Órgão definitivo', uf: 'SP', municipio: 'Altinópolis', inicioVigencia: '01/09/2025', fimVigencia: '31/07/2027', situacoes: 'Anotado;', situacaoVigencia: 'Vigente', cnpj: '03.824.152/0001-05', celular: '(16) 99229-6470', abrangencia: 'Municipal' },
  { id: 5, tipoOrgao: 'Órgão provisório', uf: 'SP', municipio: 'Alumínio', inicioVigencia: '04/05/2026', fimVigencia: '30/10/2026', situacoes: 'Anotado;', situacaoVigencia: 'Vigente', cnpj: '58.993.734/0001-07', celular: '(11) 98887-0354', abrangencia: 'Municipal' },
  { id: 6, tipoOrgao: 'Órgão definitivo', uf: 'SP', municipio: 'Amparo', inicioVigencia: '20/08/2025', fimVigencia: '31/07/2027', situacoes: 'Anotado;', situacaoVigencia: 'Vigente', cnpj: '58.383.415/0001-71', celular: '(19) 99635-1021', abrangencia: 'Municipal' },
  { id: 7, tipoOrgao: 'Órgão definitivo', uf: 'SP', municipio: 'Analândia', inicioVigencia: '01/09/2025', fimVigencia: '31/07/2027', situacoes: 'Anotado;', situacaoVigencia: 'Vigente', cnpj: '08.474.982/0001-65', celular: '(19) 99706-1289', abrangencia: 'Municipal' },
  { id: 8, tipoOrgao: 'Órgão definitivo', uf: 'SP', municipio: 'Andradina', inicioVigencia: '01/09/2025', fimVigencia: '31/07/2027', situacoes: 'Anotado;', situacaoVigencia: 'Vigente', cnpj: '51.103.539/0001-07', celular: '(18) 99741-1415', abrangencia: 'Municipal' },
  { id: 9, tipoOrgao: 'Órgão provisório', uf: 'SP', municipio: 'Aparecida', inicioVigencia: '25/03/2026', fimVigencia: '30/09/2026', situacoes: 'Suspenso por falta de prestação de contas;', situacaoVigencia: 'Vigente', cnpj: '15.449.933/0001-38', celular: '(12) 99726-4663', abrangencia: 'Municipal' },
  { id: 10, tipoOrgao: 'Órgão definitivo', uf: 'SP', municipio: 'Aramina', inicioVigencia: '01/09/2025', fimVigencia: '31/07/2027', situacoes: 'Anotado;', situacaoVigencia: 'Vigente', cnpj: '50.733.195/0001-57', celular: '(16) 99984-0006', abrangencia: 'Municipal' },
  { id: 11, tipoOrgao: 'Órgão definitivo', uf: 'RS', municipio: 'Porto Alegre', inicioVigencia: '01/09/2023', fimVigencia: '31/07/2027', situacoes: 'Anotado;', situacaoVigencia: 'Vigente', cnpj: '04.514.550/0001-80', celular: '(51) 99001-2345', abrangencia: 'Estadual' },
  { id: 12, tipoOrgao: 'Órgão definitivo', uf: 'RS', municipio: 'Caxias do Sul', inicioVigencia: '01/09/2025', fimVigencia: '31/07/2027', situacoes: 'Anotado;', situacaoVigencia: 'Vigente', cnpj: '12.345.678/0001-99', celular: '(54) 98765-4321', abrangencia: 'Municipal' },
];

// ── Dirigentes ────────────────────────────────────────────────────────────────
export const MOCK_DIRIGENTES: Dirigente[] = [
  { id: 1, tipoOrgao: 'Órgão provisório', abrangenciaOrgao: 'Municipal', ufOrgao: 'GO', municipioOrgao: 'Palminópolis', nomeDirigente: 'Abel Sardinha De Sa', cpfDirigente: '02*******34', cargoDirigente: 'Membro Da Comissão Provisória Municipal', dataInicioExercicio: '10/04/2025', dataFimExercicio: '25/01/2027', respAdm: 'Não', tituloEleitor: '012*****0140', genero: 'Masculino' },
  { id: 2, tipoOrgao: 'Órgão definitivo', abrangenciaOrgao: 'Municipal', ufOrgao: 'SC', municipioOrgao: 'São João Do Itaperiú', nomeDirigente: 'Abelino Anacleto De Souza', cpfDirigente: '68*******53', cargoDirigente: 'Suplentes Do Conselho Fiscal Municipal', dataInicioExercicio: '19/05/2025', dataFimExercicio: '19/05/2027', respAdm: 'Não', tituloEleitor: '034*****2180', genero: 'Masculino' },
  { id: 3, tipoOrgao: 'Órgão definitivo', abrangenciaOrgao: 'Municipal', ufOrgao: 'GO', municipioOrgao: 'Iporá', nomeDirigente: 'Abeni Bernardina Da Silva', cpfDirigente: '78*******20', cargoDirigente: 'Membro Titular Do Diretório Municipal', dataInicioExercicio: '19/01/2026', dataFimExercicio: '19/01/2028', respAdm: 'Não', tituloEleitor: '055*****3920', genero: 'Feminino' },
  { id: 4, tipoOrgao: 'Órgão definitivo', abrangenciaOrgao: 'Municipal', ufOrgao: 'GO', municipioOrgao: 'Piracanjuba', nomeDirigente: 'Abigail Benedito Pinheiro', cpfDirigente: '02*******15', cargoDirigente: 'Membro Titular Do Diretório Municipal', dataInicioExercicio: '08/01/2024', dataFimExercicio: '08/01/2027', respAdm: 'Não', tituloEleitor: '078*****4110', genero: 'Feminino' },
  { id: 5, tipoOrgao: 'Órgão definitivo', abrangenciaOrgao: 'Municipal', ufOrgao: 'SC', municipioOrgao: 'São Francisco Do Sul', nomeDirigente: 'Abimael Espindula', cpfDirigente: '33*******49', cargoDirigente: 'Membro Titular Do Diretório Municipal', dataInicioExercicio: '19/05/2025', dataFimExercicio: '19/05/2027', respAdm: 'Não', tituloEleitor: '091*****5670', genero: 'Masculino' },
  { id: 6, tipoOrgao: 'Órgão definitivo', abrangenciaOrgao: 'Municipal', ufOrgao: 'BA', municipioOrgao: 'Ibititá', nomeDirigente: 'Abinaias Marques Dourado Junior', cpfDirigente: '27*******04', cargoDirigente: 'Membro Titular Do Diretório Municipal', dataInicioExercicio: '16/07/2025', dataFimExercicio: '16/07/2027', respAdm: 'Não', tituloEleitor: '114*****6230', genero: 'Masculino' },
  { id: 7, tipoOrgao: 'Órgão definitivo', abrangenciaOrgao: 'Municipal', ufOrgao: 'MA', municipioOrgao: 'Itapecuru Mirim', nomeDirigente: 'Abraao Nunes Martins Neto', cpfDirigente: '33*******49', cargoDirigente: 'Delegado Da Convenção Estadual Suplente', dataInicioExercicio: '20/11/2025', dataFimExercicio: '14/11/2027', respAdm: 'Não', tituloEleitor: '137*****7890', genero: 'Masculino' },
  { id: 8, tipoOrgao: 'Órgão definitivo', abrangenciaOrgao: 'Municipal', ufOrgao: 'RO', municipioOrgao: 'São Francisco Do Guaporé', nomeDirigente: 'Abrao Paulino De Araujo', cpfDirigente: '33*******15', cargoDirigente: 'Delegado Da Convenção Estadual Titular', dataInicioExercicio: '08/12/2025', dataFimExercicio: '08/12/2027', respAdm: 'Não', tituloEleitor: '160*****8450', genero: 'Masculino' },
  { id: 9, tipoOrgao: 'Órgão definitivo', abrangenciaOrgao: 'Municipal', ufOrgao: 'SP', municipioOrgao: 'São Paulo', nomeDirigente: 'Acacio Nunes Costa', cpfDirigente: '11*******78', cargoDirigente: 'Presidente Municipal', dataInicioExercicio: '01/09/2025', dataFimExercicio: '31/07/2027', respAdm: 'Sim', respFinan: 'Sim', tituloEleitor: '183*****9010', genero: 'Masculino' },
  { id: 10, tipoOrgao: 'Órgão provisório', abrangenciaOrgao: 'Municipal', ufOrgao: 'TO', municipioOrgao: 'Palmas', nomeDirigente: 'Adalto Ferreira Paz', cpfDirigente: '55*******63', cargoDirigente: 'Membro Da Comissão Provisória Municipal', dataInicioExercicio: '12/03/2026', dataFimExercicio: '12/09/2026', respAdm: 'Não', tituloEleitor: '206*****0570', genero: 'Masculino' },
];

// ── Log de Acesso ─────────────────────────────────────────────────────────────
const browsers = ['Chrome 124 / Windows 10', 'Firefox 125 / Windows 11', 'Chrome 124 / macOS', 'Edge 124 / Windows 10', 'Safari 17 / macOS', 'Chrome 124 / Android'];
const ips = ['192.168.1.100', '10.0.0.45', '177.92.13.201', '189.40.55.10', '187.34.88.200', '200.20.30.40', '10.10.10.5'];
const usuarios = ['Inacio Steffen', 'Maria Aparecida Silva', 'Carlos Eduardo Santos', 'Roberto Oliveira', 'Ana Paula Ferreira'];

export const MOCK_LOG_ACESSO: LogAcesso[] = Array.from({ length: 314 }, (_, i) => ({
  id: i + 1,
  usuario: usuarios[i % usuarios.length],
  dataHoraAcesso: `${String(Math.floor(Math.random() * 17) + 1).padStart(2, '0')}/06/2026, ${String(Math.floor(Math.random() * 23)).padStart(2, '0')}:${String(Math.floor(Math.random() * 59)).padStart(2, '0')}:${String(Math.floor(Math.random() * 59)).padStart(2, '0')}`,
  ip: ips[i % ips.length],
  browser: browsers[i % browsers.length],
})).sort((a, b) => b.id - a.id);

// ── BI Data ───────────────────────────────────────────────────────────────────
export const BI_COBERTURA_UF = [
  { uf: 'SC', comPresidente: 273, total: 295, cobertura: 92.5, status: 'Ótimo', filiados: 280668 },
  { uf: 'ES', comPresidente: 72, total: 78, cobertura: 92.3, status: 'Ótimo', filiados: 58491 },
  { uf: 'AC', comPresidente: 20, total: 22, cobertura: 90.9, status: 'Ótimo', filiados: 14919 },
  { uf: 'GO', comPresidente: 218, total: 246, cobertura: 88.6, status: 'Bom', filiados: 204552 },
  { uf: 'TO', comPresidente: 123, total: 139, cobertura: 88.5, status: 'Bom', filiados: 54135 },
  { uf: 'RO', comPresidente: 45, total: 52, cobertura: 86.5, status: 'Bom', filiados: 31881 },
  { uf: 'RS', comPresidente: 398, total: 497, cobertura: 80.1, status: 'Bom', filiados: 357854 },
  { uf: 'PB', comPresidente: 166, total: 223, cobertura: 74.4, status: 'Regular', filiados: 89539 },
  { uf: 'MS', comPresidente: 51, total: 79, cobertura: 64.6, status: 'Regular', filiados: 71269 },
  { uf: 'AL', comPresidente: 59, total: 102, cobertura: 57.8, status: 'Regular', filiados: 29960 },
  { uf: 'SP', comPresidente: 313, total: 645, cobertura: 48.5, status: 'Regular', filiados: 646983 },
  { uf: 'RR', comPresidente: 7, total: 15, cobertura: 46.7, status: 'Regular', filiados: 6272 },
  { uf: 'MG', comPresidente: 367, total: 853, cobertura: 43.0, status: 'Regular', filiados: 310283 },
  { uf: 'MA', comPresidente: 93, total: 217, cobertura: 42.9, status: 'Regular', filiados: 82243 },
  { uf: 'PI', comPresidente: 95, total: 224, cobertura: 42.4, status: 'Regular', filiados: 66814 },
  { uf: 'PR', comPresidente: 165, total: 399, cobertura: 41.4, status: 'Regular', filiados: 257041 },
  { uf: 'PA', comPresidente: 53, total: 144, cobertura: 36.8, status: 'Regular', filiados: 111721 },
  { uf: 'AM', comPresidente: 18, total: 62, cobertura: 29.0, status: 'Regular', filiados: 28187 },
  { uf: 'MT', comPresidente: 36, total: 142, cobertura: 25.4, status: 'Regular', filiados: 69596 },
  { uf: 'RJ', comPresidente: 19, total: 92, cobertura: 20.7, status: 'Regular', filiados: 183616 },
  { uf: 'AP', comPresidente: 2, total: 16, cobertura: 12.5, status: 'Regular', filiados: 10839 },
  { uf: 'BA', comPresidente: 38, total: 417, cobertura: 9.1, status: 'Regular', filiados: 143807 },
  { uf: 'CE', comPresidente: 16, total: 184, cobertura: 8.7, status: 'Regular', filiados: 73003 },
  { uf: 'PE', comPresidente: 16, total: 184, cobertura: 8.7, status: 'Regular', filiados: 75632 },
  { uf: 'RN', comPresidente: 14, total: 167, cobertura: 8.4, status: 'Regular', filiados: 59365 },
  { uf: 'DF', comPresidente: 0, total: 1, cobertura: 0.0, status: 'Regular', filiados: 36749 },
  { uf: 'SE', comPresidente: 0, total: 75, cobertura: 0.0, status: 'Regular', filiados: 24522 },
];

// Organs per state for choropleth
export const BI_ORGAOS_POR_ESTADO: Record<string, number> = {
  RS: 399, MG: 365, SP: 313, SC: 273, GO: 217, PB: 166, PR: 164,
  TO: 123, PI: 95, MA: 94, ES: 72, AL: 59, BA: 417, PE: 184,
  CE: 184, RN: 167, MT: 142, PA: 144, AM: 62, MS: 79, RO: 52,
  RJ: 92, AC: 22, RR: 15, AP: 16, DF: 1, SE: 75,
};
