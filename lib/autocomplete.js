import fzy from 'fzy.js';

export function filter(list, query, map = i => i) {
  return query ? list.filter(i => fzy.hasMatch(query, map(i))).sort((a, b) => fzy.score(query, map(b)) - fzy.score(query, map(a))) : list;
}

export async function global(interaction) {
  const globals = await interaction.client.db.Global.find();
  return interaction.respond(filter(
    globals,
    interaction.options.getFocused().toLowerCase(),
    g => g.name.toLowerCase()
  ).map(g => ({ name: g.name, value: g.name })).slice(0, 25));
}