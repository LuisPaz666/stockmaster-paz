import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estudiante } from '../../modules/entities/estudiante.entity';
import { CreateEstudianteDto } from '../../modules/dto/create-estudiante.dto';

@Injectable()
export class EstudianteService {
  constructor(
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
  ) {}

  async create(dto: CreateEstudianteDto): Promise<Estudiante> {
    const existe = await this.estudianteRepository.findOne({
      where: { codigo: dto.codigo },
    });

    if (existe) {
      throw new ConflictException(
        `Ya existe un estudiante con el código "${dto.codigo}"`,
      );
    }

    const estudiante = this.estudianteRepository.create(dto);
    return await this.estudianteRepository.save(estudiante);
  }

  async findAll(): Promise<Estudiante[]> {
    return await this.estudianteRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Estudiante> {
    const estudiante = await this.estudianteRepository.findOne({ where: { id } });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
    }

    return estudiante;
  }
}
