'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables()
    const normalized = tables.map(table =>
      typeof table === 'string' ? table : table.tableName || table.TABLE_NAME
    )

    if (!normalized.includes('experimental_quotes')) {
      await queryInterface.createTable('experimental_quotes', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        quote_number: {
          type: Sequelize.STRING(50),
          allowNull: true,
          unique: true,
        },
        cliente: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        source_customer_id: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        tipo_servicio_solicitado: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        modalidad: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        service_variant: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        servicio_interno_aplicado: {
          type: Sequelize.STRING(150),
          allowNull: true,
        },
        incoterm: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        origen: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        destino: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        puerto_origen: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        puerto_destino: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        aeropuerto_origen: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        aeropuerto_destino: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        mercancia: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        mercancia_peligrosa: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        numero_piezas: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        volumen: {
          type: Sequelize.DECIMAL(18, 3),
          allowNull: true,
        },
        peso_real: {
          type: Sequelize.DECIMAL(18, 3),
          allowNull: true,
        },
        peso_volumetrico: {
          type: Sequelize.DECIMAL(18, 3),
          allowNull: true,
        },
        peso_cobrable: {
          type: Sequelize.DECIMAL(18, 3),
          allowNull: true,
        },
        valor_comercial: {
          type: Sequelize.DECIMAL(18, 2),
          allowNull: true,
        },
        numero_guias: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        numero_shippers: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        numero_contenedores: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        container_size: {
          type: Sequelize.STRING(10),
          allowNull: true,
        },
        moneda: {
          type: Sequelize.STRING(10),
          allowNull: false,
          defaultValue: 'USD',
        },
        provider_pricing_mode: {
          type: Sequelize.ENUM('NONE', 'FINAL_TOTAL', 'ITEMIZED'),
          allowNull: false,
          defaultValue: 'NONE',
        },
        provider_quote_reference: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        provider_quote_valid_until: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        total_proveedor: {
          type: Sequelize.DECIMAL(18, 2),
          allowNull: false,
          defaultValue: 0,
        },
        total_fast_way: {
          type: Sequelize.DECIMAL(18, 2),
          allowNull: false,
          defaultValue: 0,
        },
        total_cliente: {
          type: Sequelize.DECIMAL(18, 2),
          allowNull: false,
          defaultValue: 0,
        },
        estado: {
          type: Sequelize.ENUM(
            'BORRADOR',
            'CALCULADA',
            'REQUIERE_VALIDACION_MANUAL',
            'ERROR_VALIDACION'
          ),
          allowNull: false,
          defaultValue: 'BORRADOR',
        },
        requiere_validacion_manual: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        motivo_validacion_manual: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        observaciones: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        no_incluidos: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        tarifario_snapshot: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        detalle_calculo_json: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        validation_result_json: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        commercial_quote_json: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        internal_table_json: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        math_report_json: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        request_payload_json: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        updated_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
      })
    }

    if (!normalized.includes('experimental_quote_items')) {
      await queryInterface.createTable('experimental_quote_items', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        experimental_quote_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'experimental_quotes',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        role: {
          type: Sequelize.ENUM('PROVIDER', 'FAST_WAY', 'NOT_INCLUDED'),
          allowNull: false,
        },
        concept: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        category: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        charge_type: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        base_type: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        base_value: {
          type: Sequelize.DECIMAL(18, 3),
          allowNull: true,
        },
        quantity: {
          type: Sequelize.DECIMAL(18, 3),
          allowNull: true,
        },
        rate_value: {
          type: Sequelize.DECIMAL(18, 6),
          allowNull: true,
        },
        minimum_value: {
          type: Sequelize.DECIMAL(18, 6),
          allowNull: true,
        },
        total_value: {
          type: Sequelize.DECIMAL(18, 2),
          allowNull: true,
        },
        included_in_total: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        confirmed: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        currency: {
          type: Sequelize.STRING(10),
          allowNull: false,
          defaultValue: 'USD',
        },
        operation_text: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        metadata_json: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
      })
    }

    if (!normalized.includes('experimental_quote_traces')) {
      await queryInterface.createTable('experimental_quote_traces', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        experimental_quote_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'experimental_quotes',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        event_type: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        detail_json: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
      })
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables()
    const normalized = tables.map(table =>
      typeof table === 'string' ? table : table.tableName || table.TABLE_NAME
    )

    if (normalized.includes('experimental_quote_traces')) {
      await queryInterface.dropTable('experimental_quote_traces')
    }
    if (normalized.includes('experimental_quote_items')) {
      await queryInterface.dropTable('experimental_quote_items')
    }
    if (normalized.includes('experimental_quotes')) {
      await queryInterface.dropTable('experimental_quotes')
    }
  },
}
