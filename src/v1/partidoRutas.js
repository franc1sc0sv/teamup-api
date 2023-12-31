import { Router } from "express";
import { autentifiacion } from "../middleware/autentificacion.js";
import { __ROL__ } from "../constantes/roles.js";
import { partidoControlador } from "../controladores/partidosControlador.js";
import { esLiderDeEquipo } from "../middleware/esLiderDeEquipo.js";

export const partidoRouter = Router();

partidoRouter.get(
  "/estudiante/aceptar-resultado/:id",
  autentifiacion(__ROL__.ESTUDIANTE),
  partidoControlador.aceptarResultados
);
partidoRouter.get(
  "/estudiante/cancelar-resultado/:id",
  autentifiacion(__ROL__.ESTUDIANTE),
  partidoControlador.cancelarResultado
);

partidoRouter.post(
  "/estudiante/rival/aceptar/:id",
  autentifiacion(__ROL__.ESTUDIANTE),
  partidoControlador.aceptarSolicitudRival
);

partidoRouter.get(
  "/miembros/:id",
  autentifiacion(__ROL__.ESTUDIANTE),
  partidoControlador.obtenerMiembrosPartido
);

partidoRouter.post(
  "/enviar-resultado/:id",
  autentifiacion(__ROL__.TODOS),
  partidoControlador.enviarResultados
);

partidoRouter.get(
  "/asistencia/:id",
  autentifiacion(__ROL__.TODOS),
  partidoControlador.colocarAsistencia
);
partidoRouter.get(
  "/cancelar/:id",
  autentifiacion(__ROL__.TODOS),
  partidoControlador.cancelarPartido
);

partidoRouter.get(
  "/maestro/cuidar",
  autentifiacion(__ROL__.MAESTRO),
  partidoControlador.obtenerPartidosCuidarMaestro
);

partidoRouter.post(
  "/coordinacion/aceptar/:id",
  autentifiacion(__ROL__.COORDINADOR),
  partidoControlador.aceptarPartidoCoordinador
);

partidoRouter.get(
  "/zonadejuegos/:id",
  autentifiacion(__ROL__.COORDINADOR),
  partidoControlador.partidosZonaJuegosHabilitados
);

partidoRouter.post(
  "/coordinacion/posponer/:id",
  autentifiacion(__ROL__.COORDINADOR),
  partidoControlador.posponerFecha
);

partidoRouter.get(
  "/coordinacion/rechazar/:id",
  autentifiacion(__ROL__.COORDINADOR),
  partidoControlador.rechazarSolicitudCoordinacion
);

partidoRouter.get(
  "/maestro/aceptar/:id",
  autentifiacion(__ROL__.MAESTRO),
  partidoControlador.aceptarPartidoMaestro
);

partidoRouter.get(
  "/pendientes",
  autentifiacion(__ROL__.MAESTRO),
  partidoControlador.obtenerSolicitudesPendientes
);

partidoRouter.get(
  "/coordinacion/pendientes",
  autentifiacion(__ROL__.COORDINADOR),
  partidoControlador.obtenerPartidosCoordinacion
);

partidoRouter.get(
  "/estudiante/cancelar/:id",
  autentifiacion(__ROL__.ESTUDIANTE),
  partidoControlador.cancelarPartido
);

partidoRouter
  .route("/:id")
  .post(
    autentifiacion(__ROL__.ESTUDIANTE),
    esLiderDeEquipo,
    partidoControlador.crearSolicitudLocal
  )
  .get(autentifiacion(__ROL__.TODOS), partidoControlador.obtenerUno)
  .patch(autentifiacion(__ROL__.TODOS), partidoControlador.actualizarUno)
  .delete(autentifiacion(__ROL__.ESTUDIANTE), partidoControlador.eliminarUno);

partidoRouter
  .route("/")
  .get(
    autentifiacion(__ROL__.ESTUDIANTE),
    partidoControlador.obtenerPartidosPorUsuario
  );
