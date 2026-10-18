# BodyWOD

Aplicação em **HTML, CSS e JavaScript**, em português de Portugal, orientada a smartphones na vertical. Não requer pacotes externos, conta, servidor de dados nem subscrição.

## Abrir

- **Ficheiro único:** abrir `BodyWOD.html` num navegador moderno. Inclui interface, biblioteca e motores; funciona sem ligação à Internet. Os dados ficam associados a esse ficheiro/navegador. A instalação como PWA requer HTTP seguro.
- **Versão modular / instalável:** com Node.js 20 ou superior, executar `npm start` nesta pasta e abrir `http://localhost:4173`. Depois da primeira abertura, o service worker guarda os recursos para utilização offline. Num smartphone, a instalação e o wake lock exigem normalmente **HTTPS**; localhost refere-se ao próprio dispositivo. Não basta abrir no telefone o localhost do computador.
- No iPhone/iPad: Safari → Partilhar → Adicionar ao ecrã principal, quando servido por HTTPS. A disponibilização por HTTPS não está configurada neste projeto.

Neste ambiente, Node está em `/Users/nunoleal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`. Pode ser usado em vez de `node` para executar `scripts/serve.mjs`, `scripts/bundle.mjs` e `--test tests/*.test.js`.

## Arquitetura

| Módulo | Responsabilidade |
| --- | --- |
| `src/exercises.js` | 154 exercícios reais/variantes e 24 movimentos de aquecimento/retorno à calma, metadados e estrutura visual |
| `src/training.js` | Papéis de ativação/treino, exigência do avançado e sequência WOD de referência |
| `src/generator.js` | Seleção por categoria, padrões, nível, impacto, favoritos e recência; construção e edição da linha temporal |
| `src/timer.js` | Relógio central monotónico, pausa/retoma, navegação, resultados e recuperação |
| `src/movement.js` | Posições ilustradas por família de movimento, preparação/execução e identificação explícita das variantes |
| `src/anatomy.js` | Atlas SVG original reutilizável, vistas anterior/posterior e cores por grupos musculares |
| `src/audio.js` | Web Audio para bips e Speech Synthesis com seleção exclusiva de vozes pt-PT |
| `src/storage.js` | Persistência local versionada com erros de leitura/escrita visíveis |
| `src/app.js` | Navegação, formulários, edição, execução, resultados, exportação/importação |
| `styles.css` | Tema escuro, tamanhos móveis, áreas seguras e acessibilidade |
| `sw.js` | Cache local para a versão servida por HTTP/HTTPS |
| `scripts/bundle.mjs` | Cria o HTML autónomo a partir dos mesmos módulos |

A opção web substitui Expo e SQLite nesta implementação. O armazenamento usa `localStorage`, com cópias completas dos planos em cada execução. Não há sincronização entre dispositivos. As alterações futuras podem trocar este adaptador por IndexedDB ou uma camada nativa sem mudar o gerador/relógio.

## Funcionalidades implementadas por fase

1. **Estrutura e interface:** cinco áreas principais, definições, interface vertical, tema escuro e controlos grandes.
2. **Biblioteca:** seis categorias principais (20/30/20/20/34/30), aquecimento (16), retorno à calma (8), instruções, erros, alternativas, favoritos e exclusões.
3. **Gerador:** 10–180 minutos; níveis, modalidades, baixo impacto, favoritos, inclusões explícitas e recência das últimas cinco sessões. Full Body alterna categorias; o primeiro estímulo de pernas dá preferência a agachamentos. Aquecimento inclui progressão, mobilidade inferior/superior, coluna e ativação, respeitando disponibilidades.
4. **Editor:** visualização integral por blocos; substituição por categoria, músculos em comum e dificuldade próxima; séries, repetições, execução, descanso, bloqueio, reordenação e regeneração de bloco. Os ajustes redistribuem os tempos desbloqueados ou apresentam um erro, preservando a duração anterior. A escolha de alternativas não equivale a uma prescrição individual.
5. **Execução:** intervalos e descansos automáticos, série e tempo total restantes, pausa/retoma, avanço/recuo, substituição durante a sessão, registo manual de repetições. Wake lock quando disponível e autorizado pelo navegador.
6. **Áudio:** bips sintetizados localmente, voz instalada pt-PT, volumes, contagem completa/parcial/instruções, avisos antecipados. A cadência é prevista; não mede movimentos.
7. **Persistência:** planos, favoritos, exclusões, definições, sessão em curso, histórico independente com resultados, notas, classificação e alterações; repetição exata, variante, proposta de progressão; backup JSON e importação que preserva registos existentes.
8. **Validação:** testes automáticos de motores/dados/persistência e verificação manual no navegador. A validação anatómica e a validação em dispositivos físicos continuam pendentes.

## Regras de tempo

- Cada etapa possui `start`, `end` e `duration`. A soma é validada contra a duração pedida. O exemplo de 60 minutos com aquecimento e retorno de 5 minutos produz **5 + 15 + 20 + 15 + 5 = 60 minutos**.
- Todas as transições e recuperações são etapas cronometradas. Diferenças residuais de segundos aparecem como recuperação no final do bloco.
- Os ticks de desenho apenas atualizam o ecrã. O tempo resulta de `performance.now()` e não de contagens de intervalos.
- A pausa interrompe o relógio e cancela a fala/áudio; a retoma conserva o tempo anterior. Avançar/recuar altera o ponto da linha temporal e fica registado. O tempo ativo é separado do ponto programado e não inclui os segundos saltados.
- Em segundo plano, o navegador pode suspender desenho e áudio; ao regressar, o relógio calcula a etapa correta enquanto o documento continuar vivo. Não há garantia de áudio em segundo plano ou de contabilização de suspensão profunda do sistema. Depois de encerrar/recarregar a aplicação, a sessão é recuperada **em pausa**, pelo último checkpoint (aproximadamente a cada 2 segundos), sem contabilizar o tempo com a aplicação fechada. A interface explica esta política.
- **EMOM:** cada ocorrência ocupa um minuto; execução de até 55s, descanso no restante minuto. A confirmação antecipada converte o restante período de execução em descanso. O histórico conserva o plano programado, os resultados e a alteração para descanso; a repetição usa o plano programado. Se o bloco principal não tiver minutos inteiros, os segundos finais são recuperação explícita.
- **AMRAP:** janela contínua de duração fixa. O utilizador confirma movimentos e voltas; não existem voltas ou repetições fisicamente detetadas. O preenchimento do resultado pausa o relógio e retoma após confirmação.
- Uma sessão terminada antes do fim é identificada como tal. Não é contabilizada como treino concluído nas estatísticas.

## Limitações e trabalho pendente

**Mapas musculares esquemáticos disponíveis.** A biblioteca, o plano e o treino mostram o mesmo atlas SVG original, com frente e costas: vermelho para grupos principais, laranja para secundários e cinzento para restantes regiões. Aquecimento/alongamentos identificam regiões mobilizadas. Os mapas são incorporados no HTML e funcionam offline. Os grupos profundos, como os flexores da anca, são projeções esquemáticas, sem pretensão de mostrar camadas anatómicas superficiais. O caso de respiração geral permanece neutro. Estes mapas não demonstram a posição inicial/final ou a execução do movimento. **A validação profissional e as demonstrações realistas continuam pendentes.** Os recursos de demonstração mantêm `status: "pending-validation"`, caminhos nulos e revisor nulo; `muscleMap` e `mapStatus` identificam separadamente o esquema disponível. Para integrar recursos: adicionar os ficheiros locais, os caminhos `start`/`end`/`animation`, identificar o revisor e mudar o estado para `validated` apenas após revisão. Incluir os novos ficheiros no cache offline. A interface já aceita uma imagem ou animação validada; ainda falta implementar uma sequência sincronizada de posições inicial/final com a cadência.

A biblioteca e os critérios musculares têm informação editorial inicial; a revisão profissional da técnica, dificuldades e adequação de cada variante está pendente. O gerador aplica regras gerais e não faz avaliação clínica, de lesões ou de recuperação individual. A revisão de cobertura biomecânica e da carga de sessões longas deve preceder utilização como produto de treino validado. Sem equipamento, extensão lombar/estabilização não substitui exercícios de puxar para dorsais e bíceps.

**A voz depende do dispositivo.** A aplicação só seleciona `pt-PT`; nunca troca silenciosamente para pt-BR. Sem voz pt-PT, informa e mantém bips e interface. Uma voz de rede pode precisar de Internet; para offline é necessária uma voz local. Não inclui modelos de voz próprios, nem instala vozes automaticamente. As instruções de instalação são genéricas porque variam por sistema.

Áudio e interface consultam a mesma linha temporal. A latência e a duração da síntese de voz pertencem ao sistema e não têm precisão ao milissegundo. Não há controlo nativo da mistura/ducking com Spotify, Apple Music ou outras aplicações; essa capacidade fica dependente do navegador/SO. Uma chamada, bloqueio do ecrã ou poupança de energia pode interromper o som. A navegação é mantida simples durante o treino.

`localStorage` tem limites de quota e pode ser removido pelo utilizador/navegador. Falhas de escrita são apresentadas, não tratadas como gravação bem-sucedida. Exportar backups regularmente. Não há SQLite, ficheiro APK/IPA, testes em hardware iOS/Android nem publicação HTTPS nesta entrega. Os critérios de aceitação de anatomia validada e voz garantida em cada dispositivo **não estão concluídos**.

## Verificação e desenvolvimento

```sh
npm test
npm run build
npm start
```

Os **53 testes** verificam perfis do avançado e a sequência WOD, restrições de impacto/exclusões, objetivos por tempo, bips e contagem sincronizados, transições e pausa/retoma, mapas e poses, persistência e recuperação. A duração exata e a continuidade da linha temporal são verificadas em **168 combinações** de duração/modalidade/nível; o perfil avançado é verificado adicionalmente em **240 combinações** de modalidade, impacto e semente. Há regressões para aquecimento sem caminhada, edição, regeneração, seleção exclusiva de voz pt-PT e casos de erro de armazenamento.

No navegador foram verificados configuração de 60 minutos, substituição com duração preservada, execução, pausa/retoma, término antecipado e gravação do resumo. O registo «Verificação técnica · interface» identifica explicitamente o teste e não um treino físico. O HTML autónomo foi testado por HTTP local, e foram verificadas larguras de 320, 390 e 430 px, sem deslocamento horizontal. A ferramenta de navegador bloqueia URLs file://; a abertura por duplo clique não foi verificada por essa ferramenta. Não foi executada uma sessão física de 60 minutos nem uma validação clínica.

Após alterar os módulos, executar `npm run build` para atualizar `BodyWOD.html`. Aumentar a versão do cache em `sw.js` ao distribuir uma nova versão da PWA. Nenhuma dependência é descarregada em runtime; não há fontes remotas, telemetria ou imagens da Internet.

### Referências para localização das regiões musculares

Os desenhos SVG são originais e esquemáticos. A referência descritiva de localização é OpenStax, *Anatomy & Physiology*, capítulo 11: [parede abdominal e tórax](https://openstax.org/books/anatomy-and-physiology/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax) e [cintura escapular e membros superiores](https://openstax.org/books/anatomy-and-physiology/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs). A consulta destas referências não constitui validação profissional do atlas ou da prescrição de exercícios.

### Ilustrações de execução

A interface dá prioridade a um boneco na posição do exercício. As flexões clássicas mostram uma prancha com as mãos no chão e, no segundo botão, a descida com os cotovelos fletidos. Flexões de joelhos e de parede têm apoios distintos. Agachamentos, lunges, ponte de glúteos, bird dog e outros movimentos têm referências próprias. O mapa muscular continua disponível em «Ver músculos trabalhados».

O módulo cobre **136 entradas da biblioteca** com desenhos SVG originais, incluindo referências de posição base partilhadas entre variantes. Uma referência partilhada é identificada explicitamente e deve ser complementada pelas instruções da variante. Não se afirma que uma imagem da flexão clássica demonstra uma flexão arqueiro, uma rotação ou um salto. As **42 entradas sem referência adequada** mantêm o mapa muscular e indicam que a ilustração específica está em preparação; não recebem uma pose aleatória. Os botões mudam entre imagens estáticas e não são uma animação ou uma contagem de repetições.

As poses são esquemáticas, não clinicamente validadas. Os testes de coordenadas verificam apenas coerência estrutural e apoios fundamentais; não substituem revisão profissional. Referências de técnica consultadas: [Mayo Clinic — flexão modificada](https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/modified-pushup/vid-20084674) e [ACE — biblioteca de exercícios](https://www.acefitness.org/resources/everyone/exercise-library/). Os desenhos não reproduzem imagens destas fontes.

### Correção da orientação sonora

O relógio passa a devolver os indicadores de mudança de etapa e de segundo ao consumidor, além do callback. O treinador também reconhece a etapa pelo seu identificador para não perder anúncios após avanço/recuo manual. A ativação inicial da fala é feita a partir do toque de início/teste e os bips só são emitidos após ativação do contexto de áudio. O pedido de manter o ecrã ligado não bloqueia o arranque do relógio.

Cada exercício temporizado é anunciado pelo nome, número da série e repetições previstas. A contagem completa é a predefinição; por exemplo, 15 repetições produzem quinze chamadas, de «um» a «quinze». Há 6 segundos iniciais reservados dentro do tempo de execução para o anúncio, e a última chamada ocorre 2 segundos antes do fim. O contador no ecrã usa a mesma função de cadência. Os números não cancelam a fala inicial e os avisos de cinco segundos não interrompem a contagem. Em planos antigos com muitas repetições num intervalo curto, a cadência pode ser mais rápida; os novos planos/edições continuam a validar os limites de tempo. A contagem é orientação prevista, nunca deteção de movimentos reais.

O som dos bips foi reforçado, mantendo o controlo de volume. O botão «Testar som: bips e voz» mostra o estado do contexto e a voz instalada. A confirmação «Última fala iniciada» provém do evento nativo de início da voz, não apenas da tentativa de reprodução. Testar o som durante um treino pausa a sessão para não misturar o exemplo com as instruções. O volume/mute do sistema, a saída de áudio e a audição física não são verificáveis pela aplicação.

Verificação no navegador: voz Joana pt-PT local disponível, contexto de áudio ativo e evento de início da fala de teste recebido. A sessão já existente foi recuperada e mantida em pausa, sem avançar etapas nem acrescentar resultados físicos.

### Aquecimento sem caminhada

O aquecimento não contém marchas, caminhadas ou deslocações. A ativação inicial usa «Saltos militares de aquecimento» (jumping jacks), começando com ritmo suave. Com baixo impacto ativo, usa «Saltos militares adaptados (sem salto)», abrindo um pé de cada vez no mesmo lugar. As transferências em Cossack mantêm os pés fixos; o anterior inchworm foi substituído por prancha dinâmica com elevação da bacia e apoios fixos. Exclusões e dificuldade continuam a ser respeitadas.

Ao abrir um treino guardado antigo, as referências de aquecimento com caminhada são substituídas, mantendo séries, intervalos e duração total. Esta preferência nova sobrepõe-se à repetição do aquecimento antigo. Na recuperação de uma sessão em curso, só se atualizam etapas de aquecimento ainda por cumprir; as etapas já passadas e o histórico de execuções mantêm-se.

### Objetivo de repetições e bips de cadência

As flexões e restantes exercícios configurados por repetições passam a ter um objetivo calculado com base no intervalo, nível e dificuldade da variante, em vez de um teto fixo de 10/12/14. Por exemplo, no nível iniciante, 45 segundos propõem 15 flexões. É uma proposta de ritmo editável, não uma previsão da capacidade física individual. Isometrias e movimentos por tempo mantêm o temporizador.

Durante um exercício por repetições, o objetivo e a contagem aparecem em destaque (`0 / 15`, `1 / 15`, …), com o tempo restante em tamanho menor. Cada incremento tem um bip de cadência. Os bips adicionais dos últimos cinco segundos são omitidos nestas etapas para não serem confundidos com repetições. O bip de início/transição continua a ser um sinal separado, antes da cadência.

A contagem partilha o relógio com o ecrã, pausa e retoma com a sessão. Objetivos automáticos são recalculados após alterações de tempo; um valor de repetições explicitamente editado fica identificado como manual. Ao abrir planos antigos, recalculam-se os objetivos sem marcação manual; numa sessão em curso, apenas se atualizam séries ainda não iniciadas. Não há alteração da duração dos intervalos, descansos ou sessão. AMRAP continua ao ritmo individual, com confirmação manual, sem inventar uma cadência imposta à janela inteira.

### Perfil avançado inspirado no circuito de referência

O nível avançado deixa de significar apenas «permitir todas as dificuldades». O motor distingue complexidade técnica de exigência da sessão: agachamentos clássicos podem continuar no WOD com maior volume, enquanto elevações em Y/T/W/I, mobilidade escapular e movimentos leves de braços são classificados como ativação e retirados dos blocos principais avançados. As elevações em Y podem aparecer no aquecimento. Substituições, regeneração e inclusão manual respeitam o mesmo filtro. A biblioteca continua a disponibilizar os movimentos de ativação para outros níveis/contextos.

Full Body, Circuito funcional e Treino misto avançados incluem um bloco de referência com **burpees, lunges, flexões, agachamentos e sit-ups**. As séries principais são mais longas, preservando o tempo total. Num exemplo de 60 minutos com 5 minutos de aquecimento e 5 de retorno à calma, o bloco A tem duas voltas de cinco exercícios, 75s de execução e 15s de descanso por exercício, somando 15 minutos. Os objetivos são 17 burpees, 34 lunges, 27 flexões, 34 agachamentos e 20 sit-ups por volta. Não se copiam 20/40/30/40/20 para intervalos em que essa cadência não cabe; intervalos mais longos permitem aproximar esses números. Em AMRAP, as quantidades de referência são objetivos por volta, confirmados ao ritmo do utilizador, sem imposição de uma duração individual por exercício.

Os restantes blocos mantêm alternância muscular, variantes exigentes e trabalho da cadeia posterior/ombros. Sem equipamento, esse bloco posterior continua limitado a estabilização, extensão e dobradiças; não é apresentado como equivalente de puxadas com carga. «Baixo impacto» mantém alternativas sem saltos, incluindo burpees sem salto, sem regressar a elevações leves dos braços como trabalho principal. Esta programação é uma regra geral do produto e continua sujeita à revisão profissional já descrita.

### Mountain climbers e abdominais com apoio

A biblioteca inclui mountain climbers normais, lentos e cruzados, também pesquisáveis por «Escaladores em prancha». Já existiam crunches, bicycle crunches, tesouras deitado, tuck-ups e Russian twists com os pés apoiados. Foram acrescentadas quatro variantes distintas: tesouras verticais com apoio nos antebraços, encolhimentos de joelhos sentado com apoio das mãos, Russian twists com pés elevados sem carga e elevações de joelhos com apoio nos antebraços. Cada uma tem instruções, convenção de contagem, alternativas, mapa muscular e posições SVG próprias. Bicycle crunches também recebeu ilustração específica.

A identificação das fotografias é descritiva e, no caso inferior direito, apenas provável: uma fotografia não confirma a sequência de execução ou se «3×30» significa segundos ou repetições. Não foram importadas promessas de transformação corporal, cargas ou quantidades do anúncio. A variante Russian twist mantém-se sem carga, de acordo com a regra de treino sem equipamento. Referências descritivas consultadas: [biblioteca de exercícios da Universidade de Keele](https://www.keele.ac.uk/study/campuslife/sportatkeele/activekeele/exerciselibrary/) e [Russian twist — NASM](https://www.nasm.org/resource-center/exercise-library/russian-twist). Continua pendente a revisão técnica profissional das ilustrações e da programação.

### Correção de gravação em Safari / iPhone (v1.7.1)

O armazenamento mantém a chave `bodywod.v1`, com um formato interno compacto que partilha subárvores JSON iguais (exercícios, etapas e planos). A leitura aceita os dados antigos; a primeira gravação bem-sucedida converte-os sem eliminar registos. Na leitura, cada referência é reconstruída independentemente para preservar as cópias históricas. Os backups exportados continuam em JSON completo, versão 1, compatíveis com a importação existente. Depois de migrar, usar esta versão ou posterior: versões antigas não compreendem o formato interno compacto.

Num cenário de teste com um treino avançado de 60 minutos repetido em dez registos, plano guardado e sessão, a estimativa UTF-16 passou de 3108 KB para 87 KB (97% de redução). Esta medida não determina a quota efetiva de um dispositivo nem confirma a causa do erro observado no iPhone. O Safari pode recusar operações por quota ou permissões; a aplicação distingue essas exceções e apresenta o nome do erro nas definições.

Se uma escrita falhar, o estado mais recente permanece em memória, disponível na exportação, sem declarar a gravação concluída. O último conteúdo persistido não é apagado. Um aviso permanente oferece exportação e nova tentativa; as tentativas automáticas após falha têm intervalo de 30 segundos. Fechar/recarregar pode perder alterações apenas em memória. Se a leitura inicial falhar, a aplicação impede escritas para não substituir dados antigos que não conseguiu ler.

Validação: 61 testes, incluindo quota simulada, permissões bloqueadas, getter de localStorage que lança exceção, migração, preservação das versões históricas, repetição/exportação/recuperação, e gravação compacta numa quota que rejeita os dados antigos. Interface verificada no navegador local com viewport 390 × 844; não foi efetuado teste num iPhone físico. O ficheiro autónomo `BodyWOD.html` foi reconstruído. A cópia publicada em GitHub Pages precisa de receber esse ficheiro atualizado.

### Avançado com maior densidade (v1.8.0)

Mantêm-se os três níveis e as regras dos níveis iniciante e intermédio. O avançado aumenta as metas de repetições e usa 10 segundos de recuperação entre exercícios. No EMOM avançado são 55 segundos de execução e 5 de recuperação; o AMRAP mantém execução livre e contagens confirmadas pelo utilizador.

Nas flexões dinâmicas do avançado, a cadência é 1 repetição a cada 1,5 segundos, com uma pausa de 10 segundos após cada grupo de 15. O gerador reserva janelas de 120 segundos quando o bloco tem espaço; em blocos mais curtos adapta a janela sem ultrapassar a duração pedida. As janelas incluem 6 segundos de preparação, os bips de execução e as pausas: uma janela de 120 segundos permite 56 repetições, com o último bip aos 118,5 segundos. O contador fica parado nas pausas, o cronómetro mostra a recuperação e a voz anuncia a pausa e o regresso. Flexões lentas, excêntricas e com pausa mantêm cadência própria; isometrias não recebem contagem dinâmica.

Exemplo Full Body avançado, 60 minutos com 5 de retorno à calma: bloco A de 15 minutos, duas voltas de 21 burpees / 70s, 42 lunges / 70s, 56 flexões / 120s, 42 agachamentos / 70s e 32 sit-ups / 70s, com 10s entre exercícios. As pausas internas das flexões estão incluídas nos 120s. A contagem é um ritmo proposto, não repetições detetadas nem uma avaliação individual. O ecrã recomenda manter amplitude e técnica e abrandar ou pausar quando necessário.

Os planos novos recebem as janelas maiores. Ao recuperar uma sessão antiga, apenas as metas de etapas futuras podem ser atualizadas: etapas já iniciadas e tempos guardados não são reprogramados. Para obter a distribuição nova de dois minutos, gerar um novo treino avançado. Backups e histórico mantêm os protocolos no plano; a recuperação dentro de uma pausa permanece em pausa.

### Versão visível da aplicação

O rodapé de todos os ecrãs mostra `Versão 1.01` em pequeno. A fonte única é `src/version.js`, independente da versão do formato de dados. Em cada nova alteração entregue, executar `npm run release` uma vez: incrementa 1.01 → 1.02 → 1.03 e reconstrói o HTML. Para repetir a compilação da mesma alteração, usar `npm run build`, que não incrementa. O build sincroniza a versão da cache offline e inclui a versão no HTML autónomo.

### Avançado em todos os exercícios — versão 1.02

Esta revisão substitui a prioridade especial das flexões por uma distribuição comum a todos os movimentos principais. O gerador usa menos voltas e janelas maiores (até 120s), mantendo o tempo total escolhido. Num Full Body de 60 minutos, as janelas dos blocos principais ficam aproximadamente entre 110 e 120s, incluindo o cardio por tempo e as isometrias. Em sessões curtas, as janelas adaptam-se ao tempo disponível; não são acrescentados minutos ao treino.

Todos os exercícios principais por repetições têm agora perfil explícito de cadência e pausa por grupos: normalmente 1,5s por repetição, 2s em movimentos mais complexos e da cadeia posterior, 3s em burpees/inchworm, e 3,5s nas variantes explicitamente lentas, excêntricas ou com pausa. Os grupos têm 15 repetições (10 nos burpees/inchworm), seguidos de 10s de recuperação interna. O mesmo perfil controla metas, bips, voz e contador, com os valores reais apresentados na pré-visualização e durante a execução. As flexões deixam de receber uma reserva exclusiva de 120s em detrimento dos outros exercícios.

Isometrias e cardio por tempo permanecem sem contagem inventada de repetições: recebem janelas maiores e recuperação entre exercícios de 10s. EMOM conserva 55s/5s e os perfis de repetições dentro do minuto. AMRAP mantém ritmo livre: dois grupos de repetições por movimento e referências de 60s para execução por tempo, sem contagem automática de voltas. Aquecimento, retorno à calma, iniciante e intermédio conservam as regras anteriores.

Validação: 72 testes, incluindo todos os perfis avançados elegíveis, bips e pausas em cada perfil, cobertura das seis categorias musculares, isometrias/cardio, tempos exatos, modalidades, edição e recuperação. O novo gerador exige criar um novo treino; sessões já iniciadas não são redistribuídas.

### Pronúncia — versão 1.03

A camada de voz envia `Fléxões` ao sintetizador para pedir o é aberto solicitado pelo utilizador. A transformação abrange nomes, avisos de próximos exercícios e o teste de som. A escrita dos exercícios, dados guardados e textos apresentados continua `Flexões`; apenas o texto da fala recebe a adaptação. A realização sonora depende da voz pt-PT instalada e pode ser ouvida através de «Testar som: bips e voz». Validado o texto enviado à API de voz e a preservação dos textos de apresentação.

### Abertura direta no Safari do Mac — versão 1.04

O `index.html` anterior era a entrada modular de desenvolvimento. Ao abri-lo diretamente como ficheiro local, o Safari não carregava os módulos JavaScript e a página ficava vazia. A compilação gera agora **dois ficheiros autónomos idênticos**, `index.html` e `BodyWOD.html`, ambos com CSS e JavaScript incorporados. Qualquer um pode ser aberto como ficheiro ou servido por HTTP/HTTPS, sem alterar as permissões do navegador. O modelo modular foi movido para `src/shell.html`, usado apenas como entrada da compilação. Editar o modelo e os módulos, depois executar o build; não editar os dois HTML gerados manualmente.

O formato de armazenamento e os registos guardados não foram alterados. Abrir por ficheiro e abrir por HTTP/HTTPS pode usar espaços de armazenamento diferentes do navegador; a aplicação não transfere automaticamente dados entre esses contextos.
