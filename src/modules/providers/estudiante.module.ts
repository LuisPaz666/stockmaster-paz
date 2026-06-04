import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstudianteService } from '../../modules/services/estudiante.service';
import { EstudianteController } from '../../modules/controllers/estudiante.controller';
import { Estudiante } from '../../modules/entities/estudiante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Estudiante])],
  controllers: [EstudianteController],
  providers: [EstudianteService],
  exports: [EstudianteService, TypeOrmModule],
})
export class EstudianteModule {}
