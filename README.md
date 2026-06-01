# Folha de Cânticos - Gestão Litúrgica

Uma aplicação web elegante e moderna para gerenciamento de cânticos litúrgicos e geração de folhas de missa, desenvolvida com as melhores práticas de web design e usabilidade.

## 📋 Funcionalidades

### Dashboard (Início)
- Visão geral estatística com cards interativos
- Gráfico de distribuição de cânticos por categoria
- Lista das folhas de missa mais recentes
- Navegação intuitiva entre seções

### Cânticos Litúrgicos
- **Cadastro completo** de cânticos com:
  - Título, categoria litúrgica, letra completa
  - Tom musical, autor, referência bíblica
  - Observações adicionais
- **Busca e filtro** em tempo real
- **Paginação** inteligente
- **Visualização detalhada** com formatação especial para refrão
- **Edição e exclusão** com confirmação
- **11 categorias** litúrgicas: Entrada, Ato Penitencial, Glória, Salmo, Aleluia, Ofertório, Santo, Comunhão, Final, Maria, Outro

### Folhas de Missa
- **Listagem completa** com informações da celebração
- **Filtro por título, ocasião ou cor litúrgica**
- **Visualização impressa** com layout elegante
- **Integração automática** com cânticos cadastrados
- **Suporte a 6 cores litúrgicas**: Verde, Roxo, Vermelho, Branco, Rosa, Preto
- **8 ocasiões litúrgicas**: Domingo, Feriado, Advento, Natal, Quaresma, Páscoa, Comum, Outro

### Gerar Nova Folha
- **Interface simplificada** para criação rápida
- **Seleção inteligente** de cânticos por momento litúrgico
- **Agrupamento por categoria** nos selects
- **Validação de campos obrigatórios**
- **Criação e visualização imediata**

## 🎨 Design e Usabilidade

### Identidade Visual
- **Tipografia**: Cinzel (serif) para títulos, Inter (sans-serif) para corpo
- **Paleta de cores** inspirada em elementos litúrgicos:
  - Azul profundo (#1a365d) para autoridade e seriedade
  - Dourado (#b7791f) para destaque e elegância
  - Bege (#f7f5f0) para fundo acolhedor
- **Sombras sutis** e bordas arredondadas
- **Gradientes suaves** em elementos principais

### Experiência do Usuário
- **Navegação fluida** entre seções sem recarregar página
- **Modais elegantes** para formulários e visualizações
- **Feedback visual** com alertas animados
- **Estados vazios** informativos e amigáveis
- **Responsividade total**: desktop, tablet e mobile
- **Print styles** para impressão de folhas

## 🏗️ Estrutura do Projeto

```
├── index.html          # Página principal SPA
├── css/
│   └── style.css       # Estilos completos e responsivos
├── js/
│   └── app.js          # Lógica JavaScript e API calls
└── README.md           # Documentação
```

## 💻 Tecnologias Utilizadas

- **HTML5 semântico** com estrutura acessível
- **CSS3 moderno** com variáveis, flexbox, grid e animações
- **JavaScript vanilla** (ES6+) sem dependências externas
- **Font Awesome 6** para iconografia
- **Google Fonts**: Cinzel e Inter
- **RESTful API** integrada para persistência de dados

## 📡 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `tables/cantos` | Listar cânticos (paginado) |
| POST | `tables/cantos` | Criar novo cântico |
| PUT | `tables/cantos/{id}` | Atualizar cântico |
| DELETE | `tables/cantos/{id}` | Excluir cântico |
| GET | `tables/folhas_missas` | Listar folhas (paginado) |
| POST | `tables/folhas_missas` | Criar nova folha |
| PUT | `tables/folhas_missas/{id}` | Atualizar folha |
| DELETE | `tables/folhas_missas/{id}` | Excluir folha |

## 🗂️ Modelos de Dados

### Cântico (cantos)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | text | Identificador único |
| titulo | text | Título do cântico |
| letra | rich_text | Letra completa |
| categoria | text | Categoria litúrgica |
| tom | text | Tom musical |
| autor | text | Autor |
| referencia_biblica | text | Referência bíblica |
| observacoes | text | Observações |

### Folha de Missa (folhas_missas)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | text | Identificador único |
| titulo | text | Título da celebração |
| data | datetime | Data e hora |
| cor_liturgica | text | Cor litúrgica |
| ocasiao | text | Ocasião litúrgica |
| *_canto_id | text | IDs dos cânticos por momento |
| observacoes | text | Observações gerais |

## 🚀 Próximos Passos Recomendados

- [ ] Implementar exportação de folha em PDF
- [ ] Adicionar importação em massa de cânticos (CSV)
- [ ] Criar histórico de alterações
- [ ] Implementar categorias personalizáveis
- [ ] Adicionar sugestões automáticas de cânticos por tempo litúrgico
- [ ] Criar modo offline com service worker
- [ ] Adicionar compartilhamento digital de folhas

## 📱 Responsividade

A aplicação é totalmente responsiva, adaptando-se automaticamente a:
- **Desktop**: Layout completo com sidebar e grids
- **Tablet**: Colunas reduzidas e cards reordenados
- **Mobile**: Interface vertical com navegação otimizada

## 🎯 Como Usar

1. Acesse a aplicação pelo navegador
2. Cadastre cânticos litúrgicos na seção "Cânticos"
3. Utilize "Nova Folha" para criar uma celebração
4. Selecione os cânticos para cada momento litúrgico
5. Visualize e imprima a folha final

---

**Desenvolvido com dedicação para auxiliar na organização litúrgica.**
