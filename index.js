import { config } from "dotenv";
import mysql from "mysql2/promise";
import { ventas_offline, offline_tickets } from "./common.js";

config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

async function insertVenta(venta) {
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    await conn.beginTransaction();

    // Insert venta
    await conn.query(
      `INSERT INTO ventas (id, cliente_id, negocio_id, caja_id, user_id, total,
        serie, numero, folio, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        venta.id,
        venta.cliente_id,
        venta.negocio_id,
        venta.caja_id,
        venta.user_id,
        venta.total,
        venta.serie,
        venta.numero_folio,
        venta.folio,
        venta.created_at,
        venta.created_at,
      ]
    );

    // Insert detalles
    for (const detalle of venta.detalles_venta) {
      await conn.query(
        `INSERT INTO detalle_ventas (quantity, total, moneda, producto_id, venta_id,
          created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          detalle.quantity,
          detalle.total,
          detalle.moneda,
          detalle.id,
          venta.id,
          venta.created_at,
          venta.created_at,
        ]
      );
    }

    await conn.commit();
    console.log(`Venta ${venta.id} insertada correctamente`);
  } catch (error) {
    if (conn) await conn.rollback();

    if (error.code === "ER_DUP_ENTRY") {
      console.log(`Venta ${venta.id} ya existe en la base de datos`);
    } else {
      console.error(`Error al insertar venta ${venta.id}:`, error.message);
    }
  } finally {
    if (conn) await conn.end();
  }
}

async function insertTicket(ticket) {
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    await conn.beginTransaction();

    // Insert ticket
    await conn.query(
      `INSERT INTO tickets (barcode, tipo_id, caja_id, user_id, negocio_id, quantity, unit_price, total, code, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticket.barcode,
        ticket.tipo_id,
        ticket.caja_id,
        ticket.user_id,
        ticket.negocio_id,
        ticket.quantity,
        ticket.unit_price,
        ticket.quantity * ticket.unit_price,
        ticket.code,
        ticket.created_at,
        ticket.created_at,
      ]
    );

    await conn.commit();
    console.log(`Ticket ${ticket.barcode} insertado correctamente`);
  } catch (error) {
    if (conn) await conn.rollback();

    console.error(`Error al insertar ticket ${ticket.barcode}:`, error.message);
  } finally {
    if (conn) await conn.end();
  }
}

// Procesar ventas secuencialmente
async function procesarVentas() {
  for (const venta of ventas_offline) {
    await insertVenta(venta);
  }
  console.log("Proceso de ventas completado");
}

// Procesar tickets secuencialmente
async function procesarTickets() {
  for (const ticket of offline_tickets) {
    await insertTicket(ticket);
  }
  console.log("Proceso de tickets completado");
}

// Iniciar el procesamiento de ventas y tickets
procesarVentas().catch(console.error);
//procesarTickets().catch(console.error);
