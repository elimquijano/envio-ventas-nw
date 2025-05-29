# Procesador de Ventas y Tickets Offline para MySQL

Este script de Node.js está diseñado para procesar datos de ventas y tickets almacenados localmente (en el archivo `common.js`) e insertarlos en una base de datos MySQL. Utiliza transacciones para asegurar la integridad de los datos durante la inserción de ventas y sus detalles.

## Características Principales

*   **Inserción de Ventas:** Inserta registros de ventas en la tabla `ventas` y sus correspondientes detalles en la tabla `detalle_ventas`.
*   **Inserción de Tickets:** Inserta registros de tickets en la tabla `tickets`.
*   **Transacciones MySQL:** Utiliza transacciones para las operaciones de ventas, asegurando que una venta y todos sus detalles se inserten correctamente o no se inserte nada en caso de error (atomicidad).
*   **Manejo de Duplicados:** Detecta e informa si una venta ya existe en la base de datos (basado en `ER_DUP_ENTRY`).
*   **Configuración Flexible:** La configuración de la base de datos se gestiona a través de variables de entorno (archivo `.env`).
*   **Procesamiento Secuencial:** Procesa los arrays de ventas y tickets de forma secuencial.

## Requisitos Previos

*   Node.js (v14 o superior recomendado)
*   npm (Node Package Manager) o Yarn
*   Un servidor MySQL accesible
*   Un archivo `common.js` en la misma ruta que el script principal, exportando los arrays `ventas_offline` y `offline_tickets`.

## Estructura de Archivos Esperada

```bash
├── index.js # Script principal (este código)
├── common.js # Archivo con los datos offline
├── package.json
├── .env # Archivo de configuración (no subir a Git)
└── node_modules/
```


## Instalación y Configuración

1.  **Clona el repositorio (si aplica):**
    ```bash
    git clone https://github.com/elimquijano/envio-ventas-nw.git
    cd envio-ventas-nw
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install dotenv mysql2
    # o si usas yarn:
    # yarn add dotenv mysql2
    ```

3.  **Crea el archivo `.env`:**
    En la raíz de tu proyecto, crea un archivo llamado `.env` y añade tus credenciales de base de datos:
    ```env
    DB_HOST=tu_host_mysql
    DB_USER=tu_usuario_mysql
    DB_PASS=tu_password_mysql
    DB_NAME=tu_base_de_datos
    ```
    Asegúrate de que este archivo esté en tu `.gitignore` para no subir información sensible.

4.  **Prepara tu archivo `common.js`:**
    Este archivo debe exportar dos arrays: `ventas_offline` y `offline_tickets`.
    Ejemplo de `common.js`:
    ```javascript
    // common.js
    export const ventas_offline = [
      {
        id: "V001",
        cliente_id: "C001",
        negocio_id: "N001",
        caja_id: "CAJA01",
        user_id: "U001",
        total: 150.75,
        serie: "A",
        numero_folio: "123", // Corresponde a 'numero' en la tabla
        folio: "A-123",
        created_at: "2023-10-26T10:00:00Z",
        detalles_venta: [
          { id: "P001", quantity: 2, total: 100.50, moneda: "MXN" },
          { id: "P002", quantity: 1, total: 50.25, moneda: "MXN" },
        ],
      },
      // ... más ventas
    ];

    export const offline_tickets = [
      {
        barcode: "TICKET001",
        tipo_id: 1,
        caja_id: "CAJA01",
        user_id: "U001",
        negocio_id: "N001",
        quantity: 1,
        unit_price: 25.00,
        code: "PROMO_XYZ",
        created_at: "2023-10-26T11:00:00Z",
      },
      // ... más tickets
    ];
    ```
    **Importante:** Asegúrate de que los campos en estos objetos coincidan con los esperados por las funciones `insertVenta` e `insertTicket` y las columnas de tus tablas.

## Uso

Para ejecutar el script, navega al directorio del proyecto en tu terminal y ejecuta:

```bash
node index.js