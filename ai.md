# Contexto do Projeto
Esse é uma plataforma de cursos geradas por IA. 

# Estrutura do repositório

|.
| - backend -> Projeto do Backend da Aplicação
|   - src -> codigo em javascript do backend
| - frontend -> Projeto de frontend da Aplicação
|   - src -> codigo em javascript do frontend
|     - i18n.ts -> Serve as multiplas traduções do sistema. 
|     - components -> componentes compartilhados por todo o sistema. 
|     - contexts -> Contextos da aplicação como: 
        - AuthContext.tsx: 
|     - screems -> Todas as telas do sistema
|       - organizacao -> as telas acessível pela organização 
|       - system -> as telas acessíveis pelos gestores da Aplicação (sysadmin)


# Instruções iniciais
Geral:
- Crie um aplicativo web, frontend/backend. Que funcionará de forma whitelabel para as instituições. 
- Uma instituição deve ser qualquer empresa ou organizacao que tenha funcionarios que precisem de treinamento. 

Stack: 
  - React e Apollo graphql no frontend com Material UI
  - No backend Apollo graphql library with nodejs. 
    - use a biblioteca sequelize para o acesso a base de dados.
      - use sqlite em desenvolvimento. 
      - use postgres em producao.  

Interface: 
- deverá ter controle de acesso configuravel. 
- deverá ser construida com material design, podendo variar entre os temas escuro e claro.
- As configurações da conta do usuário deverão ser acessados 
Telas:
  navegacao:
    barra superior:
      Na barra superior, haverá um sandwich no lado esquerdo, e um chip com a foto do usuário no lado direito.
      
    menu de contexto de usuário:
      - Ao clicar no chip com a foto do usuário será aberto um menu de contexto com:
        - configurações da conta
        - configurações de tema
        - logout
    barra lateral:
      Organização:
        Home:
          - Exibir catálogo de cursos da plataforma. 
          - E quais as últimas atualizações.
          - Essa tela deverá reproduzir o comportamento da tela inicial da netflix.  
        Pesquisar: 
          - Pesquisar curso na plataforma.
        Cursos:
          - Cursos ativos para o usuário
        Trilhas:
          - Trilhas de cursos ativas para o usuário.
        Certificados:
          - Certificação conseguidos pela plataforma. 
      Gestão da organização: 
        Home:
          - Criar um dashboard 
          - Mostrar a quantidade de colaboradores
          - Mostrar a quantidade de cursos ativos
          - Mostrar a média da pontuação dos colaboradores nos cursos ativos para os colaboradores. 
          - Mostrar a média da pontuação dos colaboradores por curso em uma tabela. Sinalize a saúde do curso para os alunos de acordo com as cores verde amarelo e vermelho. 
        Visualização do score dos cursos da administração:
          - Tela deverá permitir a busca de cursos manual ou por pesquisa.
          - Ao clicar no curso, abrir uma view modal com as estatísticas do curso para os seus colaboradores. 
            - A view modal das estatísticas do curso deverão permitir redirecionar para a tela de estatísticas do colaborador. 
            - Passar como parametro para essa tela, o id do curso para mostrar todos os colaboradores do curso.
            - Com os temas abordados no curso, exibir um grafo mostrando o fluxo de dependências entre um assunto e outro. 
        Visualização do score do colaborador:
          - Permitir a pesquisa da pontuação do colaborador por curso e por nome. 
          - Ao clicar, permitir a abertura de uma view modal com os detalhes da pontuação do curso.
          - A pontuação do curso será exibida como um boletim de todos os temas do curso; para cada tema uma pontuação geral de 1-100. Mostre como Não abordado, a pontuação para os temas os quais o colaborador não visitou no curso. No esquema de dados apresente essa nota como "-1"
          - A tela ainda apresentará uma pontuação geram que refletirá a média de todas as pontuações do curso.
  
        Gestão de permissões de usuários da organização: 
          - Acesso administrativo da organização.
          - Adicionar usuários a grupos de usuários.
          - Criar grupos:
            - Permite criar grupos e editar grupos de usuários.
            - 3 grupos serão inicialmente Certificados:
              - Administradores
              - Colaboradores Técnicos
              - Coordenadores de curso.

      Systema: 
        Gestão de permissões do aplicativo:
          - Acesso administrativo do Sistema
          - Permitir alterações modificar todos os usuários do sistema. 
          - View Gestão de organizações
        Gestão de organizações:
          - Listar organizações
            - modal cliente: 
                - visualizar metodos de pagamento
                - visualizar histórico de pagamento (lista)
                - visualizar plano
        Gestão de planos:
          - Listar planos. 
          - Criar novos planos. 
          - Desabilitar planos. 
          - Visualizar plano (modal)
            - estatística de organizações no plano
            - estatística de quantidade de usuários
            - estatística de total de entradas. 
          

  Tela de login:
    Permitir o login com: 
      - google
      - github
      - Abrir a modal de cadastro de organização:
        - A institução deverá ser criada no sistema através do email institucional do administrador do sistema
        - Ao criar a instituição o administrador deverá informar o CNPJ e os dados do cartão do crédito para completar o cadastro. 
      
# Controle de Acesso

Grupos de usuário:
  SysAdmin: 
    - Acesso a todas as configurações do sistema. 
    - Não deve ter o acesso as telas da organização. 
    - Visualizar status de pagamento. 
    - No dashboard 
  Admnistrador da Organização:
    - Acesso as telas de configuração de usuário e permissão da organização. 
    - Acesso aos sumários da organização
    - Visualização dos scores por curso
    - Visualização dos scores por colaborador.
    - Associar colaborador a grupo de usuário. 
    - Associar curso ou learning path ao grupo.  
  Colaborador: 
    - Acesso a sua home com os seus sumários e pendências. 
    - Acesso aos Cursos, e Learning Paths
    - Acesso ao seus certificados
        
