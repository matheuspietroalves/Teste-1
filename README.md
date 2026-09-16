# Bedrock JSON UI Editor V1

Primeira versão, feita para uso no celular e publicação no GitHub Pages.

## Como usar
1. Abra `index.html` no navegador (ou publique a pasta no GitHub Pages).
2. Toque em **Demo** para testar.
3. Selecione `STATUS`.
4. Arraste o STATUS na prévia ou altere X/Y no painel.
5. Use **Exportar JSON** para salvar.

## Importante
Esta V1 usa um formato de preview simplificado:
`{ screen: {width,height}, elements: [...] }`

Ela NÃO converte automaticamente um `menus.json` real do Minecraft Bedrock ainda.
A próxima versão pode adicionar um importador específico para a estrutura de JSON UI da sua V12 e exportar de volta sem destruir o restante do arquivo.

## GitHub Pages
Suba os arquivos para um repositório e ative Settings → Pages → Deploy from a branch → main → /root.
