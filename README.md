# Arquivo 13

Protótipo de um jogo competitivo de investigação para 3 a 6 jogadores. Cada detetive entra em uma sala, investiga locais, interroga suspeitos e tenta ser o primeiro a acusar corretamente o criminoso.

## Executar

Abra `index.html` em qualquer navegador moderno. Não há dependências nem etapa de instalação. Se preferir servir por HTTP, execute `node serve.mjs` e acesse `http://127.0.0.1:4173`.

Para testar uma partida, crie uma sala, adicione pelo menos dois detetives simulados e clique em **Abrir o caso**.

## Modelo da partida

- **Lobby:** código compartilhável, 3–6 jogadores, dificuldade escolhida pelo anfitrião.
- **Partida:** cinco rodadas, duas ações por jogador em cada rodada.
- **Ações:** investigar um local, interrogar um suspeito ou realizar uma acusação.
- **Informação:** pistas são inicialmente privadas, incentivando blefe e negociação.
- **Vitória:** acusar corretamente rende 100 XP e encerra a partida. Uma acusação errada custa 20 XP.
- **Desempate:** caso ninguém acerte até o fim, vence quem acumulou mais XP de investigação.

## Caminho para multiplayer real

O protótipo atual usa jogadores simulados no navegador. Para produção, a interface pode ser conectada a um servidor WebSocket usando este estado autoritativo:

```text
Room { code, hostId, status, round, turnPlayerId, players[], caseId }
Player { id, name, score, connected, privateClueIds[] }
Match { actionsLeft, investigatedIds[], accusations[], winnerId }
```

Eventos principais: `room:create`, `room:join`, `match:start`, `turn:action`, `clue:share`, `accusation:submit`, `turn:end` e `match:end`. O criminoso e a validação das acusações devem existir somente no servidor para evitar trapaça.
