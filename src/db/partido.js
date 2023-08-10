import { Database } from "../clases/BaseDeDatos.js";
import { prisma } from "../config/db.js";
import { __ESTADOS_PARTIDOS__ } from "../constantes/datosEstaticosDB.js";
import { errorJSON } from "../helper/index.js";
import { misPartidosWhere, partidoSelect, partidosPendientes } from "../querys/partidos.js";
import { equipo } from "./equipo.js";

class PartidoDB extends Database {
  obtenerSolicitudesPorEstado = async (estado) => {
    try {
      const payload = await prisma[this.tabla].findMany({
        where: { id_estado: parseInt(estado) },
      });
      return payload;
    } catch (error) {
      throw { status: "FAILED", data: { error: error?.message || error } };
    }
  };
  obtenerPartidosProximosMaestros = async (estado, id_usuarioMaestro) => {
    try {
      const payload = await prisma[this.tabla].findMany({
        where: {
          AND: [
            { id_estado: parseInt(estado) },
            { id_usuarioMaestro: parseInt(id_usuarioMaestro) },
          ],
        },
      });
      return payload;
    } catch (error) {
      throw { status: "FAILED", data: { error: error?.message || error } };
    }
  };
  verificarSiEquipoJuegaMaestros = async (estado, id) => {
    try {
      const payload = await prisma[this.tabla].findMany({
        where: {
          AND: [{ id_estado: parseInt(estado) }, { id_equip: id }],
        },
        include: {
          usuariosPartidos: {
            select: {
              nombre: true,
            },
          },
        },
      });
      return payload;
    } catch (error) {
      throw { status: "FAILED", data: { error: error?.message || error } };
    }
  };


  //Mi DB :)
  obtenerPartidosPorUsuario = async (id_usuario) => {
    try {
      const equipos = await equipo.obtenerEquiposDelUsuario(id_usuario);
      const equipos_ids = equipos.map((equipo) => equipo.id);

      const partidos = await prisma.partidos.findMany({
        where: misPartidosWhere(equipos_ids, id_usuario),
        select: partidoSelect,
      });

      if (!partidos.length)
        throw {
          status: "FAILED",
          data: { error: "No hay partidos", code: "pa1" },
        };
        
      return partidos;
    } catch (error) {
      throw error;
    }
  };

  obtenerSolicitudesPendientes = async()=>{
    try {
      const partidos = await prisma.partidos.findMany({
        where: {
          id_estado: __ESTADOS_PARTIDOS__.PendienteMaestro.id
        },
        select: partidosPendientes
      })

      if(!partidos) return null;

      return partidos;
    } catch (error) {
      throw error
    }
  }

  aceptarPartidoMaestro = async (id, id_estado, id_usuarioMaestro) => {

    try {
      const partido = await prisma.partidos.update({
        where: {id},
        data: {id_estado, id_usuarioMaestro},
        include: this.includes
      })

      if(!partido) return null;

      return partido
    
    } catch (error) {
      throw error 
    }
  }

  obtenerPartidosCoordinacion = async () => { 
    try {
      const partidos = await prisma.partidos.findMany({
        where: {
          id_estado: __ESTADOS_PARTIDOS__.PendienteCoordinacion.id
        },
        select: partidosPendientes
      })

      return partidos;
    } catch (error) {
      throw error;
    }
   }
}

const Partido = new PartidoDB("Partidos", {
  deporte: true,
  equipo_local: true,
  equipo_visitante: true,
  estado: true,
  usuarioMaestro: true,
  ZonaDejuego: true,
});

export { Partido };