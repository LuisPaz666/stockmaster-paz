import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from '../../modules/entities/user.entity';
import { CreateUserDto } from '../../modules/dto/create-user.dto';
import { LoginDto } from '../../modules/dto/login.dto';
import { JwtPayload } from '../../modules/strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const existe = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existe) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const usuario = this.usersRepository.create({
      ...dto,
      password: passwordHash,
    });
    await this.usersRepository.save(usuario);

    const { password: _pw, ...resultado } = usuario;
    void _pw;
    return resultado;
  }

  async login(dto: LoginDto) {
    const usuario = await this.usersRepository.findOne({
      where: { email: dto.email, isActive: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordValida = await bcrypt.compare(dto.password, usuario.password);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };
    const access_token = this.jwtService.sign(payload);

    const refreshPayload = {
      sub: usuario.id,
      email: usuario.email,
      type: 'refresh',
    };
    const refresh_token = this.jwtService.sign(refreshPayload, {
      expiresIn: 7 * 24 * 60 * 60,
    });

    await this.usersRepository.update(usuario.id, {
      refreshToken: refresh_token,
    });

    return {
      access_token,
      refresh_token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    };
  }

  async getProfile(userId: number) {
    const usuario = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!usuario) throw new UnauthorizedException();
    const { password: _pw, ...perfil } = usuario;
    void _pw;
    return perfil;
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);

      const usuario = await this.usersRepository.findOne({
        where: { id: decoded.sub },
      });

      if (!usuario || usuario.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token inválido o expirado');
      }

      const payload: JwtPayload = {
        sub: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol,
        },
      };
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async logout(userId: number) {
    await this.usersRepository.update(userId, { refreshToken: null });

    return {
      message: 'Sesión cerrada correctamente',
    };
  }
}
