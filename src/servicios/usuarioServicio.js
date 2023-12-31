import { Service } from "../clases/Servicios.js";
import { usuario } from "../db/usuario.js";
import bcrypt from "bcrypt";
import { generarId } from "../helper/generarId.js";
import { restaurarContraseñaMailer } from "../helper/email.js";
import { verificacionCorreo } from "../helper/emailVerificar.js";

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
      data.role = "ESTUDIANTE";

      const nuevoUsuario = await this.database.crear(data);

      await verificacionCorreo(nuevoUsuario);

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

      data.nombre = data.nombre + " " + data.apellido;
      delete data.apellido;

      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
      data.role = "MAESTRO";
      data.tokenEmail = generarId();
      data.tokenVerificar = "";

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

      if (!usuarioEncontrado) return { error: "usuario_no_encontrado" };

      if (usuarioEncontrado.tokenVerificar) {
        return { error: "cuenta_no_verificada" };
      }

      const contraseñaValida = await bcrypt.compare(
        password,
        usuarioEncontrado.password
      );

      if (!contraseñaValida) return { error: "credenciales_incorrectas" };

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
      if (!payload) return { error: "usuario_no_encontrado" };

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

  restaurarContraseña = async (data) => {
    try {
      const usuario = await this.database.encontrarPorObjeto({
        email: data.email,
      });

      if (!usuario) return { error: "usuario_no_encontrado" };

      const tokenEmail = generarId();

      await this.database.actualizarUno({ tokenEmail }, usuario.id);

      await restaurarContraseñaMailer(usuario, tokenEmail);

      return true;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  changePassword = async (data) => {
    try {
      const { token, password, confirm_password } = data;

      const usuario = await this.database.encontrarPorObjeto({
        tokenEmail: token,
      });

      if (!usuario) return { error: "token_invalido" };

      if (password !== confirm_password)
        return { error: "contrasena_no_coincide" };

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const { id } = usuario;

      const mappedData = {
        tokenEmail: "",
        password: hashedPassword,
      };

      const payload = await this.database.actualizarUno(mappedData, id);

      delete payload.token;
      delete payload.password;

      return payload;
    } catch (error) {
      throw error;
    }
  };

  verificarToken = async (token) => {
    const tokenEmail = await this.database.encontrarPorObjeto({
      tokenEmail: token,
    });

    if (!tokenEmail) throw { error: "El token es invalido" };
  };

  estadisticasCoordinacion = async () => {
    try {
      const estadisticas = await usuario.estadisticasCoordinacion();
      return estadisticas;
    } catch (error) {
      throw error;
    }
  };

  estadisticasEstudiante = async (id) => {
    try {
      const estadistias = await usuario.estadisticasEstudiante(id);
      return estadistias;
    } catch (error) {
      throw error;
    }
  };
  verificarCorreo = async (data) => {
    try {
      const user = await usuario.encontrarPorObjeto({
        tokenVerificar: data.token,
      });
      if (!user) return { error: "token_error" };
      const updateuser = await usuario.actualizarUno(
        { tokenVerificar: "" },
        user.id
      );
      return updateuser;
    } catch (error) {
      throw error;
    }
  };
}

const usuarioServicio = new UsuarioService(usuario);

export { usuarioServicio };
