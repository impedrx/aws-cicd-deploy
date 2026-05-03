aws-cicd-deploy
Pipeline de CI/CD completa para build, publicação e deploy automatizado do Aerrnova IT Tools em ambiente AWS com Docker.
Visão Geral
Este repositório contém o código da aplicação Aerrnova IT Tools e a pipeline de entrega contínua. A cada novo commit na branch main, o GitHub Actions automaticamente builda uma nova imagem Docker, publica no ECR e atualiza o container em execução na EC2 — sem nenhuma intervenção manual.
Fluxo do Deploy
Commit na main
      │
      ▼
GitHub Actions
      │
      ├── Build da imagem Docker
      ├── Push para o ECR (AWS)
      └── SSH na EC2
              │
              ├── docker pull (nova imagem do ECR)
              └── docker run (container atualizado)
Stack da Aplicação
Frontend

React 18 + TypeScript
Vite
Tailwind CSS + shadcn/ui
TanStack React Query
React Router DOM

Backend

Supabase (PostgreSQL + Auth)
Row Level Security (RLS)

Infra / DevOps

Docker
AWS ECR + EC2
GitHub Actions

Sobre o Aerrnova IT Tools
Sistema interno de gestão de equipamentos de TI e termos de responsabilidade digital.
Funcionalidades:

Controle de inventário de equipamentos (notebook, monitor, teclado, etc.)
Geração de termos de responsabilidade com assinatura digital
Assinatura externa via link público (sem necessidade de login)
Gestão de devoluções
Dashboard com métricas e gráficos
Suporte a 3 idiomas: Português, Inglês e Espanhol
Modo claro e escuro

Pipeline CI/CD
O workflow roda automaticamente a cada push na main com dois jobs em sequência:
Job 1 — build-and-push

Autentica no ECR
Builda a imagem Docker com a tag latest
Faz push da imagem para o repositório privado no ECR

Job 2 — deploy

Acessa a EC2 via SSH
Faz docker pull da imagem mais recente
Para o container anterior e sobe o novo

Pré-requisitos
Secrets configurados no GitHub:
SecretDescriçãoAWS_ACCESS_KEY_IDChave de acesso AWSAWS_SECRET_ACCESS_KEYChave secreta AWSAWS_REGIONRegião AWS (ex: us-east-2)ECR_REPOSITORYNome do repositório ECREC2_HOSTIP público da instância EC2EC2_SSH_KEYChave privada SSH para acesso à EC2
Repositório Relacionado

aws-infra-terraform — Repositório de infraestrutura com Terraform


Desenvolvido por Pedro Henrique Martins de Paula RibeiroCompartilharConteúdoAerrnova IT Tools
Sistema interno de gestão de equipamentos de TI e termos de responsabilidade.

📋 Descrição
Aplicação web para controle de inventário de equipamentos de TI, geração de termos de responsabilidade com assinatura digital, e gestão de devoluções. Desenvolvido para uso interno do depasted
