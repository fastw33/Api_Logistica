# Módulo experimental de cotización logística IA

## Diseño técnico resumido

- **Módulo principal**: `experimentalQuotes`
- **Persistencia**:
  - `experimental_quotes`
  - `experimental_quote_items`
  - `experimental_quote_traces`
- **Motores separados**:
  - validación: `experimentalQuote.validation.js`
  - selección de servicio: `experimentalQuote.selector.js`
  - cálculo: `experimentalQuote.calculator.js`
  - peso aéreo: `airWeightCalculation.service.js`
  - formateo/salidas: `experimentalQuote.formatter.js`
  - tarifario interno: `internalTariff.service.js` + `fastwayInternalTariff.json`

## Estructura de archivos

- `experimentalQuote.model.js`
- `experimentalQuote.service.js`
- `experimentalQuote.controller.js`
- `experimentalQuote.routes.js`
- `experimentalQuote.validator.js`
- `experimentalQuote.selector.js`
- `experimentalQuote.validation.js`
- `experimentalQuote.calculator.js`
- `experimentalQuote.formatter.js`
- `experimentalQuote.serializer.js`
- `airWeightCalculation.service.js`
- `internalTariff.service.js`
- `fastwayInternalTariff.json`
- `__tests__/`

## Endpoints

- `GET /api/experimental-logistics-quotes`
- `GET /api/experimental-logistics-quotes/:id`
- `POST /api/experimental-logistics-quotes`
- `POST /api/experimental-logistics-quotes/calculate`
- `POST /api/experimental-logistics-quotes/:id/calculate`
- `PATCH /api/experimental-logistics-quotes/:id`
- `DELETE /api/experimental-logistics-quotes/:id`

## Ejemplo de payload de cálculo

```json
{
  "cliente": "Global Safety Supplies SAS",
  "source_customer_id": "123",
  "tipo_servicio": "AEREO",
  "modalidad": "GENERAL",
  "service_variant": "GENERAL",
  "incoterm": "FOB",
  "origen": "Shanghai, China",
  "destino": "Bogotá, Colombia",
  "aeropuerto_origen": "PVG",
  "aeropuerto_destino": "BOG",
  "mercancia": "Insumos de seguridad industrial",
  "mercancia_peligrosa": false,
  "numero_piezas": 4,
  "peso_real": 180,
  "valor_comercial": 15000,
  "moneda": "USD",
  "dimension_items": [
    { "quantity": 2, "length": 120, "width": 80, "height": 75 },
    { "quantity": 2, "length": 100, "width": 70, "height": 60 }
  ],
  "provider_pricing_mode": "ITEMIZED",
  "provider_currency": "USD",
  "provider_quote_reference": "Q-77821",
  "provider_charges": [
    {
      "concept": "Freight PVG-BOG",
      "charge_type": "variable",
      "base_type": "kg_vol",
      "quantity": 180,
      "unit_value": 2.9,
      "is_confirmed": true
    },
    {
      "concept": "Screening",
      "total": 35,
      "is_confirmed": true
    }
  ],
  "extra_not_included": [
    "Seguro internacional opcional"
  ],
  "persist": true
}
```

## Ejemplo de respuesta abreviada

```json
{
  "message": "Cotización experimental calculada correctamente",
  "data": {
    "id": 1,
    "quote_number": "EXP-CT-000001",
    "servicio_interno_aplicado": "aereo_general",
    "estado": "CALCULADA",
    "total_proveedor": "557.00",
    "total_fast_way": "240.00",
    "total_cliente": "797.00",
    "commercial_quote_json": {
      "text": "COTIZACIÓN - AEREO\n..."
    },
    "internal_table_json": {
      "rows": []
    },
    "math_report_json": {
      "provider": [],
      "fast_way": []
    }
  }
}
```

## Notas de integración

- Si se quiere usar como vista previa sin persistencia, enviar `"persist": false` a `POST /calculate`.
- El módulo no depende de CT/DO actuales.
- Sí puede convivir con ellos y usarse como motor experimental previo a la CT formal.
- El snapshot de tarifario queda guardado dentro de `tarifario_snapshot`.
