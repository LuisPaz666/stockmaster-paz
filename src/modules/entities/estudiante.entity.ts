import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('estudiantes')
export class Estudiante {
  @ApiProperty({ example: 1, description: 'ID único del estudiante' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'Juan', description: 'Nombre del estudiante' })
  @Column({ length: 100 })
  nombre!: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del estudiante' })
  @Column({ length: 100 })
  apellido!: string;

  @ApiProperty({ example: '2024-001', description: 'Código único del estudiante' })
  @Column({ length: 50, unique: true })
  codigo!: string;
}
