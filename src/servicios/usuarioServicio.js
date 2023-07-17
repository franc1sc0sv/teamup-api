import { Service } from "../clases/Servicios.js";
import { usuario } from "../db/usuario.js";
import bcrypt from "bcrypt";

class UsuarioService extends Service {
  crearCuentaEstudiante = async (data) => {
    try {
      const { email } = data;
      const mismoUsuario = await this.database.buscarUsuarioPorEmail({
        email,
      });

      if (mismoUsuario) {
        return null;
      }

      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);

      const nuevoUsuario = this.database.crear(data);
      return nuevoUsuario;
    } catch (error) {
      throw error;
    }
  };
  crearCuentaMaestro = async (data) => {
    try {
      const { email } = data;
      const mismoUsuario = await this.database.buscarUsuarioPorEmail({
        email,
      });
      if (mismoUsuario) return null;

      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
      data.role = "MAESTRO";
      const nuevoUsuario = this.database.crear(data);

      return nuevoUsuario;
    } catch (error) {
      throw error;
    }
  };
  buscarUsuarioPorCredenciales = async (datos) => {
    try {
      const { email, password } = datos;

      const usuarioEncontrado = await this.database.buscarUsuarioPorEmail({
        email,
      });

      if (!usuarioEncontrado) return { error: "Usuario no encontrado" };

      const contraseñaValida = await bcrypt.compare(
        password,
        usuarioEncontrado.password
      );

      if (!contraseñaValida) return { error: "Credenciales incorrectas" };

      return usuarioEncontrado;
    } catch (error) {
      throw error;
    }
  };
  actualizarDatosUsuario = async (data, id) => {
    try {
      if (data.password) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);
      }
      if (data.id_nivelAcademico) {
        data = {
          ...data,
          nivelAcademico: {
            updateMany: {
              where: {
                id_estudiante: id,
              },
              data: {
                id_nivelAcademico: data.id_nivelAcademico,
              },
            },
          },
        };
        delete data.id_nivelAcademico;
      }
      console.log(data);

      const payload = await this.database.actualizarUno(data, id);
      return payload;
    } catch (error) {
      throw error;
    }
  };
  obtenerUsuarios = async () => {
    try {
      const payload = await this.database.obtenerUsuarios();
      
      return payload;
    } catch (error) {
      throw error;
    }
  };
  obtenerUnUsuario = async (id) => {
    try {
      const payload = await this.database.obtenerUnUsuario(id);

      if (!payload) return { error: "El usuario no existe" };


      return payload;
    } catch (error) {
      throw error;
    }
  };
  obtenerMaestros = async () => {
    try {
      
      const payload = await usuario.obtenerMaestros();
      
      return payload;

    } catch (error) {
      throw error;
    }
  };
}

const usuarioServicio = new UsuarioService(usuario);

export { usuarioServicio };
