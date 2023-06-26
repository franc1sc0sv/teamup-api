import { Controller } from "../clases/Controlador.js";
import { usuarioServicio } from "../servicios/usuarioServicio.js";

import {
  usuarioEsquema,
  usuarioEsquemaActualizar,
  usuarioLogeoEsquema,
} from "../esquemas/usuariosEsquemas.js";

import { ZodError } from "zod";
import { mostrarZodError } from "../esquemas/utils.js";
import jwt from "jsonwebtoken";

class UsuarioController extends Controller {
  buscarUsuarioPorCredenciales = async (req, res) => {
    try {
      const rawdata = req.body;
      const datosValidos = usuarioLogeoEsquema.parse(rawdata);
      const usuarioEncontrado = await this.service.buscarUsuarioPorCredenciales(
        datosValidos
      );

      if (usuarioEncontrado.error)
        return res
          .status(401)
          .json({ status: "FAILED", data: { error: usuarioEncontrado.error } });

      const token = jwt.sign(
        {
          id: usuarioEncontrado.id,
        },
        process.env.JWT_SECRET
      );

      return res.status(200).json({
        ...usuarioEncontrado,
        token,
      });
    } catch (error) {
      console.log(error);
      if (error instanceof ZodError) {
        const zodError = mostrarZodError(error);

        return res
          .status(400)
          .json({ status: "FAILED", data: { error: zodError } });
      }

      return res.status(500).json(error);
    }
  };
  actualizarDatosUsuario = async (req, res) => {
    const { id } = req.usuario;
    const rawdata = req.body;
    try {
      const data = this.zodUpdateSchema.parse(rawdata);
      const payload = await this.service.actualizarDatosUsuario(data, id);
      return res.status(200).json({ status: "OK", data: payload });
    } catch (error) {
      if (error instanceof ZodError) {
        const zodError = mostrarZodError(error);

        return res
          .status(400)
          .json({ status: "FAILED", data: { error: zodError } });
      }
      return res.status(500).json(error);
    }
  };
  crearCuentaEstudiante = async (req, res) => {
    const rawdata = req.body;
    try {
      const data = this.zodSchema.parse(rawdata);
      const payload = await this.service.crearCuentaEstudiante(data);

      if (!payload) {
        return res
          .status(400)
          .json({ status: "FAILED", data: { error: "El usuario ya existe" } });
      }

      return res.status(201).json({ status: "OK", data: payload });
    } catch (error) {
      if (error instanceof ZodError) {
        const zodError = mostrarZodError(error);

        return res
          .status(400)
          .json({ status: "FAILED", data: { error: zodError } });
      }

      return res.status(500).json(error);
    }
  };
  crearCuentaMaestro = async (req, res) => {
    const rawdata = req.body;
    try {
      const data = this.zodSchema.parse(rawdata);
      const payload = await this.service.crearCuentaMaestro(data);

      if (!payload) {
        return res
          .status(400)
          .json({ status: "FAILED", data: { error: "El usuario ya existe" } });
      }

      return res.status(201).json({ status: "OK", data: payload });
    } catch (error) {
      console.log(error);

      if (error instanceof ZodError) {
        const zodError = mostrarZodError(error);

        return res
          .status(400)
          .json({ status: "FAILED", data: { error: zodError } });
      }

      return res.status(500).json(error);
    }
  };
  obtenerUsuarios = async (req, res) => {
    try {
      const payload = await this.service.obtenerUsuarios();
      return res.status(200).json({ status: "OK", data: payload });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  };
  obtenerUnUsuario = async (req, res) => {
    try {
      const { id } = req.params;
      const payload = await this.service.obtenerUnUsuario(id);
      if (payload.error)
        return res
          .status(400)
          .json({ status: "FAILED", data: { error: payload.error } });

      return res.status(200).json({ status: "OK", data: payload });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  };
}

const usuarioControlador = new UsuarioController(
  usuarioEsquema,
  usuarioEsquemaActualizar,
  usuarioServicio
);

export { usuarioControlador };
