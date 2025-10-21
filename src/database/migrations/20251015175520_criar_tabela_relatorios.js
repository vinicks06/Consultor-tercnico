/**
 * @param { import("knex").Knex } knex
 */
exports.up = function(knex) {
    return knex.schema.createTable('relatorios', (table) => {
      table.increments('id').primary();
      table.timestamp('data_geracao').notNullable().defaultTo(knex.fn.now());
      table.string('nome_arquivo', 255).notNullable();
      
      // Dados de Entrada do Usuário
      table.string('setor', 255).notNullable();
      table.string('tecnologia', 255).notNullable();
      table.text('problema').notNullable();
      table.text('performance').notNullable();
      
      // Resposta da IA
      table.text('diagnostico_geral');
      table.text('proposta_otimizacao');
      table.jsonb('plano_acao'); 
      table.text('metricas_esperadas');
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   */
  exports.down = function(knex) {
    return knex.schema.dropTable('relatorios');
  };