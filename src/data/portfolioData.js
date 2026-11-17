// ============================================================================
// ONO-SENDAI CYBERSPACE VII // TYRELL-84 — REAL PORTFOLIO DATA & LORE
// Engineer: Miqueias Henrique da Silva Carvalho (Goiânia - GO)
// ============================================================================

export const PROFILE_DATA = {
  name: 'Miqueias Carvalho',
  fullName: 'Miqueias Henrique da Silva Carvalho',
  modelCode: 'ONO-SENDAI VII // TYRELL VK-84',
  role: 'Desenvolvedor Backend Júnior · C# / .NET & SQL Server',
  location: 'Setor Goiânia · Brasil (LAT -16.6869 / LON -49.2648)',
  education: 'Bacharelado em Engenharia de Software · UNIFAN (Conclusão 2027)',
  currentJob: 'Estagiário de Desenvolvimento na Zetti (08/12/2025 – Atual)',
  summary:
    'Desenvolvedor de software focado em sustentação de sistemas críticos em produção, otimização de bancos de dados relacionais (SQL Server, PostgreSQL, MySQL) e construção de APIs REST escaláveis em C#/.NET, Java (Spring Boot) e Node.js (TypeScript/NestJS).',
  email: 'miqueiashenriquecarvalho@gmail.com',
  whatsapp: 'https://wa.me/5562984862849',
  phoneDisplay: '+55 (62) 98486-2849',
  linkedin: 'https://www.linkedin.com/in/miqueias-henrique-88503b218/',
  github: 'https://github.com/Miqueias-Henrique',
  cvPdf: './Curriculo_Miqueias_Carvalho.pdf',
  portrait: './assets/img/portrait-2.webp',
};

// Companion quotes (Rachel-7 / Wintermute Owl — reacts to user actions)
export const OWL_QUOTES = {
  uncalibrated:
    'SINAL ÓPTICO DESALINHADO: A íris na unidade Voight-Kampff está fora de foco. Pressione [PULSAR CALIBRAÇÃO] 3 vezes para estabilizar o retrato do engenheiro.',
  calibrated:
    'RETINA VALIDADA (EMPATIA 98.4%): Miqueias Carvalho confirmado como humano e engenheiro backend. Bancos SQL Server em produção na Zetti operando sem anomalias.',
  os_mode:
    'HOSAKA H-84 OS ATIVO: Você entrou na bancada multitarefa. Abra o Explorador de Cartuchos, execute queries no SQL Bench, ou filtre a foto no Esper PhotoLab.',
  editorial_mode:
    'MODO DOSSIÊ EDITORIAL: Leitura direta de engenharia. Insira qualquer fita ROM na baia ao lado para inspecionar arquitetura, código real e impacto.',
  titanium_upgrade:
    'CHASSI EVOLUÍDO → TITÂNIO ESCOVADO TYRELL: Você desbloqueou 6+ Selos de Empatia. A carcaça da estação foi refundida em liga metálica aeroespacial.',
  gold_upgrade:
    'CHASSI MÁXIMO → OURO 24K VILLA STRAYLIGHT: Todos os 12 Selos de Empatia conquistados! Núcleo Wintermute e Dixie Flatline destravados em capacidade total.',
  tips: [
    'DICA DE DECK: Clique nos pinos luminosos da Placa de Telemetria para inspecionar meses de commits e entregas reais.',
    'DICA VOIGHT-KAMPFF: No Duelo Kuang Mark XI, use "Stored Procedure Shield" antes do golpe pesado da IA Wintermute.',
    'DICA ESPER: Pressione Ctrl+K (ou clique em COMANDOS) para saltar instantaneamente para qualquer repositório ou ferramenta.',
    'HISTÓRICO ZETTI: Miqueias atua diariamente com queries, views, stored procedures em SQL Server e manutenção de regras fiscais em VB6.',
  ],
};

// ROM Cartridges (Like Felipe's "Caixa I, II, III" + real code & terminal simulation)
export const ROM_CARTRIDGES = [
  {
    id: 'zetti-prod',
    slot: 'FITA ROM I · PRODUÇÃO REAL',
    category: 'prod',
    title: 'Zetti Sistemas Farmacêuticos (SQL Server & VB6)',
    period: 'Dez/2025 – Atual · Em Produção',
    headline: 'Sustentação crítica e adequação fiscal para dezenas de farmácias em operação diária.',
    impact: 'Queries, Views e Stored Procedures em SQL Server + evolução para o novo CNPJ Alfanumérico e reforma tributária.',
    context:
      'Atuação diária como Estagiário de Desenvolvimento na Zetti, mantendo sistemas legados em Visual Basic 6 (VB6) integrados a bancos SQL Server de alta demanda no varejo farmacêutico.',
    engineering: [
      'Criação e otimização de queries complexas, views e stored procedures em SQL Server para relatórios e regras de negócio.',
      'Manutenção evolutiva e corretiva em módulos VB6 em produção, garantindo estabilidade em fechamentos fiscais.',
      'Adequação de esquemas de banco e validações para o novo formato de CNPJ Alfanumérico e novos cálculos de impostos.',
      'Fluxo de trabalho ágil com Git, GitKraken e Jira junto ao time de engenharia.',
    ],
    stack: ['SQL Server', 'T-SQL', 'Stored Procedures', 'VB6', 'C# / .NET', 'GitKraken', 'Jira'],
    repoUrl: 'https://www.linkedin.com/in/miqueias-henrique-88503b218/',
    linkLabel: 'Ver Experiência no LinkedIn',
    codeSnippet: `-- T-SQL Procedure @ Zetti (Adequação CNPJ Alfanumérico & Impostos)
CREATE OR ALTER PROCEDURE dbo.sp_AtualizarCadastroFiscalAlfa
  @IdUnidade INT,
  @CnpjAlfa CHAR(14),
  @AliquotaIBS DECIMAL(5,2)
AS
BEGIN
  SET NOCOUNT ON;
  IF LEN(RTRIM(@CnpjAlfa)) <> 14
    THROW 50001, 'CNPJ Alfanumérico inválido na validação de entrada.', 1;

  UPDATE dbo.UnidadesFarmacia
  SET CnpjAlfanumerico = UPPER(@CnpjAlfa),
      AliquotaImpostoIBS = @AliquotaIBS,
      DataUltimaAuditoria = SYSDATETIME()
  WHERE IdUnidade = @IdUnidade;
END;`,
    terminalOutput: `$ hosaka-sql --host zetti-prod-cluster --exec sp_AtualizarCadastroFiscalAlfa
[OK] Conectado ao SQL Server 2022 (Latência: 1.8ms)
[OK] Validando máscara alfanumérica [A-Z0-9]{14}... PASS
[OK] Plano de execução: Index Seek em IX_UnidadesFarmacia_Id (0.0032s)
[OK] 148 filiais sincronizadas sem bloqueio de transação (NOLOCK/READ COMMITTED).`,
  },
  {
    id: 'api-gestao-produtos',
    slot: 'FITA ROM II · ARQUITETURA REST & DOCKER',
    category: 'api',
    title: 'api-gestao-produtos (Node.js, TypeScript & TypeORM)',
    period: 'Repositório Público · GitHub',
    headline: 'API RESTful containerizada com autenticação, migrations, TypeORM, MySQL e documentação Swagger.',
    impact: 'Ambiente 100% reprodutível via Docker Compose com separação limpa em Controllers, Services e Entities.',
    context:
      'Construída para resolver o gerenciamento completo de catálogo de produtos, estoque e categorias com validação estrita de payload e persistência relacional.',
    engineering: [
      'Arquitetura em camadas utilizando Node.js, TypeScript, Express e TypeORM conectado ao MySQL.',
      'Versionamento de esquema de banco de dados via TypeORM Migrations.',
      'Documentação interativa de todos os endpoints via OpenAPI / Swagger UI.',
      'Orquestração de containers (API + MySQL) pronta para subida imediata com Docker Compose.',
    ],
    stack: ['TypeScript', 'Node.js', 'Express', 'TypeORM', 'MySQL', 'Swagger', 'Docker'],
    repoUrl: 'https://github.com/Miqueias-Henrique/api-gestao-produtos',
    linkLabel: 'Abrir Repositório no GitHub',
    codeSnippet: `// ProductService.ts — Busca paginada e transacional com TypeORM
export class ProductService {
  constructor(private readonly repo = AppDataSource.getRepository(Product)) {}

  async listActive(page = 1, limit = 20) {
    const [items, total] = await this.repo.findAndCount({
      where: { active: true },
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, pages: Math.ceil(total / limit) };
  }
}`,
    terminalOutput: `$ docker compose up -d && curl -s http://localhost:3000/api/v1/health
[+] Running 2/2
 ✔ Container mysql-db       Healthy (0.4s)
 ✔ Container api-produtos   Started (0.9s)
{"status":"ONLINE","orm":"TypeORM","db":"MySQL 8.0","swagger":"/api-docs","uptime_ms":4210}`,
  },
  {
    id: 'vosso-cinema-api',
    slot: 'FITA ROM III · NESTJS & PRISMA ORM',
    category: 'api',
    title: 'vosso-cinema-api (NestJS, Prisma & PostgreSQL)',
    period: 'Repositório Público · GitHub',
    headline: 'Backend modular em NestJS para gestão de filmes, salas, sessões e reserva concorrente de assentos.',
    impact: 'Injeção de dependência, DTOs validados com class-validator e modelagem relacional forte em PostgreSQL.',
    context:
      'Desenvolvida para sustentar a operação completa de um complexo de cinema, garantindo que dois clientes não reservem o mesmo assento na mesma sessão.',
    engineering: [
      'Módulos isolados no padrão NestJS (Movies, Rooms, Sessions, Tickets) com tipagem ponta a ponta no Prisma ORM.',
      'Validação automática de contratos de entrada com Pipes e DTOs e documentação Swagger automática.',
      'Integração com o frontend vosso-cinema-web para fluxo completo de bilheteria.',
    ],
    stack: ['NestJS', 'TypeScript', 'Prisma ORM', 'PostgreSQL', 'Swagger', 'REST API'],
    repoUrl: 'https://github.com/Miqueias-Henrique/vosso-cinema-api',
    linkLabel: 'Abrir Repositório no GitHub',
    codeSnippet: `// sessions.service.ts — Reserva atômica de assento via Prisma Transaction
async reserveSeat(sessionId: string, seatCode: string, buyerCpf: string) {
  return this.prisma.$transaction(async (tx) => {
    const existing = await tx.ticket.findFirst({ where: { sessionId, seatCode } });
    if (existing) throw new ConflictException('Assento já reservado nesta sessão.');
    return tx.ticket.create({
      data: { sessionId, seatCode, buyerCpf, issuedAt: new Date() },
    });
  });
}`,
    terminalOutput: `$ npx prisma migrate deploy && npm run test:e2e
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "vossocinema"
✔ Generated Prisma Client (v5.x)
PASS  test/sessions.e2e-spec.ts (6 passed, 0 failed in 1.12s)`,
  },
  {
    id: 'vital-conscious-api',
    slot: 'FITA ROM IV · JAVA 17 & SPRING BOOT 3',
    category: 'api',
    title: 'vital-conscious-api (Java 17, Spring Boot 3 & JPA)',
    period: 'Repositório Público · GitHub',
    headline: 'API RESTful em Java 17 e Spring Boot 3 com Spring Data JPA e PostgreSQL.',
    impact: 'Padrões corporativos do ecossistema Java/Spring aplicados a monitoramento e registros estruturados.',
    context:
      'Projeto de engenharia de software explorando a robustez do Spring Boot 3, mapeamento objeto-relacional com Hibernate/JPA e tratamento global de exceções.',
    engineering: [
      'Entidades JPA mapeadas com relacionamentos otimizados e repositórios Spring Data.',
      'Controllers REST padronizados com ResponseEntity, Bean Validation e códigos HTTP semânticos.',
      'Persistência relacional em PostgreSQL com configuração pronta para desenvolvimento e produção.',
    ],
    stack: ['Java 17', 'Spring Boot 3', 'Spring Data JPA', 'PostgreSQL', 'Maven'],
    repoUrl: 'https://github.com/Miqueias-Henrique/vital-conscious-api',
    linkLabel: 'Abrir Repositório no GitHub',
    codeSnippet: `// VitalRecordController.java — Endpoint REST Spring Boot 3
@RestController
@RequestMapping("/api/v1/vitals")
public class VitalRecordController {
    private final VitalService service;
    public VitalRecordController(VitalService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<VitalDTO> register(@Valid @RequestBody CreateVitalDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(dto));
    }
}`,
    terminalOutput: `$ mvn clean test
[INFO] Scanning for projects...
[INFO] Building vital-conscious-api 1.0.0
[INFO] Tests run: 12, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS (Total time: 2.840 s)`,
  },
  {
    id: 'controle-estoque-javafx',
    slot: 'FITA ROM V · DESKTOP JAVAFX & DAO',
    category: 'desktop',
    title: 'controle-estoque-javafx (JavaFX, JDBC & PostgreSQL)',
    period: 'Repositório Público · GitHub',
    headline: 'Sistema desktop completo em JavaFX com conexão JDBC direta ao PostgreSQL e padrão arquitetural DAO.',
    impact: 'Operação de inventário com CRUD transacional, busca em tempo real e desacoplamento total entre UI e SQL.',
    context:
      'Aplicação desktop construída sem depender de ORMs pesados para demonstrar domínio de SQL puro via PreparedStatement, gerenciamento de conexões JDBC e arquitetura MVC/DAO.',
    engineering: [
      'Implementação de Data Access Objects (DAO) com PreparedStatements seguros contra SQL Injection.',
      'Interface gráfica responsiva em JavaFX com tabelas reativas, filtros e alertas de estoque mínimo.',
      'Banco de dados PostgreSQL modelado com integridade referencial.',
    ],
    stack: ['Java 17', 'JavaFX', 'JDBC', 'PostgreSQL', 'Padrão DAO', 'MVC'],
    repoUrl: 'https://github.com/Miqueias-Henrique/controle-estoque-javafx',
    linkLabel: 'Abrir Repositório no GitHub',
    codeSnippet: `// ProdutoDAO.java — Persistência segura com JDBC PreparedStatement
public void atualizarEstoque(int idProduto, int novaQuantidade) throws SQLException {
    String sql = "UPDATE produtos SET quantidade = ?, atualizado_em = NOW() WHERE id = ?";
    try (PreparedStatement stmt = connection.prepareStatement(sql)) {
        stmt.setInt(1, novaQuantidade);
        stmt.setInt(2, idProduto);
        stmt.executeUpdate();
    }
}`,
    terminalOutput: `$ java --module-path $PATH_TO_FX --add-modules javafx.controls,javafx.fxml -jar estoque.jar
[JDBC] Pool PostgreSQL inicializado (5 conexões ativas)
[DAO] 342 itens carregados na TableView em 14ms. Status: PRONTO.`,
  },
  {
    id: 'estruturas-dados-java',
    slot: 'FITA ROM VI · ALGORITMOS O(1) & O(log n)',
    category: 'algo',
    title: 'Tabela Hash CPF & Catálogo Árvore AVL vs BST (Java)',
    period: '2 Repositórios Públicos · GitHub',
    headline: 'Implementações do zero de Tabela Hash com encadeamento separado e Árvore AVL auto-balanceada.',
    impact: 'Busca em O(1) médio para validação de CPFs e garantia de O(log n) no pior caso com rotações AVL.',
    context:
      'Conjunto de dois projetos fundamentais de Ciência da Computação (`tabela-hash-cpf-java` e `catalogo-livros-avl-bst`) provando domínio de ponteiros, espalhamento, colisões e balanceamento de árvores.',
    engineering: [
      'Tabela Hash com função de dispersão customizada para CPF (Módulo 11) e tratamento de colisão por listas encadeadas.',
      'Comparativo empírico entre Árvore Binária de Busca (BST) comum e Árvore AVL com rotações simples e duplas.',
      'Testes automatizados e CLI interativa (`quiz-cli-java` com JUnit 5).',
    ],
    stack: ['Java 17', 'Estruturas de Dados', 'Árvore AVL', 'Tabela Hash O(1)', 'JUnit 5', 'Complexidade'],
    repoUrl: 'https://github.com/Miqueias-Henrique/catalogo-livros-avl-bst',
    linkLabel: 'Ver Árvore AVL no GitHub',
    codeSnippet: `// AvlTree.java — Rotação à direita para manter fator de balanceamento |FB| <= 1
private Node rotateRight(Node y) {
    Node x = y.left;
    Node T2 = x.right;
    x.right = y;
    y.left = T2;
    y.height = Math.max(height(y.left), height(y.right)) + 1;
    x.height = Math.max(height(x.left), height(x.right)) + 1;
    return x;
}`,
    terminalOutput: `$ java -cp target/classes br.com.miqueias.BenchmarkAvlBst
[BENCHMARK] Inserindo 50.000 ISBNs ordenados:
 -> BST Degenerada O(n): altura = 50000 | busca = 4.820.100 ns
 -> Árvore AVL O(log n): altura = 16    | busca =     1.420 ns (3.394x mais rápido)`,
  },
];

// 26-Block Tactile Punch-Card Telemetry Matrix (Inspired by Felipe's "Golpe a golpe" commit board)
export const TELEMETRY_PINS = [
  { id: 1, code: '2021-Q3', level: 1, commits: 18, label: 'Início na Carvalho Forros e Divisórias (Jovem Aprendiz · Organização e controle documental)' },
  { id: 2, code: '2022-Q1', level: 1, commits: 24, label: 'Padronização de planilhas financeiras, notas fiscais e fluxo de estoque físico' },
  { id: 3, code: '2022-Q4', level: 2, commits: 35, label: 'Promoção a Auxiliar Administrativo · Gestão de compras, atendimento e conciliação bancária' },
  { id: 4, code: '2023-Q2', level: 2, commits: 42, label: 'Automação de controles internos e transição planejada para Engenharia de Software' },
  { id: 5, code: '2024-Q1', level: 2, commits: 58, label: 'Ingresso no Bacharelado em Engenharia de Software (UNIFAN) · Lógica e Algoritmos' },
  { id: 6, code: '2024-Q3', level: 3, commits: 84, label: 'Criação da conta GitHub @Miqueias-Henrique e primeiros repositórios de POO em Java' },
  { id: 7, code: '2024-Q4', level: 3, commits: 96, label: 'Domínio de Polimorfismo, Interfaces, Métodos Estáticos e Matrizes em Java (4 repositórios)' },
  { id: 8, code: '2025-M01', level: 3, commits: 112, label: 'Desenvolvimento do Quiz CLI em Java 17 com Maven e testes unitários JUnit 5' },
  { id: 9, code: '2025-M02', level: 3, commits: 128, label: 'Implementação da Tabela Hash de CPF em Java com validação oficial e encadeamento separado' },
  { id: 10, code: '2025-M03', level: 4, commits: 156, label: 'Catálogo de Livros comparando Árvore Binária (BST) e Árvore AVL auto-balanceada' },
  { id: 11, code: '2025-M04', level: 3, commits: 119, label: 'Construção do Controle de Estoque Desktop em JavaFX + JDBC + PostgreSQL + Padrão DAO' },
  { id: 12, code: '2025-M05', level: 4, commits: 164, label: 'Lançamento da vital-conscious-api com Java 17, Spring Boot 3, Spring Data JPA e PostgreSQL' },
  { id: 13, code: '2025-M06', level: 3, commits: 134, label: 'Especialização em C# e .NET: POO, APIs REST, Entity Framework e Clean Architecture' },
  { id: 14, code: '2025-M07', level: 4, commits: 172, label: 'Desenvolvimento da api-gestao-produtos (Node.js, TypeScript, Express, TypeORM, MySQL e Docker)' },
  { id: 15, code: '2025-M08', level: 4, commits: 188, label: 'Arquitetura completa do vosso-cinema-api (NestJS + Prisma + Postgres) e vosso-cinema-web' },
  { id: 16, code: '2025-M09', level: 3, commits: 141, label: 'Aprofundamento em T-SQL, planos de execução, índices e Stored Procedures no SQL Server' },
  { id: 17, code: '2025-M10', level: 3, commits: 149, label: 'Prática com containers Docker, documentação OpenAPI/Swagger e GitKraken' },
  { id: 18, code: '2025-M11', level: 4, commits: 195, label: 'Aprovação no processo seletivo para Desenvolvimento de Software na Zetti' },
  { id: 19, code: '2025-M12', level: 4, commits: 214, label: 'Início na Zetti (08/12/2025): Sustentação em produção com SQL Server e Visual Basic 6' },
  { id: 20, code: '2026-M01', level: 4, commits: 228, label: 'Zetti Produção: Otimização de queries, views e stored procedures para múltiplas farmácias' },
  { id: 21, code: '2026-M02', level: 4, commits: 242, label: 'Zetti Fiscal: Adequação técnica para o novo formato de CNPJ Alfanumérico' },
  { id: 22, code: '2026-M03', level: 4, commits: 256, label: 'Zetti Tributário: Atualização de regras de negócio e cálculos de novos impostos em banco' },
  { id: 23, code: '2026-M05', level: 3, commits: 189, label: 'Evolução contínua no ecossistema C#/.NET e integração de serviços REST' },
  { id: 24, code: '2026-M07', level: 4, commits: 231, label: 'Engenharia de Software UNIFAN (68% concluído) · Arquitetura e Qualidade de Software' },
  { id: 25, code: '2026-M09', level: 4, commits: 248, label: 'Publicação dos dossiês interativos Galvan-M e Mikoshi Engrama no GitHub Pages' },
  { id: 26, code: '2026-M11', level: 4, commits: 275, label: 'Lançamento da estação retrofuturista ONO-SENDAI VII // DECK TYRELL-84' },
];

// 12 Voight-Kampff Empathy Seals (Unlocking 6 -> Titanium Chassis; 12 -> 24K Gold Chassis)
export const EMPATHY_SEALS = [
  { id: 'seal_boot', code: 'VK-01', title: 'Sinal de Ignição', desc: 'Iniciou a estação Ono-Sendai VII // Tyrell-84.' },
  { id: 'seal_calibrate', code: 'VK-02', title: 'Olho Voight-Kampff', desc: 'Calibrou 100% da retina biométrica do retrato.' },
  { id: 'seal_owl', code: 'VK-03', title: 'Coruja Tyrell Corp', desc: 'Consultou o assistente mecânico Rachel-7.' },
  { id: 'seal_rom', code: 'VK-04', title: 'Operador de Fitas ROM', desc: 'Trocou um cartucho de projeto na baia Hosaka.' },
  { id: 'seal_runner', code: 'VK-05', title: 'Execução em Produção', desc: 'Disparou o diagnóstico de código de uma Fita ROM.' },
  { id: 'seal_matrix', code: 'VK-06', title: 'Arqueólogo da Matriz', desc: 'Inspecionou os pinos da Placa de Telemetria.' },
  { id: 'seal_icebreaker', code: 'VK-07', title: 'Cowboy do Ciberespaço', desc: 'Quebrou a defesa ICE da IA Wintermute no duelo.' },
  { id: 'seal_os_mode', code: 'VK-08', title: 'Operador Hosaka OS', desc: 'Alternou para a Área de Trabalho Multitarefa.' },
  { id: 'seal_sql_bench', code: 'VK-09', title: 'DBA de Plantão', desc: 'Executou uma consulta no aplicativo SQL Bench.' },
  { id: 'seal_esper', code: 'VK-10', title: 'Detetive Esper 2019', desc: 'Usou o zoom ou filtro óptico no Esper PhotoLab.' },
  { id: 'seal_synth', code: 'VK-11', title: 'Sintetizador Vangelis', desc: 'Tocou uma frequência Blues/CS-80 no Deck de Áudio.' },
  { id: 'seal_dossier', code: 'VK-12', title: 'Protocolo de Contato', desc: 'Copiou um canal de contato ou baixou o Currículo PDF.' },
];

// SQL Bench Preset Queries (For the Hosaka OS SQL App)
export const SQL_PRESETS = [
  {
    id: 'q_zetti_cnpj',
    label: '1. Auditoria CNPJ Alfanumérico (Zetti)',
    sql: `SELECT u.IdUnidade, u.RazaoSocial, u.CnpjAlfanumerico, u.AliquotaImpostoIBS, u.StatusOperacao
FROM dbo.UnidadesFarmacia u WITH (NOLOCK)
WHERE u.StatusOperacao = 'PRODUCAO_ATIVA'
ORDER BY u.IdUnidade ASC;`,
    rows: [
      { IdUnidade: 101, RazaoSocial: 'FARMACIA MATRIZ GOIANIA', CnpjAlfanumerico: '12A45B78000199', AliquotaImpostoIBS: '12.50%', StatusOperacao: 'PRODUCAO_ATIVA' },
      { IdUnidade: 104, RazaoSocial: 'DROGARIA SETOR BUENO', CnpjAlfanumerico: '98Z71K22000140', AliquotaImpostoIBS: '12.50%', StatusOperacao: 'PRODUCAO_ATIVA' },
      { IdUnidade: 109, RazaoSocial: 'FARMACIA CENTRAL ANAPOLIS', CnpjAlfanumerico: '45M19P03000112', AliquotaImpostoIBS: '11.80%', StatusOperacao: 'PRODUCAO_ATIVA' },
    ],
  },
  {
    id: 'q_repos_stack',
    label: '2. Catálogo de Repositórios Backend',
    sql: `SELECT r.Repositorio, r.Linguagem, r.FrameworkORM, r.BancoDados, r.Complexidade
FROM cyberspazio.RepositoriosMiqueias r
ORDER BY r.Destaque DESC;`,
    rows: [
      { Repositorio: 'api-gestao-produtos', Linguagem: 'TypeScript', FrameworkORM: 'Express + TypeORM', BancoDados: 'MySQL 8 (Docker)', Complexidade: 'REST + Migrations' },
      { Repositorio: 'vosso-cinema-api', Linguagem: 'TypeScript', FrameworkORM: 'NestJS + Prisma', BancoDados: 'PostgreSQL', Complexidade: 'Transacional ACID' },
      { Repositorio: 'vital-conscious-api', Linguagem: 'Java 17', FrameworkORM: 'Spring Boot 3 + JPA', BancoDados: 'PostgreSQL', Complexidade: 'Arquitetura Camadas' },
      { Repositorio: 'controle-estoque-javafx', Linguagem: 'Java 17', FrameworkORM: 'JavaFX + JDBC DAO', BancoDados: 'PostgreSQL', Complexidade: 'Desktop SQL Puro' },
      { Repositorio: 'catalogo-livros-avl-bst', Linguagem: 'Java 17', FrameworkORM: 'Estruturas Nativas', BancoDados: 'In-Memory Tree', Complexidade: 'Busca O(log n)' },
    ],
  },
  {
    id: 'q_skills_matrix',
    label: '3. Competências Técnicas & Ferramentas',
    sql: `SELECT c.Categoria, c.Tecnologias, c.AplicacaoPratica
FROM dbo.PerfilEngenharia c;`,
    rows: [
      { Categoria: 'Backend Principal', Tecnologias: 'C#, .NET, VB6, Java 17, Spring Boot 3', AplicacaoPratica: 'Sustentação na Zetti & APIs RESTful' },
      { Categoria: 'Node & TypeScript', Tecnologias: 'Node.js, TypeScript, NestJS, Express', AplicacaoPratica: 'APIs containerizadas com Prisma e TypeORM' },
      { Categoria: 'Bancos Relacionais', Tecnologias: 'SQL Server, PostgreSQL, MySQL', AplicacaoPratica: 'Queries, Views, Stored Procedures e Migrations' },
      { Categoria: 'DevOps & Fluxo', Tecnologias: 'Git, GitHub, GitLab, GitKraken, Docker, Jira', AplicacaoPratica: 'Versionamento em equipe, kanban e containers' },
    ],
  },
];
