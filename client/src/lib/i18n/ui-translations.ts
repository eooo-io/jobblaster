import { LanguageCode } from "../types/language";

export interface UITranslations {
  // Menu Items
  dashboard: string;
  coverLetters: string;
  applications: string;
  jobAnalysis: string;
  matchScoring: string;
  exportPackage: string;
  connectors: string;
  aiPromptTemplates: string;
  assignedTemplates: string;
  externalApiLogs: string;

  // User Section
  profile: string;
  profileSettings: string;
  personalAccount: string;
  personalWorkspace: string;
  logout: string;

  // System Tools Section
  systemTools: string;
  soon: string;

  // App Settings Section
  appSettings: string;

  // Common Actions
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  create: string;
  download: string;
  preview: string;
  print: string;
  search: string;
  filter: string;
  sort: string;
  apply: string;
  clear: string;

  // Dashboard Content
  resumeBuilder: string;
  buildAndMatchResumes: string;
  uploadResume: string;
  findPerfectMatch: string;
  noResumeSelected: string;
  pleaseSelectResume: string;
  createNewResume: string;
  recentResumes: string;
  noResumesYet: string;
  startByCreating: string;
  lastModified: string;
  printPreview: string;
  resumeActions: string;
  uploadNewResume: string;
  dragAndDrop: string;
  or: string;
  browseFiles: string;
  supportedFormats: string;

  // Job Search
  jobSearch: string;
  searchJobsDescription: string;
  jobTitle: string;
  searchJobsPlaceholder: string;
  location: string;
  locationPlaceholder: string;
  minSalary: string;
  minSalaryPlaceholder: string;
  maxSalary: string;
  maxSalaryPlaceholder: string;
  searching: string;
  searchResults: string;
  foundJobs: string;
  viewJob: string;
  importing: string;
  import: string;
  loadMore: string;

  // Print Preview
  readyToPrint: string;
  selectResumeLanguage: string;
  selectPaperFormat: string;
  paperFormatA4: string;
  paperFormatLegal: string;

  // App Settings
  appLanguage: string;
  appTheme: string;
}

const enUS: UITranslations = {
  // Menu Items
  dashboard: "Dashboard",
  coverLetters: "Cover Letters",
  applications: "Applications",
  jobAnalysis: "Job Analysis",
  matchScoring: "Match Scoring",
  exportPackage: "Export Package",
  connectors: "Connectors",
  aiPromptTemplates: "AI Prompt Templates",
  assignedTemplates: "Assigned Templates",
  externalApiLogs: "External API Logs",

  // User Section
  profile: "Profile",
  profileSettings: "Profile Settings",
  personalAccount: "Personal Account",
  personalWorkspace: "Personal Workspace",
  logout: "Logout",

  // System Tools Section
  systemTools: "System Tools",
  soon: "Soon",

  // App Settings Section
  appSettings: "App Settings",

  // Common Actions
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  edit: "Edit",
  create: "Create",
  download: "Download",
  preview: "Preview",
  print: "Print",
  search: "Search",
  filter: "Filter",
  sort: "Sort",
  apply: "Apply",
  clear: "Clear",

  // Dashboard Content
  resumeBuilder: "Resume Builder",
  buildAndMatchResumes: "Build & match resumes",
  uploadResume: "Upload Resume",
  findPerfectMatch: "Upload your resume and find the perfect job match",
  noResumeSelected: "No Resume Selected",
  pleaseSelectResume: "Please select a resume first to preview!",
  createNewResume: "Create New Resume",
  recentResumes: "Recent Resumes",
  noResumesYet: "No resumes yet",
  startByCreating: "Start by creating your first resume",
  lastModified: "Last modified",
  printPreview: "Print Preview",
  resumeActions: "Resume Actions",
  uploadNewResume: "Upload New Resume",
  dragAndDrop: "Drag and drop your resume here",
  or: "or",
  browseFiles: "Browse Files",
  supportedFormats: "Supported formats: PDF, DOCX, TXT",

  // Job Search
  jobSearch: "Job Search",
  searchJobsDescription: "Search for jobs that match your skills and experience",
  jobTitle: "Job Title",
  searchJobsPlaceholder: "Enter job title or keywords",
  location: "Location",
  locationPlaceholder: "Enter city, state, or remote",
  minSalary: "Minimum Salary",
  minSalaryPlaceholder: "Enter minimum salary",
  maxSalary: "Maximum Salary",
  maxSalaryPlaceholder: "Enter maximum salary",
  searching: "Searching...",
  searchResults: "Search Results",
  foundJobs: "Found {count} matching jobs",
  viewJob: "View Job",
  importing: "Importing...",
  import: "Import",
  loadMore: "Load More",

  // Print Preview
  readyToPrint: "Ready to print",
  selectResumeLanguage: "Select Resume Language",
  selectPaperFormat: "Select Paper Format",
  paperFormatA4: "A4 (210mm × 297mm)",
  paperFormatLegal: 'US Legal (8.5" × 14")',

  // App Settings
  appLanguage: "App Language",
  appTheme: "App Theme",
};

const deDE: UITranslations = {
  // Menu Items
  dashboard: "Dashboard",
  coverLetters: "Anschreiben",
  applications: "Bewerbungen",
  jobAnalysis: "Stellenanalyse",
  matchScoring: "Match-Bewertung",
  exportPackage: "Export-Paket",
  connectors: "Konnektoren",
  aiPromptTemplates: "KI-Prompt-Vorlagen",
  assignedTemplates: "Zugewiesene Vorlagen",
  externalApiLogs: "Externe API-Protokolle",

  // User Section
  profile: "Profil",
  profileSettings: "Profileinstellungen",
  personalAccount: "Persönliches Konto",
  personalWorkspace: "Persönlicher Arbeitsbereich",
  logout: "Abmelden",

  // System Tools Section
  systemTools: "Systemwerkzeuge",
  soon: "Bald",

  // App Settings Section
  appSettings: "App-Einstellungen",

  // Common Actions
  save: "Speichern",
  cancel: "Abbrechen",
  delete: "Löschen",
  edit: "Bearbeiten",
  create: "Erstellen",
  download: "Herunterladen",
  preview: "Vorschau",
  print: "Drucken",
  search: "Suchen",
  filter: "Filtern",
  sort: "Sortieren",
  apply: "Anwenden",
  clear: "Löschen",

  // Dashboard Content
  resumeBuilder: "Lebenslauf-Builder",
  buildAndMatchResumes: "Lebensläufe erstellen & abgleichen",
  uploadResume: "Lebenslauf hochladen",
  findPerfectMatch: "Laden Sie Ihren Lebenslauf hoch und finden Sie die perfekte Stelle",
  noResumeSelected: "Kein Lebenslauf ausgewählt",
  pleaseSelectResume: "Bitte wählen Sie zuerst einen Lebenslauf aus!",
  createNewResume: "Neuen Lebenslauf erstellen",
  recentResumes: "Aktuelle Lebensläufe",
  noResumesYet: "Noch keine Lebensläufe",
  startByCreating: "Erstellen Sie Ihren ersten Lebenslauf",
  lastModified: "Zuletzt geändert",
  printPreview: "Druckvorschau",
  resumeActions: "Lebenslauf-Aktionen",
  uploadNewResume: "Neuen Lebenslauf hochladen",
  dragAndDrop: "Ziehen Sie Ihren Lebenslauf hierher",
  or: "oder",
  browseFiles: "Dateien durchsuchen",
  supportedFormats: "Unterstützte Formate: PDF, DOCX, TXT",

  // Job Search
  jobSearch: "Jobsuche",
  searchJobsDescription: "Suchen Sie nach Jobs, die zu Ihren Fähigkeiten und Erfahrungen passen",
  jobTitle: "Jobtitel",
  searchJobsPlaceholder: "Jobtitel oder Stichwörter eingeben",
  location: "Standort",
  locationPlaceholder: "Stadt, Bundesland oder Remote eingeben",
  minSalary: "Mindestgehalt",
  minSalaryPlaceholder: "Mindestgehalt eingeben",
  maxSalary: "Maximalgehalt",
  maxSalaryPlaceholder: "Maximalgehalt eingeben",
  searching: "Suche...",
  searchResults: "Suchergebnisse",
  foundJobs: "{count} passende Jobs gefunden",
  viewJob: "Job ansehen",
  importing: "Importiere...",
  import: "Importieren",
  loadMore: "Mehr laden",

  // Print Preview
  readyToPrint: "Bereit zum Drucken",
  selectResumeLanguage: "Lebenslauf-Sprache wählen",
  selectPaperFormat: "Papierformat wählen",
  paperFormatA4: "A4 (210mm × 297mm)",
  paperFormatLegal: 'US Legal (8,5" × 14")',

  // App Settings
  appLanguage: "App-Sprache",
  appTheme: "App-Design",
};

const frFR: UITranslations = {
  // Menu Items
  dashboard: "Tableau de bord",
  coverLetters: "Lettres de motivation",
  applications: "Candidatures",
  jobAnalysis: "Analyse d'emploi",
  matchScoring: "Score de correspondance",
  exportPackage: "Package d'exportation",
  connectors: "Connecteurs",
  aiPromptTemplates: "Modèles d'invite IA",
  assignedTemplates: "Modèles assignés",
  externalApiLogs: "Logs API externes",

  // User Section
  profile: "Profil",
  profileSettings: "Paramètres du profil",
  personalAccount: "Compte personnel",
  personalWorkspace: "Espace de travail personnel",
  logout: "Déconnexion",

  // System Tools Section
  systemTools: "Outils système",
  soon: "Bientôt",

  // App Settings Section
  appSettings: "Paramètres de l'application",

  // Common Actions
  save: "Enregistrer",
  cancel: "Annuler",
  delete: "Supprimer",
  edit: "Modifier",
  create: "Créer",
  download: "Télécharger",
  preview: "Aperçu",
  print: "Imprimer",
  search: "Rechercher",
  filter: "Filtrer",
  sort: "Trier",
  apply: "Appliquer",
  clear: "Effacer",

  // Dashboard Content
  resumeBuilder: "Créateur de CV",
  buildAndMatchResumes: "Creez et trouvez des correspondances",
  uploadResume: "Télécharger un CV",
  findPerfectMatch: "Téléchargez votre CV et trouvez le poste parfait",
  noResumeSelected: "Aucun CV sélectionné",
  pleaseSelectResume: "Veuillez d'abord sélectionner un CV !",
  createNewResume: "Créer un nouveau CV",
  recentResumes: "CV récents",
  noResumesYet: "Pas encore de CV",
  startByCreating: "Commencez par créer votre premier CV",
  lastModified: "Dernière modification",
  printPreview: "Aperçu avant impression",
  resumeActions: "Actions sur le CV",
  uploadNewResume: "Télécharger un nouveau CV",
  dragAndDrop: "Glissez-déposez votre CV ici",
  or: "ou",
  browseFiles: "Parcourir les fichiers",
  supportedFormats: "Formats supportés : PDF, DOCX, TXT",

  // Job Search
  jobSearch: "Recherche d'emploi",
  searchJobsDescription: "Recherchez des emplois correspondant à vos compétences et expérience",
  jobTitle: "Titre du poste",
  searchJobsPlaceholder: "Entrez le titre ou des mots-clés",
  location: "Localisation",
  locationPlaceholder: "Ville, région ou télétravail",
  minSalary: "Salaire minimum",
  minSalaryPlaceholder: "Entrez le salaire minimum",
  maxSalary: "Salaire maximum",
  maxSalaryPlaceholder: "Entrez le salaire maximum",
  searching: "Recherche en cours...",
  searchResults: "Résultats de recherche",
  foundJobs: "{count} emplois trouvés",
  viewJob: "Voir l'offre",
  importing: "Importation...",
  import: "Importer",
  loadMore: "Charger plus",

  // Print Preview
  readyToPrint: "Prêt à imprimer",
  selectResumeLanguage: "Sélectionner la langue du CV",
  selectPaperFormat: "Sélectionner le format du papier",
  paperFormatA4: "A4 (210mm × 297mm)",
  paperFormatLegal: 'US Legal (8,5" × 14")',

  // App Settings
  appLanguage: "Langue de l'application",
  appTheme: "Thème de l'application",
};

const esES: UITranslations = {
  // Menu Items
  dashboard: "Panel de control",
  coverLetters: "Cartas de presentación",
  applications: "Solicitudes",
  jobAnalysis: "Análisis de trabajo",
  matchScoring: "Puntuación de coincidencia",
  exportPackage: "Paquete de exportación",
  connectors: "Conectores",
  aiPromptTemplates: "Plantillas de IA",
  assignedTemplates: "Plantillas asignadas",
  externalApiLogs: "Registros de API externos",

  // User Section
  profile: "Perfil",
  profileSettings: "Configuración del perfil",
  personalAccount: "Cuenta personal",
  personalWorkspace: "Espacio de trabajo personal",
  logout: "Cerrar sesión",

  // System Tools Section
  systemTools: "Herramientas del sistema",
  soon: "Próximamente",

  // App Settings Section
  appSettings: "Configuración de la aplicación",

  // Common Actions
  save: "Guardar",
  cancel: "Cancelar",
  delete: "Eliminar",
  edit: "Editar",
  create: "Crear",
  download: "Descargar",
  preview: "Vista previa",
  print: "Imprimir",
  search: "Buscar",
  filter: "Filtrar",
  sort: "Ordenar",
  apply: "Aplicar",
  clear: "Limpiar",

  // Dashboard Content
  resumeBuilder: "Constructor de CV",
  buildAndMatchResumes: "Crea y encuentra coincidencias",
  uploadResume: "Subir CV",
  findPerfectMatch: "Sube tu CV y encuentra el trabajo perfecto",
  noResumeSelected: "Ningún CV seleccionado",
  pleaseSelectResume: "¡Por favor, selecciona primero un CV!",
  createNewResume: "Crear nuevo CV",
  recentResumes: "CV recientes",
  noResumesYet: "Aún no hay CV",
  startByCreating: "Comienza creando tu primer CV",
  lastModified: "Última modificación",
  printPreview: "Vista previa de impresión",
  resumeActions: "Acciones de CV",
  uploadNewResume: "Subir nuevo CV",
  dragAndDrop: "Arrastra y suelta tu CV aquí",
  or: "o",
  browseFiles: "Explorar archivos",
  supportedFormats: "Formatos soportados: PDF, DOCX, TXT",

  // Job Search
  jobSearch: "Búsqueda de empleo",
  searchJobsDescription: "Busca empleos que coincidan con tus habilidades y experiencia",
  jobTitle: "Título del puesto",
  searchJobsPlaceholder: "Introduce título o palabras clave",
  location: "Ubicación",
  locationPlaceholder: "Ciudad, región o remoto",
  minSalary: "Salario mínimo",
  minSalaryPlaceholder: "Introduce salario mínimo",
  maxSalary: "Salario máximo",
  maxSalaryPlaceholder: "Introduce salario máximo",
  searching: "Buscando...",
  searchResults: "Resultados de búsqueda",
  foundJobs: "{count} empleos encontrados",
  viewJob: "Ver empleo",
  importing: "Importando...",
  import: "Importar",
  loadMore: "Cargar más",

  // Print Preview
  readyToPrint: "Listo para imprimir",
  selectResumeLanguage: "Seleccionar idioma del CV",
  selectPaperFormat: "Seleccionar formato de papel",
  paperFormatA4: "A4 (210mm × 297mm)",
  paperFormatLegal: 'US Legal (8,5" × 14")',

  // App Settings
  appLanguage: "Idioma de la aplicación",
  appTheme: "Tema de la aplicación",
};

const itIT: UITranslations = {
  // Menu Items
  dashboard: "Dashboard",
  coverLetters: "Lettere di presentazione",
  applications: "Candidature",
  jobAnalysis: "Analisi del lavoro",
  matchScoring: "Punteggio di corrispondenza",
  exportPackage: "Pacchetto di esportazione",
  connectors: "Connettori",
  aiPromptTemplates: "Modelli di prompt IA",
  assignedTemplates: "Modelli assegnati",
  externalApiLogs: "Log API esterni",

  // User Section
  profile: "Profilo",
  profileSettings: "Impostazioni profilo",
  personalAccount: "Account personale",
  personalWorkspace: "Spazio di lavoro personale",
  logout: "Disconnetti",

  // System Tools Section
  systemTools: "Strumenti di sistema",
  soon: "Presto",

  // App Settings Section
  appSettings: "Impostazioni dell'applicazione",

  // Common Actions
  save: "Salva",
  cancel: "Annulla",
  delete: "Elimina",
  edit: "Modifica",
  create: "Crea",
  download: "Scarica",
  preview: "Anteprima",
  print: "Stampa",
  search: "Cerca",
  filter: "Filtra",
  sort: "Ordina",
  apply: "Applica",
  clear: "Cancella",

  // Dashboard Content
  resumeBuilder: "Creatore di Curriculum",
  buildAndMatchResumes: "Crea e trova corrispondenze",
  uploadResume: "Carica Curriculum",
  findPerfectMatch: "Carica il tuo curriculum e trova il lavoro perfetto",
  noResumeSelected: "Nessun curriculum selezionato",
  pleaseSelectResume: "Seleziona prima un curriculum!",
  createNewResume: "Crea nuovo curriculum",
  recentResumes: "Curriculum recenti",
  noResumesYet: "Ancora nessun curriculum",
  startByCreating: "Inizia creando il tuo primo curriculum",
  lastModified: "Ultima modifica",
  printPreview: "Anteprima di stampa",
  resumeActions: "Azioni curriculum",
  uploadNewResume: "Carica nuovo curriculum",
  dragAndDrop: "Trascina qui il tuo curriculum",
  or: "o",
  browseFiles: "Sfoglia file",
  supportedFormats: "Formati supportati: PDF, DOCX, TXT",

  // Job Search
  jobSearch: "Ricerca lavoro",
  searchJobsDescription: "Cerca lavori che corrispondono alle tue competenze ed esperienze",
  jobTitle: "Titolo del lavoro",
  searchJobsPlaceholder: "Inserisci titolo o parole chiave",
  location: "Località",
  locationPlaceholder: "Città, regione o remoto",
  minSalary: "Stipendio minimo",
  minSalaryPlaceholder: "Inserisci stipendio minimo",
  maxSalary: "Stipendio massimo",
  maxSalaryPlaceholder: "Inserisci stipendio massimo",
  searching: "Ricerca in corso...",
  searchResults: "Risultati della ricerca",
  foundJobs: "{count} lavori trovati",
  viewJob: "Visualizza lavoro",
  importing: "Importazione...",
  import: "Importa",
  loadMore: "Carica altro",

  // Print Preview
  readyToPrint: "Pronto per la stampa",
  selectResumeLanguage: "Seleziona lingua del CV",
  selectPaperFormat: "Seleziona formato carta",
  paperFormatA4: "A4 (210mm × 297mm)",
  paperFormatLegal: 'US Legal (8,5" × 14")',

  // App Settings
  appLanguage: "Lingua dell'app",
  appTheme: "Tema dell'app",
};

const ptPT: UITranslations = {
  // Menu Items
  dashboard: "Painel",
  coverLetters: "Cartas de apresentação",
  applications: "Candidaturas",
  jobAnalysis: "Análise de emprego",
  matchScoring: "Pontuação de correspondência",
  exportPackage: "Pacote de exportação",
  connectors: "Conectores",
  aiPromptTemplates: "Modelos de IA",
  assignedTemplates: "Modelos atribuídos",
  externalApiLogs: "Registos de API externos",

  // User Section
  profile: "Perfil",
  profileSettings: "Configurações de perfil",
  personalAccount: "Conta pessoal",
  personalWorkspace: "Espaço de trabalho pessoal",
  logout: "Sair",

  // System Tools Section
  systemTools: "Ferramentas do sistema",
  soon: "Em breve",

  // App Settings Section
  appSettings: "Configurações da aplicação",

  // Common Actions
  save: "Guardar",
  cancel: "Cancelar",
  delete: "Eliminar",
  edit: "Editar",
  create: "Criar",
  download: "Descarregar",
  preview: "Pré-visualizar",
  print: "Imprimir",
  search: "Pesquisar",
  filter: "Filtrar",
  sort: "Ordenar",
  apply: "Aplicar",
  clear: "Limpar",

  // Dashboard Content
  resumeBuilder: "Criador de Currículo",
  buildAndMatchResumes: "Crie e encontre correspondências",
  uploadResume: "Carregar Currículo",
  findPerfectMatch: "Carregue o seu currículo e encontre o emprego perfeito",
  noResumeSelected: "Nenhum currículo selecionado",
  pleaseSelectResume: "Por favor, selecione primeiro um currículo!",
  createNewResume: "Criar novo currículo",
  recentResumes: "Currículos recentes",
  noResumesYet: "Ainda não há currículos",
  startByCreating: "Comece por criar o seu primeiro currículo",
  lastModified: "Última modificação",
  printPreview: "Pré-visualização de impressão",
  resumeActions: "Ações do currículo",
  uploadNewResume: "Carregar novo currículo",
  dragAndDrop: "Arraste e solte o seu currículo aqui",
  or: "ou",
  browseFiles: "Procurar ficheiros",
  supportedFormats: "Formatos suportados: PDF, DOCX, TXT",

  // Job Search
  jobSearch: "Procura de emprego",
  searchJobsDescription: "Procure empregos que correspondam às suas competências e experiência",
  jobTitle: "Título do emprego",
  searchJobsPlaceholder: "Introduza título ou palavras-chave",
  location: "Localização",
  locationPlaceholder: "Cidade, região ou remoto",
  minSalary: "Salário mínimo",
  minSalaryPlaceholder: "Introduza salário mínimo",
  maxSalary: "Salário máximo",
  maxSalaryPlaceholder: "Introduza salário máximo",
  searching: "A pesquisar...",
  searchResults: "Resultados da pesquisa",
  foundJobs: "{count} empregos encontrados",
  viewJob: "Ver emprego",
  importing: "A importar...",
  import: "Importar",
  loadMore: "Carregar mais",

  // Print Preview
  readyToPrint: "Pronto para imprimir",
  selectResumeLanguage: "Selecionar idioma do CV",
  selectPaperFormat: "Selecionar formato do papel",
  paperFormatA4: "A4 (210mm × 297mm)",
  paperFormatLegal: 'US Legal (8,5" × 14")',

  // App Settings
  appLanguage: "Idioma da aplicação",
  appTheme: "Tema da aplicação",
};

export const uiTranslations: Record<LanguageCode, UITranslations> = {
  en: enUS,
  de: deDE,
  fr: frFR,
  es: esES,
  it: itIT,
  pt: ptPT,
  ru: enUS, // Fallback to English for now
  zh: enUS, // Fallback to English for now
  ja: enUS, // Fallback to English for now
  ko: enUS, // Fallback to English for now
};
