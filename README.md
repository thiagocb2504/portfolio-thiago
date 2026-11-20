# Portfólio · Thiago Brito

Portfólio pessoal feito em **HTML, CSS e JavaScript puro**, sem framework e sem etapa de build, publicado no GitHub Pages.

**Site:** https://thiagobrito.is-a.dev

## O que tem na página

- **Início:** nome com efeito elétrico em WebGL e crachá 3D com física de corda (dá para arrastar e clicar para virar)
- **Experiência:** CDS Solutions, FI Group e INSS
- **Projetos:** órbita interativa com os projetos; cada um abre uma janela com detalhes, telas e links
- **Stack:** tecnologias e como uso IA (Claude) no dia a dia
- **Formação e contato:** cursos, currículo em PDF, e-mail, WhatsApp, LinkedIn e GitHub

## Decisões técnicas

- **Sem build:** os arquivos são servidos como estão. Os efeitos visuais são componentes do [React Bits](https://reactbits.dev) que reescrevi em JavaScript puro, como módulos ES. As bibliotecas (`ogl`, `three`, `gsap`) vêm de CDN com a versão fixada.
- **Conteúdo primeiro:** todo o texto está no HTML. Se um efeito não carregar (sem WebGL, CDN fora do ar), a página mostra a versão estática: nome em texto, foto no lugar do crachá e cards no lugar da órbita.
- **Desempenho:** as bordas elétricas só são criadas quando o card chega perto da tela e são liberadas quando ele sai, para não estourar o limite de contextos WebGL do navegador.
- **Acessibilidade:** navegação por teclado, link para pular ao conteúdo, janela de detalhes com `<dialog>` nativo, textos alternativos e respeito à preferência `prefers-reduced-motion`.
- **Responsivo:** layout pensado para celular, com menu de tela cheia e órbita ajustada para toque.

## Estrutura

```
.
├── index.html               conteúdo da página
├── css/
│   └── style.css            tokens de cor e tipografia, layout e animações
├── js/
│   ├── main.js              menu, relógio de Brasília, copiar e-mail, janela de projetos
│   ├── modules/             o que monta cada parte da página
│   │   ├── electric-hero.js      nome com efeito elétrico
│   │   ├── nav-header.js         navegação gooey do header
│   │   ├── particles-bg.js       partículas do fundo
│   │   ├── electric-borders.js   bordas elétricas dos cards
│   │   ├── badge.js              desenha e monta o crachá 3D
│   │   ├── projects-orbit.js     órbita dos projetos
│   │   └── animate-in.js         entrada animada dos blocos
│   └── components/          componentes do React Bits em JavaScript puro
│       ├── electric-logo.js      ElectricLogo (ogl)
│       ├── gooey-nav.js          GooeyNav
│       ├── particles.js          Particles (ogl)
│       ├── electric-border.js    ElectricBorder (WebGL)
│       ├── lanyard.js            Lanyard (three.js)
│       ├── animated-content.js   AnimatedContent (GSAP)
│       └── orbit-images.js       OrbitImages
└── assets/
    ├── CV_TI_THIAGO_BRITO.pdf    currículo
    ├── img/                      fotos e logo da CDS Solutions usados no crachá
    └── projetos/                 capturas de tela dos projetos web
```

Cada módulo em `js/modules/` importa um componente de `js/components/` e o aplica na página. Assim, a lógica do efeito fica separada do uso no site.

## Rodar localmente

Os módulos ES precisam de um servidor (não abrem direto pelo arquivo):

```bash
python3 -m http.server 5500
```

Depois é só abrir `http://localhost:5500`.

## Créditos

Efeitos visuais baseados nos componentes do [React Bits](https://reactbits.dev), de David Haz; o OrbitImages é de Dominik Koch.
